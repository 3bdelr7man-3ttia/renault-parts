import { pgTable, text, serial, integer, numeric, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { packagesTable } from "./packages";

export const partsTable = pgTable("parts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  oemCode: text("oem_code"),
  type: text("type").notNull(),
  priceOriginal: numeric("price_original", { precision: 10, scale: 2 }),
  priceTurkish: numeric("price_turkish", { precision: 10, scale: 2 }),
  priceChinese: numeric("price_chinese", { precision: 10, scale: 2 }),
  compatibleModels: text("compatible_models"),
  supplier: text("supplier"),
}, (t) => [
  unique("parts_name_unique").on(t.name),
]);

export const packagePartsTable = pgTable("package_parts", {
  id: serial("id").primaryKey(),
  packageId: integer("package_id").notNull().references(() => packagesTable.id),
  partId: integer("part_id").notNull().references(() => partsTable.id),
}, (t) => [
  unique("package_parts_pkg_part_unique").on(t.packageId, t.partId),
]);

export const insertPartSchema = createInsertSchema(partsTable).omit({ id: true });
export type InsertPart = z.infer<typeof insertPartSchema>;
export type Part = typeof partsTable.$inferSelect;
