import type { VercelRequest, VercelResponse } from "@vercel/node";
import express from "express";
import { registerRoutes } from "../server/routes";

const app = express();

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: false, limit: "10mb" }));

app.use((_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  next();
});

let ready: Promise<void> | null = null;

function initialize() {
  if (!ready) {
    ready = registerRoutes(app).then(() => {
      // Routes registered — HTTP server returned by registerRoutes is unused
      // in the serverless context (Vercel manages the HTTP layer)
    });
  }
  return ready;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await initialize();

  // Express handles the request
  return new Promise<void>((resolve) => {
    app(req as any, res as any);
    res.on("finish", resolve);
  });
}
