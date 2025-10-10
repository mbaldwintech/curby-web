import { BaseService } from '@supa/services';
import type { SupabaseClient } from '@supabase/supabase-js';
import { CurbyCoinTransactionType } from '../types';

export class CurbyCoinTransactionTypeService extends BaseService<CurbyCoinTransactionType> {
  constructor(protected supabase: SupabaseClient) {
    super('curby_coin_transaction_type', supabase);
  }
}
