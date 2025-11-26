import { BaseService } from '@supa/services';
import type { SupabaseClient } from '@supabase/supabase-js';
import { BroadcastDeliveryView, BroadcastDeliveryViewMetadata } from '../types';

export class BroadcastDeliveryViewService extends BaseService<BroadcastDeliveryView> {
  constructor(protected supabase: SupabaseClient) {
    super('broadcast_delivery_view', supabase, BroadcastDeliveryViewMetadata);
  }
}
