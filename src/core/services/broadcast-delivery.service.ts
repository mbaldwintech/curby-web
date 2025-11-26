import { BaseService } from '@supa/services';
import type { SupabaseClient } from '@supabase/supabase-js';
import { BroadcastDelivery, BroadcastDeliveryMetadata } from '../types';

export class BroadcastDeliveryService extends BaseService<BroadcastDelivery> {
  constructor(protected supabase: SupabaseClient) {
    super('broadcast_delivery', supabase, BroadcastDeliveryMetadata);
  }
}
