import { BaseService } from '@supa/services';
import type { SupabaseClient } from '@supabase/supabase-js';
import { FalseTaking } from '../types';

export class FalseTakingService extends BaseService<FalseTaking> {
  constructor(protected supabase: SupabaseClient) {
    super('false_taking', supabase);
  }
}
