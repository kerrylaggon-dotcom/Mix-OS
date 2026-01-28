import type { Express } from "express";
import { createServer, type Server } from "node:http";
import { spawn } from "child_process";

/**
 * Native Bridge Module
 * Facilitates communication between React Native frontend and Node.js backend
 * for low-level operations like process management, QEMU control, etc.
 */

export interface NativeBridgeRequest {
  type: string;
  payload?: Record<string, any>;
}

export interface NativeBridgeResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export class NativeBridge {
  private activeVMs: Map<string, any> = new Map();

  /**
   * Execute native command with elevation/permissions
   */
  async executeNativeCommand(
    command: string,
    args: string[],
    options?: Record<string, any>,
  ): Promise<NativeBridgeResponse> {
    try {
      const child = spawn(command, args, {
        stdio: ["pipe", "pipe", "pipe"],
        ...options,
      });

      let stdout = "";
      let stderr = "";

      child.stdout.on("data", (data) => {
        stdout += data.toString();
      });

      child.stderr.on("data", (data) => {
        stderr += data.toString();
      });

      return new Promise((resolve) => {
        child.on("close", (code) => {
          resolve({
            success: code === 0,
            data: {
              stdout,
              stderr,
              code,
            },
          });
        });
      });
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }

  /**
   * Start QEMU VM with native bridge
   */
  async startQEMUVM(
    envId: string,
    config: {
      kernel: string;
      initramfs: string;
      memory: number;
      cpus: number;
    },
  ): Promise<NativeBridgeResponse> {
    try {
      const qemuArgs = [
        "-kernel",
        config.kernel,
        "-initrd",
        config.initramfs,
        "-m",
        config.memory.toString(),
        "-smp",
        config.cpus.toString(),
        "-serial",
        "stdio",
        "-nographic",
      ];

      const response = await this.executeNativeCommand(
        "qemu-system-x86_64",
        qemuArgs,
      );

      if (response.success) {
        this.activeVMs.set(envId, {
          pid: response.data?.code,
          startTime: Date.now(),
        });
      }

      return response;
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }

  /**
   * Stop QEMU VM
   */
  async stopQEMUVM(envId: string): Promise<NativeBridgeResponse> {
    try {
      const vmInfo = this.activeVMs.get(envId);
      if (!vmInfo) {
        return {
          success: false,
          error: "VM not found",
        };
      }

      const response = await this.executeNativeCommand("kill", [
        vmInfo.pid.toString(),
      ]);
      this.activeVMs.delete(envId);
      return response;
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }

  /**
   * Monitor VM resources
   */
  async monitorVMResources(pid: number): Promise<NativeBridgeResponse> {
    try {
      const response = await this.executeNativeCommand("ps", [
        "-p",
        pid.toString(),
        "-o",
        "pid,cpu,mem",
      ]);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }
}

export function registerNativeBridge(app: Express, bridge: NativeBridge) {
  /**
   * Execute native command via API
   */
  app.post("/api/native/execute", async (req, res) => {
    const { command, args, options } = req.body;
    const response = await bridge.executeNativeCommand(command, args, options);
    res.json(response);
  });

  /**
   * Start QEMU VM
   */
  app.post("/api/native/vm/start", async (req, res) => {
    const { envId, config } = req.body;
    const response = await bridge.startQEMUVM(envId, config);
    res.json(response);
  });

  /**
   * Stop QEMU VM
   */
  app.post("/api/native/vm/stop", async (req, res) => {
    const { envId } = req.body;
    const response = await bridge.stopQEMUVM(envId);
    res.json(response);
  });

  /**
   * Monitor VM
   */
  app.get("/api/native/vm/:pid/monitor", async (req, res) => {
    const response = await bridge.monitorVMResources(parseInt(req.params.pid));
    res.json(response);
  });
}
