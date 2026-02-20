import { execSync } from "child_process";

// Force a clean install of all dependencies
try {
  console.log("Running npm install...");
  execSync("npm install", {
    cwd: "/vercel/share/v0-project",
    stdio: "inherit",
    timeout: 120000,
  });
  console.log("npm install completed successfully");
} catch (error) {
  console.error("npm install failed:", error.message);
  process.exit(1);
}
