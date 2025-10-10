import { BaseService } from '@supa/services';
import { GenericRecord } from '@supa/types';
import type { SupabaseClient } from '@supabase/supabase-js';
import { EventTypeKey } from '../enumerations';
import { Feedback } from '../types';
import { EventLoggerService } from './event-logger.service';

export class FeedbackService extends BaseService<Feedback> {
  private eventLoggerService: EventLoggerService;

  constructor(protected supabase: SupabaseClient) {
    super('feedback', supabase);
    this.eventLoggerService = new EventLoggerService(supabase);
  }

  async create(data: Omit<Feedback, keyof GenericRecord>): Promise<Feedback> {
    const createdFeedback = await super.create(data);
    await this.eventLoggerService.log(EventTypeKey.FeedbackSent, { feedbackId: createdFeedback.id });
    return createdFeedback;
  }
}
