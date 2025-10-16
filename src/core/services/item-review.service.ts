import { BaseService } from '@supa/services';
import { SupabaseClient } from '@supabase/supabase-js';
import { ItemReview } from '../types';

export class ItemReviewService extends BaseService<ItemReview> {
  constructor(protected supabase: SupabaseClient) {
    super('item_review', supabase);
  }
}
