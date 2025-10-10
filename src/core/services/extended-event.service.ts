import { BaseService } from '@supa/services';
import type { SupabaseClient } from '@supabase/supabase-js';
import { ExtendedEvent } from '../types';

export class ExtendedEventService extends BaseService<ExtendedEvent> {
  constructor(protected supabase: SupabaseClient) {
    super('extended_event_log', supabase);
  }
}
