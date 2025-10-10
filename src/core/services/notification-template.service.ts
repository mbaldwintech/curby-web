import { BaseService } from '@supa/services';
import type { SupabaseClient } from '@supabase/supabase-js';
import { NotificationTemplate } from '../types';

export class NotificationTemplateService extends BaseService<NotificationTemplate> {
  constructor(protected supabase: SupabaseClient) {
    super('notification_template', supabase);
  }
}
