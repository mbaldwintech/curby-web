import { BaseService } from '@supa/services';
import type { SupabaseClient } from '@supabase/supabase-js';
import { Event, EventMetadata } from '../types';

export class EventService extends BaseService<Event> {
  constructor(protected supabase: SupabaseClient) {
    super('event_log', supabase, EventMetadata);
  }
}
