import { UserBan, UserBanMetadata } from '@core/types';
import { BaseService } from '@supa/services';
import { SupabaseClient } from '@supabase/supabase-js';

export class UserBanService extends BaseService<UserBan> {
  constructor(protected supabase: SupabaseClient) {
    super('user_ban', supabase, UserBanMetadata);
  }
}
