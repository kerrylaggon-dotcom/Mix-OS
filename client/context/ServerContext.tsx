import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";

export type ServerStatus = "stopped" | "starting" | "running" | "error";
export type DownloadStatus = "not_downloaded" | "downloading" | "downloaded" | "error";

export interface Environment {
  id: string;
  name: string;
  type: "nix" | "qemu" | "ubuntu";
  status: ServerStatus;
  cpuUsage?: number;
  memoryUsage?: number;
  createdAt: number;
}

export interface LogEntry {
  id: string;
  timestamp: number;
  level: "info" | "warn" | "error" | "debug";
  message: string;
}

export interface Settings {
  autoStart: boolean;
  autoSetupVm: boolean;
  defaultEnvironment: string;
  serverPort: number;
}

export interface ComponentDownload {
  id: string;
  name: string;
  description: string;
  size: string;
  status: DownloadStatus;
  progress: number;
  url: string;
  localPath: string;
}

interface ServerContextType {
  status: ServerStatus;
  setStatus: (status: ServerStatus) => void;
  environments: Environment[];
  addEnvironment: (env: Omit<Environment, "id" | "createdAt">) => void;
  removeEnvironment: (id: string) => void;
  updateEnvironment: (id: string, updates: Partial<Environment>) => void;
  logs: LogEntry[];
  addLog: (level: LogEntry["level"], message: string) => void;
  clearLogs: () => void;
  settings: Settings;
  updateSettings: (updates: Partial<Settings>) => void;
  isFirstRun: boolean;
  completeSetup: () => void;
  codeServerUrl: string | null;
  setCodeServerUrl: (url: string | null) => void;
  components: ComponentDownload[];
  downloadComponent: (id: string) => Promise<void>;
  activeTab: number;
  setActiveTab: (tab: number) => void;
  terminalOutput: string[];
  addTerminalOutput: (line: string) => void;
  clearTerminalOutput: () => void;
}

const defaultSettings: Settings = {
  autoStart: true,
  autoSetupVm: true,
  defaultEnvironment: "nix",
  serverPort: 8080,
};

const initialComponents: ComponentDownload[] = [
  {
    id: "code-server",
    name: "code-server",
    description: "VS Code running in the browser",
    size: "~85MB",
    status: "not_downloaded",
    progress: 0,
    url: "https://github.com/coder/code-server/releases/latest",
    localPath: `${FileSystem.documentDirectory}code-server/`,
  },
  {
    id: "nix",
    name: "Nix Package Manager",
    description: "Reproducible package management",
    size: "~120MB",
    status: "not_downloaded",
    progress: 0,
    url: "https://nixos.org/download",
    localPath: `${FileSystem.documentDirectory}nix/`,
  },
  {
    id: "qemu",
    name: "QEMU",
    description: "Full system emulation",
    size: "~200MB",
    status: "not_downloaded",
    progress: 0,
    url: "https://www.qemu.org/download/",
    localPath: `${FileSystem.documentDirectory}qemu/`,
  },
  {
    id: "busybox",
    name: "BusyBox",
    description: "Unix utilities in a single executable",
    size: "~2MB",
    status: "not_downloaded",
    progress: 0,
    url: "https://busybox.net/downloads/",
    localPath: `${FileSystem.documentDirectory}busybox/`,
  },
  {
    id: "rootfs",
    name: "Alpine Linux rootfs",
    description: "Lightweight Linux root filesystem",
    size: "~50MB",
    status: "not_downloaded",
    progress: 0,
    url: "https://alpinelinux.org/downloads/",
    localPath: `${FileSystem.documentDirectory}rootfs/`,
  },
];

const ServerContext = createContext<ServerContextType | undefined>(undefined);

export function ServerProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<ServerStatus>("stopped");
  const [environments, setEnvironments] = useState<Environment[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [isFirstRun, setIsFirstRun] = useState(true);
  const [codeServerUrl, setCodeServerUrl] = useState<string | null>(null);
  const [components, setComponents] = useState<ComponentDownload[]>(initialComponents);
  const [activeTab, setActiveTab] = useState(0);
  const [terminalOutput, setTerminalOutput] = useState<string[]>([
    "Code Server Terminal v0.1.0",
    "Phase 0 - AI Development Preview",
    "─".repeat(40),
    "",
    "Type 'help' for available commands",
    "",
  ]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [storedSettings, storedEnvs, firstRun, storedComponents] = await Promise.all([
        AsyncStorage.getItem("@codeserver_settings"),
        AsyncStorage.getItem("@codeserver_environments"),
        AsyncStorage.getItem("@codeserver_setup_complete"),
        AsyncStorage.getItem("@codeserver_components"),
      ]);

      if (storedSettings) {
        setSettings(JSON.parse(storedSettings));
      }
      if (storedEnvs) {
        setEnvironments(JSON.parse(storedEnvs));
      }
      if (storedComponents) {
        setComponents(JSON.parse(storedComponents));
      }
      setIsFirstRun(firstRun !== "true");

      addLog("info", "Code Server Terminal initialized");
    } catch (error) {
      addLog("error", "Failed to load settings");
    }
  };

  const addEnvironment = async (env: Omit<Environment, "id" | "createdAt">) => {
    const newEnv: Environment = {
      ...env,
      id: Date.now().toString(),
      createdAt: Date.now(),
    };
    const updated = [...environments, newEnv];
    setEnvironments(updated);
    await AsyncStorage.setItem("@codeserver_environments", JSON.stringify(updated));
    addLog("info", `Created environment: ${newEnv.name}`);
  };

  const removeEnvironment = async (id: string) => {
    const env = environments.find((e) => e.id === id);
    const updated = environments.filter((e) => e.id !== id);
    setEnvironments(updated);
    await AsyncStorage.setItem("@codeserver_environments", JSON.stringify(updated));
    if (env) {
      addLog("info", `Removed environment: ${env.name}`);
    }
  };

  const updateEnvironment = async (id: string, updates: Partial<Environment>) => {
    const updated = environments.map((e) => (e.id === id ? { ...e, ...updates } : e));
    setEnvironments(updated);
    await AsyncStorage.setItem("@codeserver_environments", JSON.stringify(updated));
  };

  const addLog = (level: LogEntry["level"], message: string) => {
    const entry: LogEntry = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      level,
      message,
    };
    setLogs((prev) => [...prev.slice(-499), entry]);
  };

  const clearLogs = () => {
    setLogs([]);
    addLog("info", "Logs cleared");
  };

  const updateSettings = async (updates: Partial<Settings>) => {
    const updated = { ...settings, ...updates };
    setSettings(updated);
    await AsyncStorage.setItem("@codeserver_settings", JSON.stringify(updated));
    addLog("info", "Settings updated");
  };

  const completeSetup = async () => {
    setIsFirstRun(false);
    await AsyncStorage.setItem("@codeserver_setup_complete", "true");
    addLog("info", "Initial setup completed");
  };

  const downloadComponent = async (id: string) => {
    const component = components.find((c) => c.id === id);
    if (!component) return;

    setComponents((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, status: "downloading", progress: 0 } : c
      )
    );

    addLog("info", `Starting download: ${component.name}`);
    addTerminalOutput(`$ wget ${component.url}`);
    addTerminalOutput(`Downloading ${component.name}...`);

    // Simulate download progress (in real implementation, this would use FileSystem.downloadAsync)
    for (let i = 0; i <= 100; i += 10) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      setComponents((prev) =>
        prev.map((c) =>
          c.id === id ? { ...c, progress: i } : c
        )
      );
      if (i % 25 === 0) {
        addTerminalOutput(`  ${i}% complete...`);
      }
    }

    setComponents((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, status: "downloaded", progress: 100 } : c
      )
    );

    await AsyncStorage.setItem("@codeserver_components", JSON.stringify(
      components.map((c) =>
        c.id === id ? { ...c, status: "downloaded", progress: 100 } : c
      )
    ));

    addLog("info", `Downloaded: ${component.name}`);
    addTerminalOutput(`${component.name} downloaded successfully`);
    addTerminalOutput("");
  };

  const addTerminalOutput = (line: string) => {
    setTerminalOutput((prev) => [...prev.slice(-200), line]);
  };

  const clearTerminalOutput = () => {
    setTerminalOutput([
      "Terminal cleared",
      "",
    ]);
  };

  return (
    <ServerContext.Provider
      value={{
        status,
        setStatus,
        environments,
        addEnvironment,
        removeEnvironment,
        updateEnvironment,
        logs,
        addLog,
        clearLogs,
        settings,
        updateSettings,
        isFirstRun,
        completeSetup,
        codeServerUrl,
        setCodeServerUrl,
        components,
        downloadComponent,
        activeTab,
        setActiveTab,
        terminalOutput,
        addTerminalOutput,
        clearTerminalOutput,
      }}
    >
      {children}
    </ServerContext.Provider>
  );
}

export function useServer() {
  const context = useContext(ServerContext);
  if (!context) {
    throw new Error("useServer must be used within ServerProvider");
  }
  return context;
}
