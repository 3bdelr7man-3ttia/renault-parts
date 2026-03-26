export type AppRole = "customer" | "employee" | "workshop_owner" | "workshop" | "admin";
export type EmployeeRole = "sales" | "data_entry" | "customer_service" | "manager";
export type Permission =
  | "orders.view"
  | "orders.update_status"
  | "customers.view"
  | "customers.contact"
  | "reports.sales"
  | "sales.dashboard.view"
  | "sales.customers.view_own"
  | "sales.workshops.view_own"
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
  sales: ["sales.dashboard.view", "sales.customers.view_own", "sales.workshops.view_own", "customers.contact"],
  data_entry: ["parts.create", "parts.edit", "packages.create", "packages.edit", "cars.create", "cars.edit"],
  customer_service: ["orders.view", "appointments.view", "reviews.view", "customers.view", "customers.contact"],
  manager: ["*"],
};

export type AppUser = {
  id: number;
  name: string;
  phone?: string | null;
  email?: string | null;
  carModel?: string | null;
  carYear?: number | null;
  address?: string | null;
  area?: string | null;
  role: string;
  employeeRole?: string | null;
  workshopId?: number | null;
  createdAt?: string | Date;
};

type AdminRouteRule = {
  allowAdmin?: boolean;
  allowEmployee?: boolean;
  permission?: Permission;
  redirectEmployeeTo?: string;
};

const MANAGER_ONLY_PERMISSIONS: Permission[] = ["reports.financial", "employees.manage", "workshops.manage"];

const ADMIN_ROUTE_RULES: Array<{ match: RegExp; rule: AdminRouteRule }> = [
  { match: /^\/admin\/employee\/dashboard\/?$/, rule: { allowAdmin: true, allowEmployee: true } },
  { match: /^\/admin\/employee\/customers\/?$/, rule: { allowAdmin: true, allowEmployee: true, permission: "sales.customers.view_own" } },
  { match: /^\/admin\/employee\/workshops\/?$/, rule: { allowAdmin: true, allowEmployee: true, permission: "sales.workshops.view_own" } },
  { match: /^\/admin\/?$/, rule: { allowAdmin: true, allowEmployee: false, redirectEmployeeTo: "/admin/employee/dashboard" } },
  { match: /^\/admin\/dashboard\/?$/, rule: { allowAdmin: true, allowEmployee: false, redirectEmployeeTo: "/admin/employee/dashboard" } },
  { match: /^\/admin\/orders(\/.*)?$/, rule: { allowAdmin: true, allowEmployee: true, permission: "orders.view" } },
  { match: /^\/admin\/appointments(\/.*)?$/, rule: { allowAdmin: true, allowEmployee: true, permission: "appointments.view" } },
  { match: /^\/admin\/packages(\/.*)?$/, rule: { allowAdmin: true, allowEmployee: true, permission: "packages.edit" } },
  { match: /^\/admin\/parts(\/.*)?$/, rule: { allowAdmin: true, allowEmployee: true, permission: "parts.edit" } },
  { match: /^\/admin\/reviews(\/.*)?$/, rule: { allowAdmin: true, allowEmployee: true, permission: "reviews.view" } },
  { match: /^\/admin\/sales(\/.*)?$/, rule: { allowAdmin: true, allowEmployee: true, permission: "reports.sales" } },
  { match: /^\/admin\/expenses(\/.*)?$/, rule: { allowAdmin: true, allowEmployee: true, permission: "reports.financial" } },
  { match: /^\/admin\/users(\/.*)?$/, rule: { allowAdmin: true, allowEmployee: true, permission: "employees.manage" } },
  { match: /^\/admin\/workshops(\/.*)?$/, rule: { allowAdmin: true, allowEmployee: true, permission: "workshops.manage" } },
  { match: /^\/admin\/workshop-applications(\/.*)?$/, rule: { allowAdmin: true, allowEmployee: true, permission: "workshops.manage" } },
];

export function normalizeRole(role?: string | null): AppRole | "unknown" {
  if (role === "workshop") return "workshop_owner";
  if (role === "customer" || role === "employee" || role === "workshop_owner" || role === "admin") {
    return role;
  }
  return "unknown";
}

export function normalizeEmployeeRole(employeeRole?: string | null): EmployeeRole | null {
  if (employeeRole === "sales" || employeeRole === "data_entry" || employeeRole === "customer_service" || employeeRole === "manager") {
    return employeeRole;
  }
  return null;
}

export function isAdminRole(role?: string | null): boolean {
  return normalizeRole(role) === "admin";
}

export function isEmployeeRole(role?: string | null): boolean {
  return normalizeRole(role) === "employee";
}

export function isWorkshopRole(role?: string | null): boolean {
  return normalizeRole(role) === "workshop_owner";
}

export function getEmployeePermissions(employeeRole?: string | null): Permission[] {
  const normalized = normalizeEmployeeRole(employeeRole);
  if (!normalized) return [];
  if (normalized === "manager") {
    return [
      "sales.dashboard.view",
      "sales.customers.view_own",
      "sales.workshops.view_own",
      "orders.view",
      "orders.update_status",
      "customers.view",
      "customers.contact",
      "reports.sales",
      "parts.create",
      "parts.edit",
      "packages.create",
      "packages.edit",
      "cars.create",
      "cars.edit",
      "appointments.view",
      "reviews.view",
      ...MANAGER_ONLY_PERMISSIONS,
    ];
  }
  return EMPLOYEE_PERMISSIONS[normalized].filter((permission): permission is Permission => permission !== "*");
}

export function hasPermission(user: Pick<AppUser, "role" | "employeeRole"> | null | undefined, permission: Permission): boolean {
  if (!user) return false;
  if (isAdminRole(user.role)) return true;
  if (!isEmployeeRole(user.role)) return false;

  const normalizedEmployeeRole = normalizeEmployeeRole(user.employeeRole);
  if (!normalizedEmployeeRole) return false;

  if (normalizedEmployeeRole === "manager") return true;

  return getEmployeePermissions(normalizedEmployeeRole).includes(permission);
}

export function isRole(user: Pick<AppUser, "role"> | null | undefined, role: AppRole): boolean {
  if (!user) return false;
  return normalizeRole(user.role) === normalizeRole(role);
}

export function getRoleLabel(role?: string | null, employeeRole?: string | null): string {
  const normalizedRole = normalizeRole(role);
  const normalizedEmployeeRole = normalizeEmployeeRole(employeeRole);

  if (normalizedRole === "admin") return "مدير النظام";
  if (normalizedRole === "customer") return "عميل";
  if (normalizedRole === "workshop_owner") return "صاحب ورشة";
  if (normalizedRole === "employee") {
    if (normalizedEmployeeRole === "sales") return "موظف مبيعات";
    if (normalizedEmployeeRole === "data_entry") return "موظف إدخال بيانات";
    if (normalizedEmployeeRole === "customer_service") return "خدمة العملاء";
    if (normalizedEmployeeRole === "manager") return "مدير فريق";
    return "موظف";
  }
  return "مستخدم";
}

export function canAccessAdminPath(user: AppUser | null | undefined, path: string): { allowed: boolean; redirectTo?: string } {
  if (!user) return { allowed: false, redirectTo: "/login" };
  if (isAdminRole(user.role)) return { allowed: true };
  if (!isEmployeeRole(user.role)) return { allowed: false, redirectTo: "/" };

  if (path === "/admin" || path === "/admin/" || path === "/admin/dashboard" || path === "/admin/dashboard/") {
    return { allowed: false, redirectTo: getEmployeeHomePath(user) };
  }

  const matchedRule = ADMIN_ROUTE_RULES.find((entry) => entry.match.test(path));
  if (!matchedRule) return { allowed: false, redirectTo: "/admin/employee/dashboard" };

  if (matchedRule.rule.allowEmployee === false) {
    return { allowed: false, redirectTo: matchedRule.rule.redirectEmployeeTo ?? "/admin/employee/dashboard" };
  }

  if (!matchedRule.rule.permission) return { allowed: true };

  return hasPermission(user, matchedRule.rule.permission)
    ? { allowed: true }
    : { allowed: false, redirectTo: "/admin/employee/dashboard" };
}

export function canAccessWorkshopPath(user: AppUser | null | undefined): { allowed: boolean; redirectTo?: string } {
  if (!user) return { allowed: false, redirectTo: "/login" };
  if (isWorkshopRole(user.role)) return { allowed: true };
  if (isAdminRole(user.role) || isEmployeeRole(user.role)) return { allowed: false, redirectTo: "/admin" };
  return { allowed: false, redirectTo: "/" };
}

export function getEmployeeHomePath(user: AppUser | null | undefined): string {
  if (!user) return "/";
  if (isAdminRole(user.role)) return "/admin";
  if (isEmployeeRole(user.role)) {
    return normalizeEmployeeRole(user.employeeRole) === "sales"
      ? "/admin/employee/dashboard"
      : "/admin/employee/dashboard";
  }
  if (isWorkshopRole(user.role)) return "/workshop";
  return "/";
}
