import { BaseService } from '@supa/services';
import { SupabaseClient } from '@supabase/supabase-js';
import { EventTypeKey } from '../enumerations';
import { PrivacyPolicy } from '../types';
import { EventLoggerService } from './event-logger.service';
import { PrivacyPolicyAcceptanceService } from './privacy-policy-acceptance.service';

export class PrivacyPolicyService extends BaseService<PrivacyPolicy> {
  protected eventLoggerService: EventLoggerService;
  protected privacyPolicyAcceptanceService: PrivacyPolicyAcceptanceService;

  constructor(protected supabase: SupabaseClient) {
    super('privacy_policy', supabase);
    this.eventLoggerService = new EventLoggerService(supabase);
    this.privacyPolicyAcceptanceService = new PrivacyPolicyAcceptanceService(supabase);
  }

  async getCurrent(): Promise<PrivacyPolicy> {
    const policy = await this.getOne([], 'effectiveDate', false);

    if (!policy) {
      throw new Error('Privacy Policy not found');
    }

    return policy;
  }

  async hasUserAcceptedCurrent(): Promise<{ hasAccepted: boolean; privacyPolicy: PrivacyPolicy | null }> {
    const user = await this.getUser();
    const current = await this.getCurrent();

    if (!current) {
      return { hasAccepted: false, privacyPolicy: null };
    }

    const acceptance = await this.privacyPolicyAcceptanceService.getOneOrNull([
      { column: 'userId', operator: 'eq', value: user.id },
      { column: 'privacyPolicyId', operator: 'eq', value: current.id }
    ]);

    return {
      hasAccepted: !!acceptance,
      privacyPolicy: current
    };
  }

  async acceptCurrent(): Promise<PrivacyPolicy | null> {
    const user = await this.getUser();
    const current = await this.getCurrent();

    if (!current) {
      throw new Error('No Privacy Policy available to accept');
    }

    await this.privacyPolicyAcceptanceService.create({
      userId: user.id,
      privacyPolicyId: current.id,
      acceptedAt: new Date()
    });

    await this.eventLoggerService.log(EventTypeKey.PrivacyPolicyAccepted, {
      privacyPolicyId: current.id,
      userId: user.id
    });

    return current;
  }
}
