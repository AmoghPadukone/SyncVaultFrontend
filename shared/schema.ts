import { pgTable, text, serial, integer, boolean, json, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  fullName: text("full_name"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const cloudProviders = pgTable("cloud_providers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  icon: text("icon"),
  isActive: boolean("is_active").default(true),
});

export const userCloudProviders = pgTable("user_cloud_providers", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  providerId: integer("provider_id").notNull().references(() => cloudProviders.id),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  expiresAt: timestamp("expires_at"),
  metadata: json("metadata")
});

export const folders = pgTable("folders", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  parentId: integer("parent_id").references(() => folders.id),
  userId: integer("user_id").notNull().references(() => users.id),
  providerId: integer("provider_id").references(() => cloudProviders.id),
  externalId: text("external_id"),
  path: text("path"),
  isRoot: boolean("is_root").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const files = pgTable("files", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  mimeType: text("mime_type"),
  size: integer("size"),
  folderId: integer("folder_id").references(() => folders.id),
  userId: integer("user_id").notNull().references(() => users.id),
  providerId: integer("provider_id").references(() => cloudProviders.id),
  externalId: text("external_id"),
  path: text("path"),
  thumbnailUrl: text("thumbnail_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  isFavorite: boolean("is_favorite").default(false),
  tags: text("tags").array().default([]),
});

export const sharedFiles = pgTable("shared_files", {
  id: serial("id").primaryKey(),
  fileId: integer("file_id").notNull().references(() => files.id),
  userId: integer("user_id").notNull().references(() => users.id),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  fullName: true,
});

export const insertCloudProviderSchema = createInsertSchema(cloudProviders);

export const insertUserCloudProviderSchema = createInsertSchema(userCloudProviders);

export const insertFolderSchema = createInsertSchema(folders);

export const insertFileSchema = createInsertSchema(files);

export const insertSharedFileSchema = createInsertSchema(sharedFiles);

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertCloudProvider = z.infer<typeof insertCloudProviderSchema>;
export type CloudProvider = typeof cloudProviders.$inferSelect;

export type InsertUserCloudProvider = z.infer<typeof insertUserCloudProviderSchema>;
export type UserCloudProvider = typeof userCloudProviders.$inferSelect;

export type InsertFolder = z.infer<typeof insertFolderSchema>;
export type Folder = typeof folders.$inferSelect;

export type InsertFile = z.infer<typeof insertFileSchema>;
export type File = typeof files.$inferSelect;

export type InsertSharedFile = z.infer<typeof insertSharedFileSchema>;
export type SharedFile = typeof sharedFiles.$inferSelect;

// Auth types
export type LoginCredentials = Pick<InsertUser, "username" | "password">;
