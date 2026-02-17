import { UserRole } from '@core/enumerations';
import { protectRoute } from '@supa/utils/protect-route';
import { type NextRequest } from 'next/server';

// All admin routes share the same protection: require Admin, Moderator, or Support role.
// The Next.js matcher (below) ensures this middleware only runs on /admin/* paths.
// Login and unauthorized pages are excluded so unauthenticated users can reach them.
const ADMIN_ALLOWED_ROLES = [UserRole.Admin, UserRole.Moderator, UserRole.Support];
const ADMIN_EXCEPT_PATHS = ['/admin/login', '/admin/unauthorized'];

export async function middleware(request: NextRequest) {
  return protectRoute(request, {
    protectedPathPrefix: '/admin',
    loginRedirectPath: '/admin/login',
    unauthorizedRedirectPath: '/admin/unauthorized',
    allowedRoles: ADMIN_ALLOWED_ROLES,
    exceptPaths: ADMIN_EXCEPT_PATHS
  });
}

export const config = {
  matcher: '/admin/:path*'
};
