import { createServerClient } from '@supabase/ssr';
import { User } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

interface Profile {
  role: string;
  userId: string;
}

interface ProtectRouteOptions {
  protectedPathPrefix: string;
  loginRedirectPath: string; // Where to redirect if unauthenticated
  unauthorizedRedirectPath: string; // Where to redirect if authenticated but unauthorized
  allowedRoles?: string[];
  exceptPaths?: string[];
  requireAuth?: boolean; // Whether authentication is required
  customCheck?: (user: User, profile: Profile | null) => boolean; // Custom authorization logic
}

export async function protectRoute(
  request: NextRequest,
  {
    protectedPathPrefix,
    loginRedirectPath,
    unauthorizedRedirectPath,
    allowedRoles,
    exceptPaths = [],
    requireAuth = true,
    customCheck
  }: ProtectRouteOptions
): Promise<NextResponse> {
  const response = NextResponse.next({ request });

  if (exceptPaths.includes(request.nextUrl.pathname)) {
    return response;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        }
      }
    }
  );

  const {
    data: { user }
  } = await supabase.auth.getUser();

  // Check if authentication is required and user is not authenticated
  if (requireAuth && !user && request.nextUrl.pathname.startsWith(protectedPathPrefix)) {
    const url = request.nextUrl.clone();
    url.pathname = loginRedirectPath;
    return NextResponse.redirect(url);
  }

  // If user is authenticated, check roles and custom logic
  if (user && request.nextUrl.pathname.startsWith(protectedPathPrefix)) {
    const { data: profile } = await supabase.from('profile').select('role, userId').eq('userId', user.id).single();

    // Check allowed roles
    if (allowedRoles && allowedRoles.length > 0) {
      if (!profile || !allowedRoles.includes(profile.role)) {
        const url = request.nextUrl.clone();
        url.pathname = unauthorizedRedirectPath;
        return NextResponse.redirect(url);
      }
    }

    // Check custom authorization logic
    if (customCheck && !customCheck(user, profile)) {
      const url = request.nextUrl.clone();
      url.pathname = unauthorizedRedirectPath;
      return NextResponse.redirect(url);
    }
  }

  return response;
}
