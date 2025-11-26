import { BaseService } from '@supa/services';
import type { SupabaseClient } from '@supabase/supabase-js';
import { Broadcast, BroadcastMetadata } from '../types';

export class BroadcastService extends BaseService<Broadcast> {
  constructor(protected supabase: SupabaseClient) {
    super('broadcast', supabase, BroadcastMetadata);
  }
}
