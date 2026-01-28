/* eslint-disable no-undef */
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const http = require("http");
const https = require("https");

const downloadsDir = path.join(__dirname, "..", "downloads");
const assetsDir = path.join(__dirname, "..", "assets");

const components = [
  {
    id: "kernel",
    url: "https://cdn.kernel.org/pub/linux/kernel/v6.x/linux-6.6.10.tar.xz",
    extract: true,
  },
  {
    id: "busybox",
    url: "https://busybox.net/downloads/busybox-1.36.1.tar.bz2",
    extract: true,
  },
  {
    id: "alpine",
    url: "https://dl-cdn.alpinelinux.org/alpine/v3.18/releases/x86_64/alpine-minirootfs-3.18.4-x86_64.tar.gz",
    extract: true,
  },
  {
    id: "busybox-wasm",
    url: "https://github.com/wasmerio/wasmer/releases/download/3.1.0/wasmer-linux-amd64.tar.gz",
    extract: true,
    optional: true,  // Make this optional since CDN is unreliable
  },
];

async function downloadFile(url, dest, retries = 3) {
  console.log(`Downloading ${url} to ${dest}`);
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await axios.get(url, { 
        responseType: "stream",
        timeout: 60000, // 60 seconds timeout
        maxRedirects: 5,
        // Set larger timeout for slow CDN connections
        httpAgent: new http.Agent({ timeout: 60000 }),
        httpsAgent: new https.Agent({ timeout: 60000, rejectUnauthorized: false }),
        // Add headers to avoid CDN blocks
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      const writer = fs.createWriteStream(dest);
      
      // Set a timeout for the entire download
      const downloadTimeout = setTimeout(() => {
        writer.destroy(new Error("Download timeout exceeded"));
        response.data.destroy();
      }, 300000); // 5 minutes total timeout
      
      response.data.pipe(writer);
      
      return new Promise((resolve, reject) => {
        writer.on("finish", () => {
          clearTimeout(downloadTimeout);
          resolve();
        });
        writer.on("error", (err) => {
          clearTimeout(downloadTimeout);
          // Clean up the partial file
          try {
            fs.unlinkSync(dest);
          } catch (e) {
            // Ignore cleanup errors
          }
          reject(err);
        });
        response.data.on("error", (err) => {
          clearTimeout(downloadTimeout);
          writer.destroy();
          reject(err);
        });
      });
    } catch (error) {
      console.error(`Attempt ${attempt}/${retries} failed for ${url}:`, error.message);
      
      // Clean up on error
      try {
        if (fs.existsSync(dest)) {
          fs.unlinkSync(dest);
        }
      } catch (e) {
        // Ignore cleanup errors
      }
      
      if (attempt === retries) {
        throw error;
      }
      
      // Exponential backoff: 1s, 2s, 4s
      const delay = Math.pow(2, attempt - 1) * 1000;
      console.log(`Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

async function extractTar(file, dest) {
  console.log(`Extracting ${file} to ${dest}`);
  const { spawn } = require("child_process");
  const ext = path.extname(file);
  let cmd, args;
  if (ext === ".xz") {
    cmd = "tar";
    args = ["-xf", file, "-C", dest];
  } else if (ext === ".bz2") {
    cmd = "tar";
    args = ["-xjf", file, "-C", dest];
  } else if (ext === ".gz") {
    cmd = "tar";
    args = ["-xzf", file, "-C", dest];
  }
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args);
    
    let errorOutput = "";
    child.stderr.on("data", (data) => {
      errorOutput += data.toString();
    });
    
    const extractTimeout = setTimeout(() => {
      child.kill("SIGKILL");
      reject(new Error(`Extraction timeout for ${file}`));
    }, 600000); // 10 minutes timeout
    
    child.on("close", (code) => {
      clearTimeout(extractTimeout);
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Extraction failed with code ${code}: ${errorOutput}`));
      }
    });
    child.on("error", (err) => {
      clearTimeout(extractTimeout);
      reject(err);
    });
  });
}

async function prebuild() {
  if (!fs.existsSync(downloadsDir))
    fs.mkdirSync(downloadsDir, { recursive: true });
  if (!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir, { recursive: true });

  for (const comp of components) {
    const fileName = path.basename(comp.url);
    const filePath = path.join(downloadsDir, fileName);
    const extractDir = path.join(downloadsDir, comp.id);

    if (!fs.existsSync(filePath)) {
      try {
        await downloadFile(comp.url, filePath);
      } catch (error) {
        console.error(`Error downloading ${comp.id}:`, error.message);
        // For optional assets, warn and continue
        if (comp.optional) {
          console.warn(`⚠️  Warning: Failed to download optional asset ${comp.id}, continuing...`);
          continue;
        }
        throw new Error(`Failed to download ${comp.id}: ${error.message}`);
      }
    }

    if (comp.extract && !fs.existsSync(extractDir)) {
      fs.mkdirSync(extractDir, { recursive: true });
      try {
        await extractTar(filePath, extractDir);
      } catch (error) {
        console.error(`Error extracting ${comp.id}:`, error.message);
        throw new Error(`Failed to extract ${comp.id}: ${error.message}`);
      }
    }

    // Copy to assets for APK inclusion
    const assetPath = path.join(assetsDir, comp.id);
    if (!fs.existsSync(assetPath)) {
      try {
        if (comp.extract) {
          // Copy extracted directory
          fs.cpSync(extractDir, assetPath, { recursive: true });
        } else {
          // Copy file
          fs.mkdirSync(path.dirname(assetPath), { recursive: true });
          fs.copyFileSync(filePath, path.join(assetPath, fileName));
        }
        console.log(`✓ Prepared ${comp.id}`);
      } catch (error) {
        console.error(`Error copying ${comp.id}:`, error.message);
        throw new Error(`Failed to copy ${comp.id}: ${error.message}`);
      }
    }
  }

  console.log("✅ Prebuild completed successfully");
}

// Handle graceful shutdown
process.on("SIGTERM", () => {
  console.error("⚠️ Process terminated");
  process.exit(128);
});

process.on("SIGINT", () => {
  console.error("⚠️ Process interrupted");
  process.exit(128);
});

// Run prebuild and exit with appropriate code
prebuild()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Prebuild failed:", error.message);
    process.exit(1);
  });

prebuild().catch(console.error);
