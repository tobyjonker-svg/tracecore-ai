import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";

const COOKIE_NAME = 'session';
const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;

function getQueryParam(req: Request, key: string): string | undefined {
  const value = req.query[key];
  return typeof value === "string" ? value : undefined;
}

export function registerOAuthRoutes(app: Express) {
  app.get("/api/oauth/login", (req: Request, res: Response) => {
    res.redirect('/app/login');
  });

  app.post("/api/auth/local-signin", async (req: Request, res: Response) => {
    try {
      const { email, name } = req.body;
      if (!email) {
        res.status(400).json({ error: "email is required" });
        return;
      }
      const user = await db.upsertUser({
        openId: `local-${email}`,
        name: name || email.split('@')[0],
        email: email,
        loginMethod: 'local',
        lastSignedIn: new Date(),
      });
      const userRecord = await db.getUserByOpenId(`local-${email}`);
      if (userRecord) {
        const existingWorkspace = await db.getWorkspaceByUserId(userRecord.id);
        if (!existingWorkspace) {
          await db.createWorkspace(userRecord.id, `${name || email.split('@')[0]}'s Workspace`);
        }
      }
      const sessionToken = await sdk.createSessionToken(`local-${email}`, {
        name: name || email.split('@')[0],
        expiresInMs: ONE_YEAR_MS,
      });
      const cookieOptions = getSessionCookieOptions(req, false);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      res.json({ success: true, redirectUrl: '/app' });
    } catch (error) {
      console.error("[Auth] Local sign-in failed", error);
      res.status(500).json({ error: "Local sign-in failed" });
    }
  });

  app.get("/api/oauth/callback", async (req: Request, res: Response) => {
    res.redirect(302, "/app");
  });
}
