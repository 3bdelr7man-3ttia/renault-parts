import type { AppUser } from "./src/lib/permissions";
import { canAccessAdminPath, canAccessWorkshopPath } from "./src/lib/permissions";

export type RouteAccessResult = {
  allowed: boolean;
  redirectTo?: string;
};

export function evaluateRouteAccess(path: string, user: AppUser | null | undefined): RouteAccessResult {
  if (path === "/admin" || path.startsWith("/admin/")) {
    return canAccessAdminPath(user, path);
  }

  if (path === "/workshop" || path.startsWith("/workshop/")) {
    return canAccessWorkshopPath(user);
  }

  return { allowed: true };
}
