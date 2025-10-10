import { BaseService } from '@supa/services';
import { SupabaseClient } from '@supabase/supabase-js';
import { ItemReport } from '../types';

export class ReportedItemService extends BaseService<ItemReport> {
  constructor(protected supabase: SupabaseClient) {
    super('reported_item', supabase);
  }
}
