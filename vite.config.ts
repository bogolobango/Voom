import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Helper to safely load optional Replit plugins
const loadReplitPlugins = async () => {
  const plugins = [];
  try {
    const { default: themePlugin } = await import("@replit/vite-plugin-shadcn-theme-json");
    plugins.push(themePlugin());
  } catch (e) {
    // Plugin not available, skip
  }
  try {
    const { default: runtimeErrorOverlay } = await import("@replit/vite-plugin-runtime-error-modal");
    plugins.push(runtimeErrorOverlay());
  } catch (e) {
    // Plugin not available, skip
  }
  if (process.env.REPL_ID !== undefined) {
    try {
      const { cartographer } = await import("@replit/vite-plugin-cartographer");
      plugins.push(cartographer());
    } catch (e) {
      // Plugin not available, skip
    }
  }
  return plugins;
};

export default defineConfig(async () => {
  const replitPlugins = await loadReplitPlugins();
  
  return {
    plugins: [
      react(),
      ...replitPlugins,
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "client", "src"),
        "@shared": path.resolve(__dirname, "shared"),
      },
    },
    root: path.resolve(__dirname, "client"),
    build: {
      outDir: path.resolve(__dirname, "dist/public"),
      emptyOutDir: true,
    },
    server: {
      proxy: {
        "/api": {
          target: "http://localhost:5000",
          changeOrigin: true,
        },
      },
    },
  };
});
