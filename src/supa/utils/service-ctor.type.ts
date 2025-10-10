import type { SupabaseClient } from '@supabase/supabase-js';

// ServiceCtor = a class that extends BaseService<T> and can take additional props
export type ServiceCtor<T, Args extends unknown[] = []> = new (supabase: SupabaseClient, ...args: Args) => T;
