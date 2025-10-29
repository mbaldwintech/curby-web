import { UserRole } from '@core/enumerations';
import { routeProtectionRules, type RouteProtectionRule } from '../../../middleware';

/**
 * Check if a user with a given role can access a specific route
 */
export function canAccessRoute(userRole: UserRole | null, routePath: string): boolean {
  if (!userRole) return false;

  // Find the most specific matching rule for this route
  const matchingRule = findMatchingRule(routePath);

  if (!matchingRule) {
    // No specific rule found, assume it's accessible to all authenticated users
    return true;
  }

  // Check if user's role is in the allowed roles
  return matchingRule.allowedRoles.includes(userRole);
}

/**
 * Get all routes that a user can access based on their role
 */
export function getAccessibleRoutes(userRole: UserRole | null): string[] {
  if (!userRole) return [];

  const accessibleRoutes: string[] = [];

  // Check each route pattern against the user's role
  routeProtectionRules.forEach((rule) => {
    if (rule.allowedRoles.includes(userRole)) {
      // Convert pattern back to a base route
      const baseRoute = extractRouteFromPattern(rule.pathPattern);
      if (baseRoute && !accessibleRoutes.includes(baseRoute)) {
        accessibleRoutes.push(baseRoute);
      }
    }
  });

  return accessibleRoutes;
}

/**
 * Check if a user can access any route that starts with a given prefix
 */
export function canAccessRoutePrefix(userRole: UserRole | null, routePrefix: string): boolean {
  if (!userRole) return false;

  return routeProtectionRules.some((rule) => {
    const baseRoute = extractRouteFromPattern(rule.pathPattern);
    return baseRoute?.startsWith(routePrefix) && rule.allowedRoles.includes(userRole);
  });
}

// Helper function to find the most specific matching rule
function findMatchingRule(routePath: string): RouteProtectionRule | null {
  // Sort rules by specificity (more specific patterns first)
  const sortedRules = [...routeProtectionRules].sort((a, b) => {
    const aSpecificity = getPatternSpecificity(a.pathPattern);
    const bSpecificity = getPatternSpecificity(b.pathPattern);
    return bSpecificity - aSpecificity;
  });

  for (const rule of sortedRules) {
    if (matchesPathPattern(routePath, rule.pathPattern)) {
      return rule;
    }
  }

  return null;
}

// Helper function to calculate pattern specificity
function getPatternSpecificity(pattern: string): number {
  // More segments = more specific
  const segments = pattern.split('/').length;
  // Patterns without wildcards are more specific
  const hasWildcard = pattern.includes(':path*') || pattern.includes(':');
  return segments + (hasWildcard ? 0 : 10);
}

// Helper function to match path patterns (same as middleware)
function matchesPathPattern(currentPath: string, pattern: string): boolean {
  const regexPattern = pattern.replace(/:\w+\*/g, '.*').replace(/:\w+/g, '[^/]+');

  const regex = new RegExp(`^${regexPattern}$`);
  return regex.test(currentPath);
}

// Helper function to extract base route from pattern
function extractRouteFromPattern(pattern: string): string | null {
  // Remove wildcards and extract the base path
  const match = pattern.match(/^(\/[^:]*)/);
  return match ? match[1] : null;
}
