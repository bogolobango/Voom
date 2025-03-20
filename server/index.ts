import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
// Import the deployment-adapter only in try/catch block when needed
// This avoids the initial import error if the module has compatibility issues

// Error handlers will be registered dynamically when needed

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

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
    // Development-specific startup code
    console.log('Starting car sharing platform application...');
    
    const server = await registerRoutes(app);

    // Import and use our custom error handler middleware with module compatibility handling
    let errorHandler;
    try {
      // First try with ESM dynamic import
      const errorHandlerModule = await import('./utils/error-handler');
      errorHandler = errorHandlerModule.errorMiddleware;
    } catch (importErr) {
      // If that fails, try to use our compatibility layer
      const importError = importErr as Error;
      console.warn('ESM import failed, trying compatibility layer:', importError.message);
      
      try {
        // Import our format bridge to help with module compatibility
        // Use a properly typed import
        const formatBridgeModule = await import('./utils/format-bridge');
        const formatBridge = formatBridgeModule.default;
        
        // Use the bridge to load the error handler
        // @ts-ignore - dynamically typed module import
        const errorHandlerModule = await formatBridge.importModule('./utils/error-handler');
        
        if (errorHandlerModule) {
          errorHandler = errorHandlerModule.errorMiddleware;
        }
      } catch (bridgeErr) {
        // Last resort: require directly (will only work in CJS mode)
        const bridgeError = bridgeErr as Error;
        console.warn('Bridge import failed, trying direct require:', bridgeError.message);
        try {
          // @ts-ignore - intentional fallback for CJS environments
          const errorHandlerModule = require('./utils/error-handler');
          errorHandler = errorHandlerModule.errorMiddleware;
        } catch (requireErr) {
          console.error('All module loading approaches failed:', requireErr);
        }
      }
    }
    
    // Apply error handler middleware
    if (errorHandler) {
      app.use(errorHandler);
    } else {
      console.error('Failed to load error handler middleware!');
    }

    // importantly only setup vite in development and after
    // setting up all the other routes so the catch-all route
    // doesn't interfere with the other routes
    if (app.get("env") === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    // ALWAYS serve the app on port 5000
    // this serves both the API and the client.
    // It is the only port that is not firewalled.
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
    // Provide detailed error for module format issues
    if (error instanceof Error && 
        (error.message.includes('import.meta') || 
         error.message.includes('require is not defined') ||
         error.message.includes('Cannot use import'))) {
      console.error('Module format compatibility error detected. This could be due to ESM/CJS mismatches.');
    }
  }
})();
