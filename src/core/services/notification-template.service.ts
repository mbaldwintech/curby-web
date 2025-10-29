import { BaseService } from '@supa/services';
import type { SupabaseClient } from '@supabase/supabase-js';
import { NotificationTemplate, NotificationTemplateMetadata } from '../types';

export class NotificationTemplateService extends BaseService<NotificationTemplate> {
  constructor(protected supabase: SupabaseClient) {
    super('notification_template', supabase, NotificationTemplateMetadata);
  }
}
