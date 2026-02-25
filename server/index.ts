import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();

// Body parsing with size limits
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: false, limit: "10mb" }));

// Security headers
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  if (process.env.NODE_ENV === "production") {
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }
  next();
});

// CORS for production
if (process.env.NODE_ENV === "production" && process.env.FRONTEND_URL) {
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin && origin === process.env.FRONTEND_URL) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
      res.setHeader("Access-Control-Allow-Credentials", "true");
    }
    if (req.method === "OPTIONS") return res.sendStatus(204);
    next();
  });
}

// Simple rate limiting for auth/payment endpoints
const rateLimits = new Map<string, { count: number; resetAt: number }>();
const rateLimit = (windowMs: number, maxRequests: number) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const key = `${req.ip}:${req.path}`;
    const now = Date.now();
    const entry = rateLimits.get(key);
    if (!entry || now > entry.resetAt) {
      rateLimits.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }
    entry.count++;
    if (entry.count > maxRequests) {
      return res.status(429).json({ message: "Too many requests, please try again later" });
    }
    next();
  };
};
app.use("/api/auth/login", rateLimit(15 * 60 * 1000, 10));
app.use("/api/auth/register", rateLimit(15 * 60 * 1000, 5));
app.use("/api/payments", rateLimit(60 * 1000, 10));

// Request logging
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  try {
    console.log('[v0] Starting VOOM car sharing platform...');
    console.log('[v0] NODE_ENV:', process.env.NODE_ENV);
    console.log('[v0] app.get("env"):', app.get("env"));

    const server = await registerRoutes(app);
    console.log('[v0] Routes registered successfully');

    // Global error handler
    app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
      const status = (err as any).status || 500;
      const message = process.env.NODE_ENV === "production"
        ? "Internal server error"
        : err.message;
      console.error('[v0] Unhandled error:', err);
      res.status(status).json({ message });
    });

    const env = app.get("env");
    console.log('[v0] Environment check - env:', env, 'isDev:', env === "development");
    
    // Always use Vite in dev/non-production, fallback to static only when dist exists
    if (env !== "production") {
      console.log('[v0] Setting up Vite dev server...');
      try {
        await setupVite(app, server);
        console.log('[v0] Vite dev server setup complete');
      } catch (viteError) {
        console.error('[v0] Failed to setup Vite:', viteError);
        // Try static fallback
        try {
          serveStatic(app);
        } catch {
          console.error('[v0] No static files either - app will 404 on non-API routes');
        }
      }
    } else {
      console.log('[v0] Serving static files (production mode)');
      serveStatic(app);
    }

    const port = 5000;
    server.listen({
      port,
      host: "0.0.0.0",
      reusePort: true,
    }, () => {
      log(`serving on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
  }
})();
