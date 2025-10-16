import { BaseService } from '@supa/services';
import { SupabaseClient } from '@supabase/supabase-js';
import { UserReview } from '../types';

export class UserReviewService extends BaseService<UserReview> {
  constructor(protected supabase: SupabaseClient) {
    super('user_review', supabase);
  }
}
