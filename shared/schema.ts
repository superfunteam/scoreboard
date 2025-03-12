import { pgTable, text, serial, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const teams = pgTable("teams", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  score: integer("score").notNull().default(0),
  color: text("color").notNull().default("#4F46E5"), // Default indigo color
});

export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  teamCount: integer("team_count").notNull().default(2),
  scoreIncrement: integer("score_increment").notNull().default(1),
});

// Predefined color options for teams
export const TEAM_COLORS = [
  "#4F46E5", // Indigo
  "#10B981", // Emerald
  "#EF4444", // Red
  "#F59E0B", // Amber
  "#8B5CF6"  // Purple
];

export const insertTeamSchema = createInsertSchema(teams).pick({
  name: true,
  score: true,
  color: true,
});

export const insertSettingsSchema = createInsertSchema(settings).pick({
  teamCount: true,
  scoreIncrement: true,
});

export type InsertTeam = z.infer<typeof insertTeamSchema>;
export type Team = typeof teams.$inferSelect;

export type InsertSettings = z.infer<typeof insertSettingsSchema>;
export type Settings = typeof settings.$inferSelect;
