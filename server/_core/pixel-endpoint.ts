import { Router } from "express";
import * as db from "../db";

/**
 * Pixel endpoint for MycoAlchemy page tracking
 * Returns a 1x1 transparent image and logs page visits for analytics
 */

export function createPixelEndpoint() {
  const router = Router();

  // 1x1 transparent PNG
  const transparentPixel = Buffer.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4,
    0x89, 0x00, 0x00, 0x00, 0x0a, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9c, 0x63, 0x00, 0x01, 0x00, 0x00,
    0x05, 0x00, 0x01, 0x0d, 0x0a, 0x2d, 0xb4, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4e, 0x44, 0xae,
    0x42, 0x60, 0x82,
  ]);

  router.get("/api/pixel", async (req, res) => {
    try {
      const { store, page } = req.query;

      // Log page visit
      if (store && page) {
        try {
          console.log(`[Pixel] Page visit: store=${store}, page=${page}`);
          
          // You can extend this to log to database if needed
          // For now, just log to console
        } catch (error) {
          console.error("[Pixel] Failed to log page visit:", error);
          // Don't fail the request - pixel should always return
        }
      }

      // Return 1x1 transparent PNG
      res.setHeader("Content-Type", "image/png");
      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");
      res.send(transparentPixel);
    } catch (error) {
      console.error("[Pixel] Error:", error);
      // Always return pixel even on error
      res.setHeader("Content-Type", "image/png");
      res.send(transparentPixel);
    }
  });

  return router;
}
