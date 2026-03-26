import { pgTable, text, serial, timestamp, integer, index, date, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const employeeDailyReportsTable = pgTable(
  "employee_daily_reports",
  {
    id: serial("id").primaryKey(),
    employeeId: integer("employee_id").notNull().references(() => usersTable.id),
    reportDate: date("report_date").notNull(),
    summary: text("summary").notNull(),
    achievements: text("achievements"),
    blockers: text("blockers"),
    nextSteps: text("next_steps"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
  },
  (table) => ({
    employeeDailyReportsEmployeeIdx: index("employee_daily_reports_employee_idx").on(table.employeeId),
    employeeDailyReportsDateIdx: index("employee_daily_reports_date_idx").on(table.reportDate),
    employeeDailyReportsUniqueIdx: uniqueIndex("employee_daily_reports_employee_date_uidx").on(table.employeeId, table.reportDate),
  }),
);

export const insertEmployeeDailyReportSchema = createInsertSchema(employeeDailyReportsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertEmployeeDailyReport = z.infer<typeof insertEmployeeDailyReportSchema>;
export type EmployeeDailyReport = typeof employeeDailyReportsTable.$inferSelect;
