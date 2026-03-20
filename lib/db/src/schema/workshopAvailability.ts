import { pgTable, serial, integer, varchar } from "drizzle-orm/pg-core";
import { workshopsTable } from "./workshops";

export const workshopAvailabilityTable = pgTable("workshop_availability", {
  id: serial("id").primaryKey(),
  workshopId: integer("workshop_id").notNull().references(() => workshopsTable.id),
  dayOfWeek: integer("day_of_week").notNull(),
  timeSlot: varchar("time_slot", { length: 5 }).notNull(),
  maxBookings: integer("max_bookings").notNull().default(2),
});

export type WorkshopAvailability = typeof workshopAvailabilityTable.$inferSelect;
