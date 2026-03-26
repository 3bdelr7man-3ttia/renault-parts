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
  { match: /^\/admin\/employee\/technical\/?$/, rule: { allowAdmin: true, allowEmployee: true, permission: "technical.cases.view_own" } },
  { match: /^\/admin\/employee\/returns\/?$/, rule: { allowAdmin: true, allowEmployee: true, permission: "technical.cases.view_own" } },
  { match: /^\/admin\/employee\/data-entry\/?$/, rule: { allowAdmin: true, allowEmployee: true, permission: "data_entry.leads.view" } },
  { match: /^\/admin\/employee\/customers\/?$/, rule: { allowAdmin: true, allowEmployee: true, permission: "sales.customers.view_own" } },
  { match: /^\/admin\/employee\/workshops\/?$/, rule: { allowAdmin: true, allowEmployee: true, permission: "sales.workshops.view_own" } },
  { match: /^\/admin\/employee\/tasks\/?$/, rule: { allowAdmin: true, allowEmployee: true, permission: "employee.tasks.view_own" } },
  { match: /^\/admin\/employee\/reports\/?$/, rule: { allowAdmin: true, allowEmployee: true, permission: "employee.reports.view_own" } },
  { match: /^\/admin\/employee\/team\/?$/, rule: { allowAdmin: true, allowEmployee: true, permission: "sales.team.view" } },
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
  if (employeeRole === "customer_service") return "sales";
  if (employeeRole === "sales" || employeeRole === "data_entry" || employeeRole === "technical_expert" || employeeRole === "marketing_tech" || employeeRole === "manager") {
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
      "technical.dashboard.view",
      "technical.cases.view_own",
      "technical.cases.update_own",
      "employee.tasks.view_own",
      "employee.tasks.create_own",
      "employee.tasks.update_own",
      "employee.reports.view_own",
      "employee.reports.create_own",
      "data_entry.dashboard.view",
      "data_entry.leads.view",
      "data_entry.leads.create",
      "sales.customers.view_own",
      "sales.customers.create_own",
      "sales.workshops.view_own",
      "sales.workshops.create_own",
      "sales.team.view",
      "sales.team.assign",
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
      "workshops.manage",
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
    if (normalizedEmployeeRole === "sales") return "مبيعات ومتابعة";
    if (normalizedEmployeeRole === "data_entry") return "داتا وقطع";
    if (normalizedEmployeeRole === "technical_expert") return "خبير فني";
    if (normalizedEmployeeRole === "marketing_tech") return "تسويق وتقنية";
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
    const employeeRole = normalizeEmployeeRole(user.employeeRole);
    if (employeeRole === "technical_expert") return "/admin/employee/technical";
    if (employeeRole === "data_entry") return "/admin/employee/data-entry";
    return "/admin/employee/dashboard";
  }
  if (isWorkshopRole(user.role)) return "/workshop";
  return "/";
}
