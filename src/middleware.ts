import { protectRoute } from '@supa/utils/protect-route';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Protect /admin routes requiring "admin" role
  const adminResponse = await protectRoute(request, {
    protectedPathPrefix: '/admin',
    redirectPath: '/admin/login',
    allowedRoles: ['admin'],
    exceptPaths: ['/admin/login']
  });
  if (adminResponse) return adminResponse;

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*']
};
