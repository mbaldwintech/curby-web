import { BaseService } from '@supa/services';
import { SupabaseClient } from '@supabase/supabase-js';
import { ItemMedia } from '../types';

export class ItemMediaService extends BaseService<ItemMedia> {
  constructor(protected supabase: SupabaseClient) {
    super('item_media', supabase);
  }
}
