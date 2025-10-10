import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { ServiceCtor } from './service-ctor.type';

const apiUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const apiKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!apiUrl || !apiKey) {
  throw new Error('Supabase API URL and API Key must be provided in environment variables.');
}

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(apiUrl!, apiKey!, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      }
    }
  });
}

/**
 * Create a server-side service instance
 */
export async function createServerService<T, Args extends unknown[] = []>(
  Service: ServiceCtor<T, Args>,
  ...props: Args
): Promise<T> {
  const supabase = await createClient();
  return new Service(supabase, ...props);
}
