import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const workshopApplicationsTable = pgTable("workshop_applications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => usersTable.id),
  ownerName: text("owner_name").notNull(),
  workshopName: text("workshop_name").notNull(),
  phone: text("phone").notNull(),
  area: text("area").notNull(),
  address: text("address").notNull(),
  yearsExperience: text("years_experience").notNull(),
  specialties: text("specialties").notNull(),
  notes: text("notes"),
  status: text("status").notNull().default("pending"),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertWorkshopApplicationSchema = createInsertSchema(workshopApplicationsTable).omit({
  id: true, createdAt: true, reviewedAt: true, status: true,
});
export type InsertWorkshopApplication = z.infer<typeof insertWorkshopApplicationSchema>;
export type WorkshopApplication = typeof workshopApplicationsTable.$inferSelect;
