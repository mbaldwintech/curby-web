import { BaseService } from '@supa/services';
import { SupabaseClient } from '@supabase/supabase-js';
import { Notification, NotificationMetadata } from '../types';
import { getDeviceId } from '../utils';
import { DeviceService } from './device.service';

export class NotificationService extends BaseService<Notification> {
  protected deviceService: DeviceService;
  constructor(protected supabase: SupabaseClient) {
    super('notification', supabase, NotificationMetadata);
    this.deviceService = new DeviceService(supabase);
  }

  getMyUnreadNotifications = async (): Promise<Notification[]> => {
    const user = await this.getUserOrNull();
    const device = await this.deviceService.getMyDevice();
    if (user?.id) {
      return this.getAll([
        { column: 'userId', operator: 'eq', value: user.id },
        { column: 'read', operator: 'eq', value: false }
      ]);
    } else {
      return this.getAll([
        { column: 'userId', operator: 'eq', value: null },
        { column: 'deviceId', operator: 'eq', value: device.id },
        { column: 'read', operator: 'eq', value: false }
      ]);
    }
  };

  getMyUnreadCount = async (): Promise<number> => {
    const user = await this.getUserOrNull();
    const device = await this.deviceService.getMyDevice();
    if (user?.id) {
      return this.count([
        { column: 'userId', operator: 'eq', value: user.id },
        { column: 'read', operator: 'eq', value: false }
      ]);
    } else {
      return this.count([
        { column: 'userId', operator: 'eq', value: null },
        { column: 'deviceId', operator: 'eq', value: device.id },
        { column: 'read', operator: 'eq', value: false }
      ]);
    }
  };

  async markAsRead(notificationId: string) {
    return this.update(notificationId, { read: true, readAt: new Date() });
  }

  async markAsUnread(notificationId: string) {
    return this.update(notificationId, { read: false, readAt: null });
  }

  async markAllAsRead() {
    const deviceId = await getDeviceId();
    const user = await this.getUserOrNull();

    const updates: Partial<Notification> = { read: true, readAt: new Date() };

    if (user?.id) {
      await this.updateMany(updates, [{ column: 'userId', operator: 'eq', value: user.id }]);
    } else if (deviceId) {
      await this.updateMany(updates, [
        { column: 'userId', operator: 'eq', value: null },
        { column: 'deviceId', operator: 'eq', value: deviceId }
      ]);
    } else {
      throw new Error('No user or device found for marking notifications as read');
    }
  }
}
