import { pgTable, text, serial, timestamp, integer, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { ordersTable } from "./orders";
import { workshopsTable } from "./workshops";

export const leadsTable = pgTable(
  "leads",
  {
    id: serial("id").primaryKey(),
    type: text("type").notNull(),
    name: text("name").notNull(),
    contactPerson: text("contact_person"),
    phone: text("phone").notNull(),
    email: text("email"),
    area: text("area"),
    address: text("address"),
    carModel: text("car_model"),
    carYear: integer("car_year"),
    source: text("source").notNull().default("manual"),
    status: text("status").notNull().default("new"),
    assignedEmployeeId: integer("assigned_employee_id").references(() => usersTable.id),
    createdByUserId: integer("created_by_user_id").references(() => usersTable.id),
    registeredUserId: integer("registered_user_id").references(() => usersTable.id),
    lastContactAt: timestamp("last_contact_at", { withTimezone: true }),
    nextFollowUpAt: timestamp("next_follow_up_at", { withTimezone: true }),
    notes: text("notes"),
    convertedOrderId: integer("converted_order_id").references(() => ordersTable.id),
    convertedWorkshopId: integer("converted_workshop_id").references(() => workshopsTable.id),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
  },
  (table) => ({
    leadsTypeIdx: index("leads_type_idx").on(table.type),
    leadsAssignedEmployeeIdx: index("leads_assigned_employee_idx").on(table.assignedEmployeeId),
    leadsRegisteredUserIdx: index("leads_registered_user_idx").on(table.registeredUserId),
    leadsStatusIdx: index("leads_status_idx").on(table.status),
    leadsNextFollowUpIdx: index("leads_next_follow_up_idx").on(table.nextFollowUpAt),
  }),
);

export const insertLeadSchema = createInsertSchema(leadsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertLead = z.infer<typeof insertLeadSchema>;
export type Lead = typeof leadsTable.$inferSelect;
