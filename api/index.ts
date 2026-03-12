import type { VercelRequest, VercelResponse } from "@vercel/node";
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "../server/routes";

const app = express();

// Trust Vercel's proxy so secure cookies and rate limiting work correctly
app.set("trust proxy", 1);

// Body parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: false, limit: "10mb" }));

// Security headers
app.use((_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  next();
});

let ready: Promise<void> | null = null;

function initialize() {
  if (!ready) {
    ready = registerRoutes(app).then(() => {
      // Add global error handler after routes are registered
      app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
        console.error("Unhandled error:", err);
        res.status(500).json({ message: "Internal server error" });
      });
    });
  }
  return ready;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await initialize();

  return new Promise<void>((resolve) => {
    app(req as any, res as any);
    res.on("finish", resolve);
  });
}
