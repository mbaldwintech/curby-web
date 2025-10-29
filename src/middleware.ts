import { UserRole } from '@core/enumerations';
import { protectRoute } from '@supa/utils/protect-route';
import { NextResponse, type NextRequest } from 'next/server';

export interface RouteProtectionRule {
  pathPattern: string;
  allowedRoles: UserRole[];
  loginRedirectPath: string;
  unauthorizedRedirectPath: string;
  exceptPaths?: string[];
}

// Define route protection rules
export const routeProtectionRules: RouteProtectionRule[] = [
  {
    pathPattern: '/admin/curby-coins/:path*',
    allowedRoles: [UserRole.Admin, UserRole.Moderator, UserRole.Support],
    loginRedirectPath: '/admin/login',
    unauthorizedRedirectPath: '/admin/unauthorized'
  },
  {
    pathPattern: '/admin/devices/:path*',
    allowedRoles: [UserRole.Admin, UserRole.Moderator, UserRole.Support],
    loginRedirectPath: '/admin/login',
    unauthorizedRedirectPath: '/admin/unauthorized'
  },
  {
    pathPattern: '/admin/events/:path*',
    allowedRoles: [UserRole.Admin, UserRole.Moderator, UserRole.Support],
    loginRedirectPath: '/admin/login',
    unauthorizedRedirectPath: '/admin/unauthorized'
  },
  {
    pathPattern: '/admin/feedback/:path*',
    allowedRoles: [UserRole.Admin, UserRole.Moderator, UserRole.Support],
    loginRedirectPath: '/admin/login',
    unauthorizedRedirectPath: '/admin/unauthorized'
  },
  {
    pathPattern: '/admin/items/:path*',
    allowedRoles: [UserRole.Admin, UserRole.Moderator, UserRole.Support],
    loginRedirectPath: '/admin/login',
    unauthorizedRedirectPath: '/admin/unauthorized'
  },
  {
    pathPattern: '/admin/legal/:path*',
    allowedRoles: [UserRole.Admin, UserRole.Moderator, UserRole.Support],
    loginRedirectPath: '/admin/login',
    unauthorizedRedirectPath: '/admin/unauthorized'
  },
  {
    pathPattern: '/admin/media/:path*',
    allowedRoles: [UserRole.Admin, UserRole.Moderator, UserRole.Support],
    loginRedirectPath: '/admin/login',
    unauthorizedRedirectPath: '/admin/unauthorized'
  },
  {
    pathPattern: '/admin/moderation/:path*',
    allowedRoles: [UserRole.Admin, UserRole.Moderator, UserRole.Support],
    loginRedirectPath: '/admin/login',
    unauthorizedRedirectPath: '/admin/unauthorized'
  },
  {
    pathPattern: '/admin/notifications/:path*',
    allowedRoles: [UserRole.Admin, UserRole.Moderator, UserRole.Support],
    loginRedirectPath: '/admin/login',
    unauthorizedRedirectPath: '/admin/unauthorized'
  },
  {
    pathPattern: '/admin/profile/:path*',
    allowedRoles: [UserRole.Admin, UserRole.Moderator, UserRole.Support],
    loginRedirectPath: '/admin/login',
    unauthorizedRedirectPath: '/admin/unauthorized'
  },
  {
    pathPattern: '/admin/tutorials/:path*',
    allowedRoles: [UserRole.Admin, UserRole.Moderator, UserRole.Support],
    loginRedirectPath: '/admin/login',
    unauthorizedRedirectPath: '/admin/unauthorized'
  },
  {
    pathPattern: '/admin/users/:path*',
    allowedRoles: [UserRole.Admin, UserRole.Moderator, UserRole.Support],
    loginRedirectPath: '/admin/login',
    unauthorizedRedirectPath: '/admin/unauthorized'
  },
  {
    pathPattern: '/admin',
    allowedRoles: [UserRole.Admin, UserRole.Moderator, UserRole.Support],
    loginRedirectPath: '/admin/login',
    unauthorizedRedirectPath: '/admin/unauthorized'
  },
  {
    pathPattern: '/admin/:path*',
    allowedRoles: [UserRole.Admin, UserRole.Moderator, UserRole.Support],
    loginRedirectPath: '/admin/login',
    unauthorizedRedirectPath: '/admin/unauthorized',
    exceptPaths: ['/admin/login', '/admin/unauthorized']
  }
];

export async function middleware(request: NextRequest) {
  // Find the first matching rule for the current path
  for (const rule of routeProtectionRules) {
    if (matchesPathPattern(request.nextUrl.pathname, rule.pathPattern)) {
      const response = await protectRoute(request, {
        protectedPathPrefix: extractPrefix(rule.pathPattern),
        loginRedirectPath: rule.loginRedirectPath,
        unauthorizedRedirectPath: rule.unauthorizedRedirectPath,
        allowedRoles: rule.allowedRoles,
        exceptPaths: rule.exceptPaths || []
      });

      // If protectRoute returns a redirect, return it immediately
      if (response.status === 307 || response.status === 302) {
        return response;
      }
    }
  }

  return NextResponse.next();
}

// Helper function to match path patterns (supports :path* wildcards)
function matchesPathPattern(currentPath: string, pattern: string): boolean {
  // Convert pattern to regex
  const regexPattern = pattern
    .replace(/:\w+\*/g, '.*') // Replace :path* with .*
    .replace(/:\w+/g, '[^/]+'); // Replace :param with [^/]+

  const regex = new RegExp(`^${regexPattern}$`);
  return regex.test(currentPath);
}

// Helper function to extract the prefix from a pattern
function extractPrefix(pattern: string): string {
  // Extract the base path before any wildcards
  const match = pattern.match(/^(\/[^:]*)/);
  return match ? match[1] : '/';
}

export const config = {
  matcher: '/admin/:path*'
};
