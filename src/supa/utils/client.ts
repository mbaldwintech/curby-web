import { createBrowserClient } from '@supabase/ssr';
import { ServiceCtor } from './service-ctor.type';

const apiUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const apiKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!apiUrl || !apiKey) {
  throw new Error('Supabase API URL and API Key must be provided in environment variables.');
}

export function createClient() {
  return createBrowserClient(apiUrl!, apiKey!);
}

/**
 * Create a client-side service instance
 */
export function createClientService<T, Args extends unknown[] = []>(Service: ServiceCtor<T, Args>, ...props: Args): T {
  const supabase = createClient();
  return new Service(supabase, ...props);
}
