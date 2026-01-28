import type { Express } from "express";
import { createServer, type Server } from "node:http";
import { WebSocketServer } from "ws";
import * as fs from "fs";
import * as path from "path";
import { spawn } from "child_process";
import axios from "axios";
import { storage } from "./storage";
import winston from "winston";
import rateLimit from "express-rate-limit";
import { NativeBridge, registerNativeBridge } from "./native-bridge";

export async function registerRoutes(app: Express): Promise<Server> {
  // Rate limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: "Too many requests from this IP, please try again later.",
  });
  app.use("/api/", limiter);

  // Initialize Native Bridge
  const nativeBridge = new NativeBridge();
  registerNativeBridge(app, nativeBridge);

  // Setup downloads directory
  const downloadsDir = path.join(process.cwd(), "downloads");

  // Downloads API
  app.get("/api/downloads", (req, res) => {
    const downloads = [
      {
        id: "code-server",
        name: "Code Server",
        size: "85MB",
        url: "https://github.com/coder/code-server/releases/download/v4.22.1/code-server-4.22.1-linux-amd64.tar.gz",
      },
      {
        id: "nix",
        name: "Nix Package Manager",
        size: "120MB",
        url: "https://releases.nixos.org/nix/nix-2.18.1/nix-2.18.1-x86_64-linux.tar.xz",
      },
      {
        id: "qemu",
        name: "QEMU",
        size: "200MB",
        url: "https://download.qemu.org/qemu-8.2.0.tar.xz",
      },
      {
        id: "busybox",
        name: "BusyBox",
        size: "2MB",
        url: "https://busybox.net/downloads/busybox-1.36.1.tar.bz2",
      },
      {
        id: "alpine",
        name: "Alpine Linux rootfs",
        size: "50MB",
        url: "https://dl-cdn.alpinelinux.org/alpine/v3.18/releases/x86_64/alpine-minirootfs-3.18.4-x86_64.tar.gz",
      },
      {
        id: "kernel",
        name: "Linux Kernel",
        size: "10MB",
        url: "https://cdn.kernel.org/pub/linux/kernel/v6.x/linux-6.6.10.tar.xz",
      },
      {
        id: "initramfs",
        name: "Initramfs",
        size: "5MB",
        url: "https://example.com/initramfs.cpio.gz",
      }, // Placeholder
      {
        id: "busybox-wasm",
        name: "BusyBox WASM",
        size: "1MB",
        url: "https://registry-cdn.wapm.io/packages/wasmer/busybox/busybox-1.31.1.wasm",
      },
    ];
    res.json(downloads);
  });

  app.post("/api/download/:id", async (req, res) => {
    const { id } = req.params;
    const downloads = {
      "code-server":
        "https://github.com/coder/code-server/releases/download/v4.22.1/code-server-4.22.1-linux-amd64.tar.gz",
      nix: "https://releases.nixos.org/nix/nix-2.18.1/nix-2.18.1-x86_64-linux.tar.xz",
      qemu: "https://download.qemu.org/qemu-8.2.0.tar.xz",
      busybox: "https://busybox.net/downloads/busybox-1.36.1.tar.bz2",
      alpine:
        "https://dl-cdn.alpinelinux.org/alpine/v3.18/releases/x86_64/alpine-minirootfs-3.18.4-x86_64.tar.gz",
      kernel:
        "https://cdn.kernel.org/pub/linux/kernel/v6.x/linux-6.6.10.tar.xz",
      initramfs: "https://example.com/initramfs.cpio.gz",
      "busybox-wasm":
        "https://registry-cdn.wapm.io/packages/wasmer/busybox/busybox-1.31.1.wasm",
    };
    const url = downloads[id as keyof typeof downloads];
    if (!url) return res.status(404).json({ error: "Download not found" });

    const downloadDir = path.join(process.cwd(), "downloads");
    if (!fs.existsSync(downloadDir)) fs.mkdirSync(downloadDir);

    const fileName = path.basename(url);
    const filePath = path.join(downloadDir, fileName);

    try {
      const response = await axios.get(url, { responseType: "stream" });
      const writer = fs.createWriteStream(filePath);
      response.data.pipe(writer);
      writer.on("finish", () =>
        res.json({ status: "downloaded", path: filePath }),
      );
      writer.on("error", (err) => res.status(500).json({ error: err.message }));
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  // Code Server Management
  let codeServerProcess: any = null;

  app.post("/api/code-server/start", (req, res) => {
    if (codeServerProcess) return res.json({ status: "already running" });

    // Assume code-server is downloaded and extracted to downloads/code-server
    const codeServerPath = path.join(
      process.cwd(),
      "downloads",
      "code-server",
      "bin",
      "code-server",
    );
    codeServerProcess = spawn(
      codeServerPath,
      ["--host", "0.0.0.0", "--port", "8080"],
      { stdio: "pipe" },
    );

    codeServerProcess.stdout.on("data", (data: Buffer) => {
      const msg = data.toString();
      broadcast(`stdout: ${msg}`);
    });

    codeServerProcess.stderr.on("data", (data: Buffer) => {
      const msg = data.toString();
      broadcast(`stderr: ${msg}`);
    });

    res.json({ status: "starting" });
  });

  app.post("/api/code-server/stop", (req, res) => {
    if (codeServerProcess) {
      codeServerProcess.kill();
      codeServerProcess = null;
      res.json({ status: "stopped" });
    } else {
      res.json({ status: "not running" });
    }
  });

  app.get("/api/code-server/status", (req, res) => {
    res.json({ running: !!codeServerProcess });
  });

  // Execute command in sandbox
  app.post("/api/execute", async (req, res) => {
    const { command } = req.body;
    if (!command) return res.status(400).json({ error: "Command required" });

    const wasmPath = path.join(downloadsDir, "busybox-1.31.1.wasm");
    if (fs.existsSync(wasmPath)) {
      try {
        // Load WASM module
        const wasmBuffer = fs.readFileSync(wasmPath);
        const wasmModule = await WebAssembly.compile(wasmBuffer);
        const instance = await WebAssembly.instantiate(wasmModule, {
          // Provide WASI or custom imports if needed
          env: {
            memory: new WebAssembly.Memory({ initial: 256 }),
            table: new WebAssembly.Table({ initial: 0, element: "anyfunc" }),
          },
        });

        // For now, just return success - need proper WASI implementation
        res.json({ output: "WASM execution placeholder", code: 0 });
      } catch (error) {
        res.status(500).json({
          error: "WASM execution failed: " + (error as Error).message,
        });
      }
    } else {
      // Fallback to child_process
      try {
        const child = spawn(command, [], { shell: true, cwd: downloadsDir });
        let output = "";
        child.stdout.on("data", (data) => (output += data.toString()));
        child.stderr.on("data", (data) => (output += data.toString()));
        child.on("close", (code) => {
          res.json({ output, code });
        });
      } catch (error) {
        res.status(500).json({ error: (error as Error).message });
      }
    }
  });

  // Environments API
  app.get("/api/environments", async (req, res) => {
    try {
      const envs = await storage.getEnvironments();
      res.json(envs);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.post("/api/environments", async (req, res) => {
    try {
      const { name, type, cpuCores, memoryMB, diskSizeGB } = req.body;
      const env = await storage.createEnvironment({
        name,
        type,
        cpuCores,
        memoryMB,
        diskSizeGB,
      });
      res.json(env);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.get("/api/environments/:id", async (req, res) => {
    try {
      const env = await storage.getEnvironment(req.params.id);
      if (!env) return res.status(404).json({ error: "Environment not found" });
      res.json(env);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.put("/api/environments/:id", async (req, res) => {
    try {
      const updates = req.body;
      const env = await storage.updateEnvironment(req.params.id, updates);
      if (!env) return res.status(404).json({ error: "Environment not found" });
      res.json(env);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.delete("/api/environments/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteEnvironment(req.params.id);
      if (!deleted)
        return res.status(404).json({ error: "Environment not found" });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  // Start/Stop Environment
  app.post("/api/environments/:id/start", async (req, res) => {
    try {
      const env = await storage.getEnvironment(req.params.id);
      if (!env) return res.status(404).json({ error: "Environment not found" });

      if (env.type === "qemu") {
        // Start QEMU VM
        const qemuArgs = [
          "-kernel",
          env.kernelPath ||
            path.join(downloadsDir, "linux-6.6.10", "arch/x86/boot/bzImage"),
          "-initrd",
          env.initramfsPath || path.join(downloadsDir, "initramfs.cpio.gz"),
          "-append",
          "console=ttyS0 root=/dev/ram0",
          "-m",
          env.memoryMB?.toString() || "512",
          "-smp",
          env.cpuCores?.toString() || "1",
          "-drive",
          `file=${path.join(downloadsDir, "disk.img")},format=raw`,
          "-net",
          "nic,model=virtio",
          "-net",
          "user",
          "-serial",
          "stdio",
        ];

        const qemuProcess = spawn("qemu-system-x86_64", qemuArgs, {
          cwd: downloadsDir,
        });
        await storage.updateEnvironment(env.id, {
          status: "running",
          qemuPid: qemuProcess.pid,
        });

        qemuProcess.on("exit", async () => {
          await storage.updateEnvironment(env.id, {
            status: "stopped",
            qemuPid: undefined,
          });
        });

        res.json({ status: "starting" });
      } else {
        res.status(400).json({ error: "Unsupported environment type" });
      }
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.post("/api/environments/:id/stop", async (req, res) => {
    try {
      const env = await storage.getEnvironment(req.params.id);
      if (!env) return res.status(404).json({ error: "Environment not found" });

      if (env.qemuPid) {
        process.kill(env.qemuPid);
        await storage.updateEnvironment(env.id, {
          status: "stopped",
          qemuPid: undefined,
        });
      }

      res.json({ status: "stopped" });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  const httpServer = createServer(app);

  // WebSocket for real-time logs
  const wss = new WebSocketServer({ server: httpServer });
  const clients: Set<any> = new Set();
  wss.on("connection", (ws) => {
    clients.add(ws);
    ws.on("message", (message) => {
      console.log("Received:", message);
    });
    ws.on("close", () => clients.delete(ws));
  });

  // Function to broadcast logs
  const broadcast = (message: string) => {
    winston.info(`Broadcasting: ${message}`);
    clients.forEach((client) => {
      if (client.readyState === 1) client.send(message);
    });
  };

  return httpServer;
}
