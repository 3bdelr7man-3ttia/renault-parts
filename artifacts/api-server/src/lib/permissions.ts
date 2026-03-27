import type { NextFunction, Response } from "express";
import type { AuthenticatedRequest } from "./auth";

export type AppRole = "customer" | "employee" | "workshop_owner" | "workshop" | "admin";
export type EmployeeRole = "sales" | "data_entry" | "technical_expert" | "marketing_tech" | "manager";
export type Permission =
  | "orders.view"
  | "orders.update_status"
  | "customers.view"
  | "customers.contact"
  | "reports.sales"
  | "technical.dashboard.view"
  | "technical.cases.view_own"
  | "technical.cases.update_own"
  | "returns.create"
  | "returns.view"
  | "returns.update"
  | "employee.tasks.view_own"
  | "employee.tasks.create_own"
  | "employee.tasks.update_own"
  | "employee.reports.view_own"
  | "employee.reports.create_own"
  | "data_entry.dashboard.view"
  | "data_entry.leads.view"
  | "data_entry.leads.create"
  | "sales.dashboard.view"
  | "sales.customers.view_own"
  | "sales.customers.create_own"
  | "sales.workshops.view_own"
  | "sales.workshops.create_own"
  | "sales.team.view"
  | "sales.team.assign"
  | "parts.create"
  | "parts.edit"
  | "packages.create"
  | "packages.edit"
  | "cars.create"
  | "cars.edit"
  | "appointments.view"
  | "reviews.view"
  | "reports.financial"
  | "employees.manage"
  | "workshops.manage";

export const EMPLOYEE_PERMISSIONS: Record<EmployeeRole, Array<Permission | "*">> = {
  sales: [
    "employee.tasks.view_own",
    "employee.tasks.create_own",
    "employee.tasks.update_own",
    "employee.reports.view_own",
    "employee.reports.create_own",
    "sales.dashboard.view",
    "sales.customers.view_own",
    "sales.customers.create_own",
    "sales.workshops.view_own",
    "sales.workshops.create_own",
    "customers.contact",
  ],
  data_entry: [
    "returns.create",
    "returns.view",
    "returns.update",
    "employee.tasks.view_own",
    "employee.tasks.create_own",
    "employee.tasks.update_own",
    "employee.reports.view_own",
    "employee.reports.create_own",
    "data_entry.dashboard.view",
    "data_entry.leads.view",
    "data_entry.leads.create",
    "parts.create",
    "parts.edit",
    "packages.create",
    "packages.edit",
    "cars.create",
    "cars.edit",
  ],
  technical_expert: [
    "technical.dashboard.view",
    "technical.cases.view_own",
    "technical.cases.update_own",
    "returns.create",
    "returns.view",
    "returns.update",
    "employee.tasks.view_own",
    "employee.tasks.create_own",
    "employee.tasks.update_own",
    "employee.reports.view_own",
    "employee.reports.create_own",
    "appointments.view",
    "reviews.view",
    "workshops.manage",
  ],
  marketing_tech: [
    "employee.tasks.view_own",
    "employee.tasks.create_own",
    "employee.tasks.update_own",
    "employee.reports.view_own",
    "employee.reports.create_own",
    "reports.sales",
    "reviews.view",
  ],
  manager: [
    "employee.tasks.view_own",
    "employee.tasks.create_own",
    "employee.tasks.update_own",
    "employee.reports.view_own",
    "employee.reports.create_own",
    "sales.dashboard.view",
    "sales.customers.view_own",
    "sales.customers.create_own",
    "sales.workshops.view_own",
    "sales.workshops.create_own",
    "sales.team.view",
    "sales.team.assign",
    "customers.view",
    "customers.contact",
    "technical.dashboard.view",
    "technical.cases.view_own",
    "technical.cases.update_own",
    "returns.create",
    "returns.view",
    "returns.update",
    "data_entry.dashboard.view",
    "data_entry.leads.view",
    "data_entry.leads.create",
    "orders.view",
    "orders.update_status",
    "appointments.view",
    "reports.sales",
  ],
};

export function normalizeRole(role?: string | null): AppRole | "unknown" {
  if (role === "workshop") return "workshop_owner";
  if (role === "customer" || role === "employee" || role === "workshop_owner" || role === "admin") return role;
  return "unknown";
}

export function normalizeEmployeeRole(employeeRole?: string | null): EmployeeRole | null {
  if (employeeRole === "customer_service") return "sales";
  if (employeeRole === "sales" || employeeRole === "data_entry" || employeeRole === "technical_expert" || employeeRole === "marketing_tech" || employeeRole === "manager") {
    return employeeRole;
  }
  return null;
}

export function isAdmin(user?: AuthenticatedRequest["user"] | null): boolean {
  return normalizeRole(user?.role) === "admin";
}

export function isEmployee(user?: AuthenticatedRequest["user"] | null): boolean {
  return normalizeRole(user?.role) === "employee";
}

export function isWorkshopOwner(user?: AuthenticatedRequest["user"] | null): boolean {
  return normalizeRole(user?.role) === "workshop_owner";
}

export function hasPermission(user: AuthenticatedRequest["user"] | undefined, permission: Permission): boolean {
  if (!user) return false;
  if (isAdmin(user)) return true;
  if (!isEmployee(user)) return false;

  const employeeRole = normalizeEmployeeRole(user.employeeRole);
  if (!employeeRole) return false;
  return EMPLOYEE_PERMISSIONS[employeeRole].includes(permission);
}

export function requireRolePermission(permission: Permission, deniedMessage = "غير مصرح") {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: "غير مصرح" });
      return;
    }

    if (hasPermission(req.user, permission)) {
      next();
      return;
    }

    res.status(403).json({ error: deniedMessage });
  };
}
