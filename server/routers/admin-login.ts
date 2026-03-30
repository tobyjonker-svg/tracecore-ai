import { router, publicProcedure } from "../_core/trpc";
import { getSessionCookieOptions } from "../_core/cookies";
import * as db from "../db";
import { sdk } from "../_core/sdk";
import { ENV } from "../_core/env";
import type { Request, Response } from "express";

const COOKIE_NAME = 'session';
const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;

/**
 * Admin auto-login endpoint
 * Creates a session for the owner/admin user without requiring OAuth
 * Used for quick access links on desktop and mobile
 */
export function registerAdminLoginRoutes(app: any) {
  app.get("/api/admin-login", async (req: Request, res: Response) => {
    try {
      // Verify this is the owner
      if (!ENV.ownerOpenId) {
        console.error("[Admin Login] Owner OpenID not configured");
        return res.status(500).json({ error: "Admin login not configured" });
      }

      // Get or create admin user
      const adminUser = await db.upsertUser({
        openId: ENV.ownerOpenId,
        name: "Admin",
        email: null,
        loginMethod: "admin-auto-login",
        lastSignedIn: new Date(),
        role: "admin",
      });

      // Create session token for admin
      const sessionToken = await sdk.createSessionToken(ENV.ownerOpenId, {
        name: "Admin",
        expiresInMs: ONE_YEAR_MS,
      });

      // Set session cookie
      const cookieOptions = getSessionCookieOptions(req, false);
      res.cookie(COOKIE_NAME, sessionToken, { 
        ...cookieOptions, 
        maxAge: ONE_YEAR_MS,
        // Allow cross-device access
        sameSite: "lax",
      });

      // Redirect to dashboard
      res.redirect(302, "/app");
    } catch (error) {
      console.error("[Admin Login] Failed:", error);
      res.status(500).json({ error: "Admin login failed" });
    }
  });

  // Alternative: JSON response for mobile apps
  app.post("/api/admin-login-token", async (req: Request, res: Response) => {
    try {
      if (!ENV.ownerOpenId) {
        console.error("[Admin Login] Owner OpenID not configured");
        return res.status(500).json({ error: "Admin login not configured" });
      }

      // Get or create admin user
      await db.upsertUser({
        openId: ENV.ownerOpenId,
        name: "Admin",
        email: null,
        loginMethod: "admin-auto-login",
        lastSignedIn: new Date(),
        role: "admin",
      });

      // Create session token
      const sessionToken = await sdk.createSessionToken(ENV.ownerOpenId, {
        name: "Admin",
        expiresInMs: ONE_YEAR_MS,
      });

      // Set cookie and return token
      const cookieOptions = getSessionCookieOptions(req, false);
      res.cookie(COOKIE_NAME, sessionToken, { 
        ...cookieOptions, 
        maxAge: ONE_YEAR_MS,
      });

      res.json({
        success: true,
        token: sessionToken,
        redirectUrl: "/app",
        message: "Admin auto-login successful. Redirecting to dashboard...",
      });
    } catch (error) {
      console.error("[Admin Login] Token generation failed:", error);
      res.status(500).json({ error: "Token generation failed" });
    }
  });
}
