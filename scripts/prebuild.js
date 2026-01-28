/**
 * Prebuild Script for Mix-OS
 * 
 * This script prepares the project for EAS build by:
 * 1. Creating necessary directories
 * 2. Generating placeholder files for assets
 * 
 * NOTE: Large assets (QEMU, kernel, code-server) are NOT downloaded here.
 * They will be downloaded at runtime or bundled separately in Phase 3-4.
 * This keeps the APK size manageable and build times fast.
 */

/* eslint-disable no-undef */
const fs = require("fs");
const path = require("path");

const assetsDir = path.join(__dirname, "..", "assets");
const imagesDir = path.join(assetsDir, "images");

// Directories to ensure exist
const requiredDirs = [
  assetsDir,
  imagesDir,
  path.join(assetsDir, "fonts"),
];

// Placeholder files to create if missing
const placeholders = [
  {
    path: path.join(assetsDir, "README.md"),
    content: `# Mix-OS Assets

This directory contains assets for the Mix-OS application.

## Structure

- \`images/\` - App icons, splash screens, and UI images
- \`fonts/\` - Custom fonts (JetBrains Mono loaded via expo-google-fonts)

## VM Assets (Downloaded at Runtime)

The following assets are NOT bundled with the APK to keep size manageable:
- QEMU binary (pre-compiled for ARM64)
- Linux kernel
- Alpine/NixOS rootfs
- code-server binary

These will be downloaded on first run or managed via the Download Manager.
`,
  },
];

function ensureDirectories() {
  console.log("Creating required directories...");
  
  for (const dir of requiredDirs) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`  Created: ${path.relative(process.cwd(), dir)}`);
    }
  }
}

function createPlaceholders() {
  console.log("Creating placeholder files...");
  
  for (const placeholder of placeholders) {
    if (!fs.existsSync(placeholder.path)) {
      fs.writeFileSync(placeholder.path, placeholder.content);
      console.log(`  Created: ${path.relative(process.cwd(), placeholder.path)}`);
    }
  }
}

function verifyRequiredAssets() {
  console.log("Verifying required assets...");
  
  const requiredImages = [
    "icon.png",
    "splash-icon.png",
    "favicon.png",
  ];
  
  const missing = [];
  
  for (const image of requiredImages) {
    const imagePath = path.join(imagesDir, image);
    if (!fs.existsSync(imagePath)) {
      missing.push(image);
    }
  }
  
  if (missing.length > 0) {
    console.warn(`\n⚠️  Missing required images in assets/images/:`);
    missing.forEach(img => console.warn(`   - ${img}`));
    console.warn(`\nPlease add these images before building.\n`);
    // Don't fail - EAS build will handle missing assets
  } else {
    console.log("  All required images present");
  }
}

function printSummary() {
  console.log("\n" + "=".repeat(50));
  console.log("Prebuild Summary");
  console.log("=".repeat(50));
  console.log(`
✅ Directories prepared
✅ Placeholder files created
✅ Asset verification complete

Next steps:
1. Run 'npm run check:types' to verify TypeScript
2. Run 'npm run lint' to check for issues
3. Run 'eas build --platform android --profile preview' to build APK

Note: VM assets (QEMU, kernel, code-server) will be downloaded
at runtime via the Download Manager (Phase 3-4).
`);
}

async function prebuild() {
  console.log("\n🔧 Mix-OS Prebuild Script\n");
  
  try {
    ensureDirectories();
    createPlaceholders();
    verifyRequiredAssets();
    printSummary();
    
    console.log("✅ Prebuild completed successfully\n");
  } catch (error) {
    console.error("\n❌ Prebuild failed:", error.message);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on("SIGTERM", () => {
  console.log("\n⚠️ Process terminated");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("\n⚠️ Process interrupted");
  process.exit(0);
});

// Run prebuild
prebuild();
