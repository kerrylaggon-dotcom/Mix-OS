/* eslint-disable no-undef */
const fs = require("fs");
const path = require("path");
const axios = require("axios");

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
    url: "https://registry-cdn.wapm.io/packages/wasmer/busybox/busybox-1.31.1.wasm",
    extract: false,
  },
];

async function downloadFile(url, dest) {
  console.log(`Downloading ${url} to ${dest}`);
  const response = await axios.get(url, { responseType: "stream" });
  const writer = fs.createWriteStream(dest);
  response.data.pipe(writer);
  return new Promise((resolve, reject) => {
    writer.on("finish", resolve);
    writer.on("error", reject);
  });
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
    child.on("close", (code) =>
      code === 0 ? resolve() : reject(new Error(`Extraction failed: ${code}`)),
    );
    child.on("error", reject);
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
      await downloadFile(comp.url, filePath);
    }

    if (comp.extract && !fs.existsSync(extractDir)) {
      fs.mkdirSync(extractDir, { recursive: true });
      await extractTar(filePath, extractDir);
    }

    // Copy to assets for APK inclusion
    const assetPath = path.join(assetsDir, comp.id);
    if (!fs.existsSync(assetPath)) {
      if (comp.extract) {
        // Copy extracted directory
        fs.cpSync(extractDir, assetPath, { recursive: true });
      } else {
        // Copy file
        fs.copyFileSync(filePath, path.join(assetPath, fileName));
      }
    }
  }

  console.log("Prebuild completed");
}

prebuild().catch(console.error);
