import { UserWarning, UserWarningMetadata } from '@core/types';
import { BaseService } from '@supa/services';
import { SupabaseClient } from '@supabase/supabase-js';

export class UserWarningService extends BaseService<UserWarning> {
  constructor(protected supabase: SupabaseClient) {
    super('user_warning', supabase, UserWarningMetadata);
  }
}
