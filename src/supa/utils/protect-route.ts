import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';

interface ProtectRouteOptions {
  protectedPathPrefix: string;
  redirectPath: string;
  allowedRoles?: string[];
  exceptPaths?: string[];
}

export async function protectRoute(
  request: NextRequest,
  { protectedPathPrefix, redirectPath, allowedRoles, exceptPaths = [] }: ProtectRouteOptions
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

  if (!user && request.nextUrl.pathname.startsWith(protectedPathPrefix)) {
    const url = request.nextUrl.clone();
    url.pathname = redirectPath;
    return NextResponse.redirect(url);
  }

  if (allowedRoles && allowedRoles.length > 0 && user) {
    const { data: profile } = await supabase.from('profile').select('role').eq('userId', user.id).single();

    if (!profile || !allowedRoles.includes(profile.role)) {
      const url = request.nextUrl.clone();
      url.pathname = redirectPath;
      return NextResponse.redirect(url);
    }
  }

  return response;
}
