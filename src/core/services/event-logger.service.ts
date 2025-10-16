import type { SupabaseClient } from '@supabase/supabase-js';
import { User } from '@supabase/supabase-js';
import { EventTypeKey } from '../enumerations';
import { getDeviceId } from '../utils';
import { FunctionsService } from './functions.service';

export class EventLoggerService {
  protected functionsService: FunctionsService;
  _deviceId: string | undefined;
  set deviceId(value: string | undefined) {
    this._deviceId = value;
  }
  get deviceId() {
    return this._deviceId;
  }

  constructor(protected supabase: SupabaseClient) {
    this.functionsService = new FunctionsService(supabase);

    this.log = this.log.bind(this);
  }

  async getUserOrNull(): Promise<User | null> {
    const { data, error } = await this.supabase.auth.getUser();

    if (error) {
      console.error('Error fetching user for event logger:', error);
      return null;
    }

    return data.user;
  }

  async log(
    eventKey: (typeof EventTypeKey)[keyof typeof EventTypeKey],
    metadata: Record<string, unknown> = {}
  ): Promise<void> {
    const user = await this.getUserOrNull();
    let deviceId = await getDeviceId();
    if (!deviceId) {
      deviceId = this.deviceId;
    }
    if (!deviceId && !user) {
      console.warn('No device ID available for event logging');
      return;
    }

    const { data: device, error } = await this.supabase.from('device').select('*').eq('deviceId', deviceId).single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching device for event logger:', error);
      return;
    }

    // Log event via Supabase Edge Function
    await this.functionsService.trackEvent(eventKey, {
      userId: user?.id,
      deviceId: device?.id,
      metadata
    });
  }
}
