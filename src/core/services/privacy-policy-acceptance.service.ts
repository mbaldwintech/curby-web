import { BaseService } from '@supa/services';
import type { SupabaseClient } from '@supabase/supabase-js';
import { PrivacyPolicyAcceptance } from '../types';

export class PrivacyPolicyAcceptanceService extends BaseService<PrivacyPolicyAcceptance> {
  constructor(protected supabase: SupabaseClient) {
    super('privacy_policy_acceptance', supabase);
  }
}
