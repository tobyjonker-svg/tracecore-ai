import { Express, Request, Response } from "express";
import * as db from "../db";

const ADMIN_KEY = process.env.ADMIN_LOGIN_KEY || "tcai-admin-2026-secure";

export function registerAdminLoginRoute(app: Express) {
  app.get("/api/admin-login", async (req: Request, res: Response) => {
    try {
      const key = req.query.key as string;
      if (!key || key !== ADMIN_KEY) {
        res.status(403).json({ error: "Forbidden" });
        return;
      }
      const user = await db.getUserByEmail("toby@tracecoreai.co.za");
      if (!user) { res.status(404).json({ error: "Not found" }); return; }
      (req as any).session.userId = user.id;
      res.redirect("/app");
    } catch (error) {
      res.status(500).json({ error: "Failed" });
    }
  });
}
