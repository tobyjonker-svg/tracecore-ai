import { Express, Request, Response } from "express";
import { SignJWT } from "jose";
import { getSessionCookieOptions } from "./cookies";
import { ENV } from "./env";

const JWT_SECRET = new TextEncoder().encode(ENV.cookieSecret);

export function registerAdminLoginRoute(app: Express) {
  app.get("/api/admin-login", async (req: Request, res: Response) => {
    try {
      // Create JWT token for admin user
      const token = await new SignJWT({
        userId: "admin",
        email: "admin@tracecoreai.com",
        role: "admin",
      })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("7d")
        .sign(JWT_SECRET);

      // Get cookie options (mobile-friendly)
      const cookieOptions = getSessionCookieOptions(req, false);

      // Set session cookie with the JWT token
      res.cookie("session", token, {
        ...cookieOptions,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      // Log successful admin login
      console.log("[Admin Login] Session cookie set for admin user");

      // Redirect to dashboard
      res.redirect("/app");
    } catch (error) {
      console.error("[Admin Login] Error:", error);
      res.status(500).json({ error: "Failed to create admin session" });
    }
  });
}
