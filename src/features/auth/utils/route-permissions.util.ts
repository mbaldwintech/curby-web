import { UserRole } from '@core/enumerations';

// All admin routes share the same allowed roles
const ADMIN_ALLOWED_ROLES = [UserRole.Admin, UserRole.Moderator, UserRole.Support];

/**
 * Check if a user with a given role can access a specific route
 */
export function canAccessRoute(userRole: UserRole | null, routePath: string): boolean {
  if (!userRole) return false;

  // All /admin routes require the same roles
  if (routePath.startsWith('/admin')) {
    return ADMIN_ALLOWED_ROLES.includes(userRole);
  }

  // Non-admin routes are accessible to all authenticated users
  return true;
}

/**
 * Check if a user can access any route that starts with a given prefix
 */
export function canAccessRoutePrefix(userRole: UserRole | null, routePrefix: string): boolean {
  if (!userRole) return false;

  // All /admin routes require the same roles
  if (routePrefix.startsWith('/admin')) {
    return ADMIN_ALLOWED_ROLES.includes(userRole);
  }

  return true;
}
