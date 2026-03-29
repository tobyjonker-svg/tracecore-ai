import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";
import { ENV } from "./env";

const COOKIE_NAME = 'session';
const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;

function getQueryParam(req: Request, key: string): string | undefined {
  const value = req.query[key];
  return typeof value === "string" ? value : undefined;
}

export function registerOAuthRoutes(app: Express) {
  // Login endpoint - returns the OAuth portal URL
  app.get("/api/oauth/login", (req: Request, res: Response) => {
    try {
      // Use the origin parameter from frontend if provided, otherwise fall back to req.get('host')
      const frontendOrigin = getQueryParam(req, 'origin');
      const host = frontendOrigin ? new URL(frontendOrigin).host : req.get('host');
      // Always use HTTPS for OAuth redirect URI (req.protocol may be http through proxy)
      const protocol = frontendOrigin ? new URL(frontendOrigin).protocol.replace(':', '') : 'https';
      const redirectUri = `${protocol}://${host}/api/oauth/callback`;
      console.log('[OAuth] Redirect URI:', redirectUri);
      const state = Buffer.from(redirectUri).toString('base64');
      const oauthPortalUrl = "https://auth.manus.im";
      const appId = ENV.appId;
      
      if (!appId) {
        console.error("[OAuth] appId not configured");
        return res.status(500).json({ error: "OAuth not configured" });
      }
      
      const url = new URL(`${oauthPortalUrl}/app-auth`);
      url.searchParams.set("appId", appId);
      url.searchParams.set("redirectUri", redirectUri);
      url.searchParams.set("state", state);
      url.searchParams.set("type", "signIn");
      
      res.json({ loginUrl: url.toString() });
    } catch (error) {
      console.error("[OAuth] Failed to generate login URL", error);
      res.status(500).json({ error: "Failed to generate login URL" });
    }
  });

  // Local sign-in endpoint for development/testing when OAuth is unavailable
  app.post("/api/auth/local-signin", async (req: Request, res: Response) => {
    try {
      const { email, name } = req.body;
      
      if (!email) {
        res.status(400).json({ error: "email is required" });
        return;
      }

      // Create or update user with local authentication
      const user = await db.upsertUser({
        openId: `local-${email}`,
        name: name || email.split('@')[0],
        email: email,
        loginMethod: 'local',
        lastSignedIn: new Date(),
      });

      // Get the user to get their ID
      const userRecord = await db.getUserByOpenId(`local-${email}`);
      if (userRecord) {
        // Check if user already has a workspace
        const existingWorkspace = await db.getWorkspaceByUserId(userRecord.id);
        if (!existingWorkspace) {
          // Create a workspace for the user
          await db.createWorkspace(userRecord.id, `${name || email.split('@')[0]}'s Workspace`);
        }
      }

      // Create session token
      const sessionToken = await sdk.createSessionToken(`local-${email}`, {
        name: name || email.split('@')[0],
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      res.json({ success: true, redirectUrl: '/app' });
    } catch (error) {
      console.error("[Auth] Local sign-in failed", error);
      res.status(500).json({ error: "Local sign-in failed" });
    }
  });

  app.get("/api/oauth/callback", async (req: Request, res: Response) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");

    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }

    try {
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);

      if (!userInfo.openId) {
        res.status(400).json({ error: "openId missing from user info" });
        return;
      }

      await db.upsertUser({
        openId: userInfo.openId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
        lastSignedIn: new Date(),
      });

      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      res.redirect(302, "/");
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });
}
