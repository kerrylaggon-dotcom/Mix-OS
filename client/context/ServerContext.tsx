import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Paths } from "expo-file-system";

const API_BASE = "http://localhost:5000/api";

export type ServerStatus = "stopped" | "starting" | "running" | "error";
export type DownloadStatus =
  | "not_downloaded"
  | "downloading"
  | "downloaded"
  | "error";

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
  startEnvironment: (id: string) => Promise<void>;
  stopEnvironment: (id: string) => Promise<void>;
  startCodeServer: () => Promise<void>;
  stopCodeServer: () => Promise<void>;
  checkCodeServerStatus: () => Promise<void>;
}

const defaultSettings: Settings = {
  autoStart: true,
  autoSetupVm: true,
  defaultEnvironment: "nix",
  serverPort: 8080,
};

const initialComponents: ComponentDownload[] = [];

const ServerContext = createContext<ServerContextType | undefined>(undefined);

export function ServerProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<ServerStatus>("stopped");
  const [environments, setEnvironments] = useState<Environment[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [isFirstRun, setIsFirstRun] = useState(true);
  const [codeServerUrl, setCodeServerUrl] = useState<string | null>(null);
  const [components, setComponents] =
    useState<ComponentDownload[]>(initialComponents);
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

    // Connect to WebSocket for logs
    const ws = new WebSocket("ws://localhost:5000");
    ws.onmessage = (event) => {
      const data = event.data;
      if (data.startsWith("stdout: ") || data.startsWith("stderr: ")) {
        addLog("info", data);
      }
    };
    ws.onclose = () => {
      addLog("warn", "WebSocket disconnected");
    };

    return () => ws.close();
  }, []);

  const loadData = async () => {
    try {
      const [storedSettings, storedEnvs, firstRun, storedComponents] =
        await Promise.all([
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
      } else {
        // Fetch from API
        fetchEnvironments();
      }
      if (storedComponents) {
        setComponents(JSON.parse(storedComponents));
      } else {
        // Fetch from API if not stored
        fetchComponents();
      }
      setIsFirstRun(firstRun !== "true");

      addLog("info", "Code Server Terminal initialized");
    } catch (error) {
      addLog("error", "Failed to load settings");
    }
  };

  const fetchEnvironments = async () => {
    try {
      const response = await fetch(`${API_BASE}/environments`);
      const data = await response.json();
      setEnvironments(data);
      await AsyncStorage.setItem(
        "@codeserver_environments",
        JSON.stringify(data),
      );
    } catch (error) {
      addLog("error", "Failed to fetch environments");
    }
  };

  const fetchComponents = async () => {
    try {
      const response = await fetch(`${API_BASE}/downloads`);
      const data = await response.json();
      const mapped = data.map((d: any) => ({
        id: d.id,
        name: d.name,
        description: d.name,
        size: d.size,
        status: "not_downloaded" as DownloadStatus,
        progress: 0,
        url: d.url,
        localPath: `${Paths.cache.uri || ""}/${d.id}/`,
      }));
      setComponents(mapped);
      await AsyncStorage.setItem(
        "@codeserver_components",
        JSON.stringify(mapped),
      );
    } catch (error) {
      addLog("error", "Failed to fetch components");
    }
  };

  const addEnvironment = async (env: Omit<Environment, "id" | "createdAt">) => {
    try {
      const response = await fetch(`${API_BASE}/environments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(env),
      });
      const newEnv = await response.json();
      const updated = [...environments, newEnv];
      setEnvironments(updated);
      await AsyncStorage.setItem(
        "@codeserver_environments",
        JSON.stringify(updated),
      );
      addLog("info", `Created environment: ${newEnv.name}`);
    } catch (error) {
      addLog("error", "Failed to create environment");
    }
  };

  const removeEnvironment = async (id: string) => {
    try {
      await fetch(`${API_BASE}/environments/${id}`, { method: "DELETE" });
      const env = environments.find((e) => e.id === id);
      const updated = environments.filter((e) => e.id !== id);
      setEnvironments(updated);
      await AsyncStorage.setItem(
        "@codeserver_environments",
        JSON.stringify(updated),
      );
      if (env) {
        addLog("info", `Removed environment: ${env.name}`);
      }
    } catch (error) {
      addLog("error", "Failed to remove environment");
    }
  };

  const updateEnvironment = async (
    id: string,
    updates: Partial<Environment>,
  ) => {
    const updated = environments.map((e) =>
      e.id === id ? { ...e, ...updates } : e,
    );
    setEnvironments(updated);
    await AsyncStorage.setItem(
      "@codeserver_environments",
      JSON.stringify(updated),
    );
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
        c.id === id ? { ...c, status: "downloading", progress: 0 } : c,
      ),
    );

    addLog("info", `Starting download: ${component.name}`);
    addTerminalOutput(`$ curl -O ${component.url}`);
    addTerminalOutput(`Downloading ${component.name}...`);

    try {
      const response = await fetch(`${API_BASE}/download/${id}`, {
        method: "POST",
      });
      if (!response.ok) throw new Error("Download failed");

      // Simulate progress since backend doesn't send progress yet
      for (let i = 0; i <= 100; i += 10) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        setComponents((prev) =>
          prev.map((c) => (c.id === id ? { ...c, progress: i } : c)),
        );
        if (i % 25 === 0) {
          addTerminalOutput(`  ${i}% complete...`);
        }
      }

      setComponents((prev) =>
        prev.map((c) =>
          c.id === id ? { ...c, status: "downloaded", progress: 100 } : c,
        ),
      );

      await AsyncStorage.setItem(
        "@codeserver_components",
        JSON.stringify(
          components.map((c) =>
            c.id === id ? { ...c, status: "downloaded", progress: 100 } : c,
          ),
        ),
      );

      addLog("info", `Downloaded: ${component.name}`);
      addTerminalOutput(`${component.name} downloaded successfully`);
      addTerminalOutput("");
    } catch (error) {
      setComponents((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: "error" } : c)),
      );
      addLog("error", `Download failed: ${component.name}`);
      addTerminalOutput(`Download failed: ${(error as Error).message}`);
    }
  };

  const addTerminalOutput = (line: string) => {
    setTerminalOutput((prev) => [...prev.slice(-200), line]);
  };

  const clearTerminalOutput = () => {
    setTerminalOutput([
      "Code Server Terminal v0.1.0",
      "Phase 0 - AI Development Preview",
      "─".repeat(40),
      "",
      "Type 'help' for available commands",
    ]);
  };

  const startCodeServer = async () => {
    try {
      const response = await fetch(`${API_BASE}/code-server/start`, {
        method: "POST",
      });
      const data = await response.json();
      addLog("info", `Code server: ${data.status}`);
      addTerminalOutput(`Code server ${data.status}`);
      setStatus("running");
    } catch (error) {
      addLog("error", "Failed to start code server");
    }
  };

  const stopCodeServer = async () => {
    try {
      const response = await fetch(`${API_BASE}/code-server/stop`, {
        method: "POST",
      });
      const data = await response.json();
      addLog("info", `Code server: ${data.status}`);
      addTerminalOutput(`Code server ${data.status}`);
      setStatus("stopped");
    } catch (error) {
      addLog("error", "Failed to stop code server");
    }
  };

  const checkCodeServerStatus = async () => {
    try {
      const response = await fetch(`${API_BASE}/code-server/status`);
      const data = await response.json();
      setStatus(data.running ? "running" : "stopped");
    } catch (error) {
      addLog("error", "Failed to check code server status");
    }
  };

  const startEnvironment = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE}/environments/${id}/start`, {
        method: "POST",
      });
      const data = await response.json();
      updateEnvironment(id, { status: "running" });
      addLog("info", `Started environment: ${id}`);
    } catch (error) {
      addLog("error", "Failed to start environment");
    }
  };

  const stopEnvironment = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE}/environments/${id}/stop`, {
        method: "POST",
      });
      const data = await response.json();
      updateEnvironment(id, { status: "stopped" });
      addLog("info", `Stopped environment: ${id}`);
    } catch (error) {
      addLog("error", "Failed to stop environment");
    }
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
        startCodeServer,
        stopCodeServer,
        checkCodeServerStatus,
        startEnvironment,
        stopEnvironment,
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
