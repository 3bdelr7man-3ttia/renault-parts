import { pgTable, text, serial, timestamp, integer, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { leadsTable } from "./leads";

export const employeeTasksTable = pgTable(
  "employee_tasks",
  {
    id: serial("id").primaryKey(),
    employeeId: integer("employee_id").notNull().references(() => usersTable.id),
    leadId: integer("lead_id").references(() => leadsTable.id),
    title: text("title").notNull(),
    taskType: text("task_type").notNull(),
    area: text("area"),
    dueAt: timestamp("due_at", { withTimezone: true }).notNull(),
    status: text("status").notNull().default("pending"),
    result: text("result"),
    notes: text("notes"),
    createdByUserId: integer("created_by_user_id").references(() => usersTable.id),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
  },
  (table) => ({
    employeeTasksEmployeeIdx: index("employee_tasks_employee_idx").on(table.employeeId),
    employeeTasksStatusIdx: index("employee_tasks_status_idx").on(table.status),
    employeeTasksDueAtIdx: index("employee_tasks_due_at_idx").on(table.dueAt),
  }),
);

export const insertEmployeeTaskSchema = createInsertSchema(employeeTasksTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertEmployeeTask = z.infer<typeof insertEmployeeTaskSchema>;
export type EmployeeTask = typeof employeeTasksTable.$inferSelect;
