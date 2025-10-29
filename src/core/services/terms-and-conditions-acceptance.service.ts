import { BaseService } from '@supa/services';
import type { SupabaseClient } from '@supabase/supabase-js';
import { TermsAndConditionsAcceptance, TermsAndConditionsAcceptanceMetadata } from '../types';

export class TermsAndConditionsAcceptanceService extends BaseService<TermsAndConditionsAcceptance> {
  constructor(protected supabase: SupabaseClient) {
    super('terms_and_conditions_acceptance', supabase, TermsAndConditionsAcceptanceMetadata);
  }
}
