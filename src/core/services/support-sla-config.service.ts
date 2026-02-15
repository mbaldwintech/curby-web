import { BaseService } from '@supa/services';
import { SupabaseClient } from '@supabase/supabase-js';
import { SupportSlaConfig, SupportSlaConfigMetadata } from '../types';
import { createLogger } from '@core/utils';

const logger = createLogger('SupportSlaConfigService');

export class SupportSlaConfigService extends BaseService<SupportSlaConfig> {
  constructor(protected supabase: SupabaseClient) {
    super('support_sla_config', supabase, SupportSlaConfigMetadata);
  }

  async getActiveSlaForRequest(category: string, priority: string): Promise<SupportSlaConfig | null> {
    const { data, error } = await this.supabase
      .from('support_sla_config')
      .select('*')
      .eq('category', category)
      .eq('priority', priority)
      .eq('active', true)
      .single();

    if (error) {
      logger.error('Error fetching SLA config:', error);
      return null;
    }

    return data;
  }

  async checkSlaStatus(
    supportRequestId: string,
    createdAt: string,
    category: string,
    priority: string
  ): Promise<{
    responseBreached: boolean;
    resolutionBreached: boolean;
    responseTimeRemaining?: number;
    resolutionTimeRemaining?: number;
  }> {
    const sla = await this.getActiveSlaForRequest(category, priority);

    if (!sla) {
      return {
        responseBreached: false,
        resolutionBreached: false
      };
    }

    const now = new Date();
    const created = new Date(createdAt);
    const hoursSinceCreation = (now.getTime() - created.getTime()) / (1000 * 60 * 60);

    const responseBreached = hoursSinceCreation > sla.responseTimeHours;
    const resolutionBreached = hoursSinceCreation > sla.resolutionTimeHours;

    return {
      responseBreached,
      resolutionBreached,
      responseTimeRemaining: Math.max(0, sla.responseTimeHours - hoursSinceCreation),
      resolutionTimeRemaining: Math.max(0, sla.resolutionTimeHours - hoursSinceCreation)
    };
  }
}
