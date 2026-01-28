/**
 * Build Script for Mix-OS
 * 
 * This script is for building static web exports (Expo Web).
 * For Android APK builds, use EAS Build instead:
 *   eas build --platform android --profile preview
 * 
 * This script is kept for potential web deployment but is NOT
 * required for the primary Android APK build workflow.
 */

/* eslint-disable no-undef */
const { spawn } = require("child_process");

function printUsage() {
  console.log(`
Mix-OS Build Script

Usage:
  node scripts/build.js [command]

Commands:
  web       Build for web (Expo Web export)
  help      Show this help message

For Android APK builds, use EAS Build:
  eas build --platform android --profile preview   # Development APK
  eas build --platform android --profile production # Production AAB

For local development:
  npm run expo:dev     # Start Expo development server
  npm run server:dev   # Start backend server
`);
}

async function buildWeb() {
  console.log("Building for web...");
  console.log("This will create a static web export.\n");

  return new Promise((resolve, reject) => {
    const child = spawn("npx", ["expo", "export", "--platform", "web"], {
      stdio: "inherit",
      shell: true,
    });

    child.on("close", (code) => {
      if (code === 0) {
        console.log("\n✅ Web build completed!");
        console.log("Output: dist/");
        resolve();
      } else {
        reject(new Error(`Web build failed with code ${code}`));
      }
    });

    child.on("error", (err) => {
      reject(err);
    });
  });
}

async function main() {
  const command = process.argv[2] || "help";

  switch (command) {
    case "web":
      await buildWeb();
      break;
    case "help":
    default:
      printUsage();
      break;
  }
}

main().catch((error) => {
  console.error("Build failed:", error.message);
  process.exit(1);
});
