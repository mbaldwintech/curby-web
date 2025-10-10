import { BaseService } from '@supa/services';
import { SupabaseClient } from '@supabase/supabase-js';
import { UserDevice } from '../types';

export class UserDeviceService extends BaseService<UserDevice> {
  constructor(protected supabase: SupabaseClient) {
    super('user_device', supabase);
  }

  async getAllMyUserDevices() {
    const user = await this.getUserOrNull();
    if (!user) {
      return [];
    }
    return this.getAll({ column: 'userId', operator: 'eq', value: user.id });
  }
}
