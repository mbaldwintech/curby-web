'use client';

import { UserRole } from '@core/enumerations';
import { useProfile } from '@features/users/hooks';
import { canAccessRoute, canAccessRoutePrefix } from '../utils';

/**
 * Hook to check route permissions for the current user
 */
export function useRoutePermissions() {
  const { profile } = useProfile();
  const userRole = profile?.role as UserRole | null;

  const canAccess = (routePath: string): boolean => {
    return canAccessRoute(userRole, routePath);
  };

  const canAccessPrefix = (routePrefix: string): boolean => {
    return canAccessRoutePrefix(userRole, routePrefix);
  };

  const hasAnyRole = (roles: UserRole[]): boolean => {
    return userRole ? roles.includes(userRole) : false;
  };

  const hasRole = (role: UserRole): boolean => {
    return userRole === role;
  };

  return {
    canAccess,
    canAccessPrefix,
    hasAnyRole,
    hasRole,
    userRole
  };
}
