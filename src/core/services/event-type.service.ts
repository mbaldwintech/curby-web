import { BaseService } from '@supa/services';
import type { SupabaseClient } from '@supabase/supabase-js';
import { EventType, EventTypeMetadata } from '../types';

export class EventTypeService extends BaseService<EventType> {
  constructor(protected supabase: SupabaseClient) {
    super('event_type', supabase, EventTypeMetadata);
  }
}
