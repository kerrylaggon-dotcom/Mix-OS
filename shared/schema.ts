import { sql } from "drizzle-orm";
import {
  pgTable,
  text,
  varchar,
  integer,
  timestamp,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const environments = pgTable("environments", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  type: varchar("type").notNull(), // nix, qemu, ubuntu
  status: varchar("status").notNull().default("stopped"), // stopped, starting, running, error
  cpuCores: integer("cpu_cores").default(1),
  memoryMB: integer("memory_mb").default(512),
  diskSizeGB: integer("disk_size_gb").default(5),
  kernelPath: text("kernel_path"),
  rootfsPath: text("rootfs_path"),
  initramfsPath: text("initramfs_path"),
  qemuPid: integer("qemu_pid"),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const insertEnvironmentSchema = createInsertSchema(environments).pick({
  name: true,
  type: true,
  cpuCores: true,
  memoryMB: true,
  diskSizeGB: true,
});

export type InsertEnvironment = z.infer<typeof insertEnvironmentSchema>;
export type Environment = typeof environments.$inferSelect;
