import { BaseService } from '@supa/services';
import type { SupabaseClient } from '@supabase/supabase-js';
import { Schedule, ScheduleMetadata } from '../types';

export class ScheduleService extends BaseService<Schedule> {
  constructor(protected supabase: SupabaseClient) {
    super('schedule', supabase, ScheduleMetadata);
  }
}
