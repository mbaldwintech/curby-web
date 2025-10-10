import { BaseService } from '@supa/services';
import { SupabaseClient } from '@supabase/supabase-js';
import { EventTypeKey } from '../enumerations';
import { TermsAndConditions } from '../types';
import { EventLoggerService } from './event-logger.service';
import { TermsAndConditionsAcceptanceService } from './terms-and-conditions-acceptance.service';

export class TermsAndConditionsService extends BaseService<TermsAndConditions> {
  protected eventLoggerService: EventLoggerService;
  protected termsAndConditionsAcceptanceService: TermsAndConditionsAcceptanceService;

  constructor(protected supabase: SupabaseClient) {
    super('terms_and_conditions', supabase);
    this.eventLoggerService = new EventLoggerService(supabase);
    this.termsAndConditionsAcceptanceService = new TermsAndConditionsAcceptanceService(supabase);
  }

  async getCurrent(): Promise<TermsAndConditions> {
    const terms = await this.getOne([], 'effectiveDate', false);

    if (!terms) {
      throw new Error('Terms and Conditions not found');
    }

    return terms;
  }

  async hasUserAcceptedCurrent(): Promise<{ hasAccepted: boolean; termsAndConditions: TermsAndConditions | null }> {
    const user = await this.getUser();
    const current = await this.getCurrent();

    if (!current) {
      return { hasAccepted: false, termsAndConditions: null };
    }

    const acceptance = await this.termsAndConditionsAcceptanceService.getOneOrNull([
      { column: 'userId', operator: 'eq', value: user.id },
      { column: 'termsAndConditionsId', operator: 'eq', value: current.id }
    ]);

    return {
      hasAccepted: !!acceptance,
      termsAndConditions: current
    };
  }

  async acceptCurrent(): Promise<TermsAndConditions | null> {
    const user = await this.getUser();
    const current = await this.getCurrent();

    if (!current) {
      throw new Error('No Terms and Conditions available to accept');
    }

    await this.termsAndConditionsAcceptanceService.create({
      userId: user.id,
      termsAndConditionsId: current.id,
      acceptedAt: new Date()
    });

    await this.eventLoggerService.log(EventTypeKey.TermsAndConditionsAccepted, {
      termsAndConditionsId: current.id,
      userId: user.id
    });

    return current;
  }
}
