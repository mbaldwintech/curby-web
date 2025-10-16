import { BaseService } from '@supa/services';
import { SupabaseClient } from '@supabase/supabase-js';
import { ItemReport } from '../types';

export class ItemReportService extends BaseService<ItemReport> {
  constructor(protected supabase: SupabaseClient) {
    super('item_report', supabase);
  }
}
