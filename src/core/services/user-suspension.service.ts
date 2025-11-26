import { UserSuspension, UserSuspensionMetadata } from '@core/types';
import { BaseService } from '@supa/services';
import { SupabaseClient } from '@supabase/supabase-js';

export class UserSuspensionService extends BaseService<UserSuspension> {
  constructor(protected supabase: SupabaseClient) {
    super('user_suspension', supabase, UserSuspensionMetadata);
  }
}
