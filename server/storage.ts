import {
  type User,
  type InsertUser,
  type Environment,
  type InsertEnvironment,
} from "@shared/schema";
import { randomUUID } from "crypto";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getEnvironments(): Promise<Environment[]>;
  getEnvironment(id: string): Promise<Environment | undefined>;
  createEnvironment(env: InsertEnvironment): Promise<Environment>;
  updateEnvironment(
    id: string,
    updates: Partial<Environment>,
  ): Promise<Environment | undefined>;
  deleteEnvironment(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private environments: Map<string, Environment>;

  constructor() {
    this.users = new Map();
    this.environments = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getEnvironments(): Promise<Environment[]> {
    return Array.from(this.environments.values());
  }

  async getEnvironment(id: string): Promise<Environment | undefined> {
    return this.environments.get(id);
  }

  async createEnvironment(insertEnv: InsertEnvironment): Promise<Environment> {
    const id = randomUUID();
    const env: Environment = {
      ...insertEnv,
      id,
      status: "stopped",
      cpuCores: insertEnv.cpuCores || 1,
      memoryMB: insertEnv.memoryMB || 512,
      diskSizeGB: insertEnv.diskSizeGB || 5,
      kernelPath: null,
      rootfsPath: null,
      initramfsPath: null,
      qemuPid: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.environments.set(id, env);
    return env;
  }

  async updateEnvironment(
    id: string,
    updates: Partial<Environment>,
  ): Promise<Environment | undefined> {
    const env = this.environments.get(id);
    if (!env) return undefined;
    const updated = { ...env, ...updates, updatedAt: new Date() };
    this.environments.set(id, updated);
    return updated;
  }

  async deleteEnvironment(id: string): Promise<boolean> {
    return this.environments.delete(id);
  }
}

export const storage = new MemStorage();
