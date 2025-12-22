import { pgTable, text, serial, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const presets = pgTable("presets", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  duration: integer("duration").notNull(), // in seconds
});

export const insertPresetSchema = createInsertSchema(presets).omit({ id: true });

export type Preset = typeof presets.$inferSelect;
export type InsertPreset = z.infer<typeof insertPresetSchema>;
