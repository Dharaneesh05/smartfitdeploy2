import { sql } from "drizzle-orm";
import { pgTable, text, varchar, jsonb, timestamp, real, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const measurements = pgTable("measurements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  chest: real("chest_cm"),
  shoulders: real("shoulders_cm"),
  waist: real("waist_cm"),
  height: real("height_cm"),
  hips: real("hips_cm"),
  confidence: jsonb("confidence").$type<Record<string, number>>(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const products = pgTable("products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  brand: text("brand"),
  imageUrl: text("image_url"),
  description: text("description"),
  size: text("size"),
  measurements: jsonb("measurements").$type<Record<string, number>>(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const fitAnalyses = pgTable("fit_analyses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  productId: varchar("product_id").notNull().references(() => products.id),
  fitStatus: text("fit_status").notNull(), // "perfect", "too_tight", "too_loose"
  analysis: jsonb("analysis").$type<Record<string, any>>(),
  recommendations: text("recommendations"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const favorites = pgTable("favorites", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  productId: varchar("product_id").notNull().references(() => products.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
  fullName: true,
}).extend({
  password: z.string().min(8, "Password must be at least 8 characters"),
  email: z.string().email("Invalid email format"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

export const measurementSchema = createInsertSchema(measurements).pick({
  chest: true,
  shoulders: true,
  waist: true,
  height: true,
  hips: true,
  confidence: true,
});

export const productSchema = createInsertSchema(products).pick({
  name: true,
  brand: true,
  imageUrl: true,
  description: true,
  size: true,
  measurements: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type LoginData = z.infer<typeof loginSchema>;
export type User = typeof users.$inferSelect;
export type Measurement = typeof measurements.$inferSelect;
export type InsertMeasurement = z.infer<typeof measurementSchema>;
export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof productSchema>;
export type FitAnalysis = typeof fitAnalyses.$inferSelect;
export type Favorite = typeof favorites.$inferSelect;
