import { pgTable, text, serial, timestamp, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const workshopsTable = pgTable("workshops", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  area: text("area").notNull(),
  address: text("address").notNull(),
  phone: text("phone").notNull(),
  lat: numeric("lat", { precision: 10, scale: 7 }),
  lng: numeric("lng", { precision: 10, scale: 7 }),
  rating: numeric("rating", { precision: 3, scale: 2 }),
  partnershipStatus: text("partnership_status").notNull().default("active"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertWorkshopSchema = createInsertSchema(workshopsTable).omit({ id: true, createdAt: true });
export type InsertWorkshop = z.infer<typeof insertWorkshopSchema>;
export type Workshop = typeof workshopsTable.$inferSelect;
