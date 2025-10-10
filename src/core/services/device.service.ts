import { BaseService } from '@supa/services';
import type { SupabaseClient } from '@supabase/supabase-js';
import { PostgrestResponse, PostgrestSingleResponse } from '@supabase/supabase-js';
import { EventTypeKey } from '../enumerations';
import { Device, UserDevice } from '../types';
import { geoJsonPointToWkt, getCurrentGeoJson, getDeviceId, getDeviceInfo } from '../utils';
import { EventLoggerService } from './event-logger.service';
import { UserDeviceService } from './user-device.service';

export class DeviceService extends BaseService<Device> {
  protected userDeviceService: UserDeviceService;
  protected eventLoggerService: EventLoggerService;
  _deviceId: string | undefined;
  set deviceId(value: string | undefined) {
    this._deviceId = value;
  }
  get deviceId() {
    return this._deviceId;
  }

  constructor(protected supabase: SupabaseClient) {
    super('device', supabase);
    this.userDeviceService = new UserDeviceService(supabase);
    this.eventLoggerService = new EventLoggerService(supabase);
  }

  async getMyDevice(): Promise<Device> {
    const deviceInfo = await getDeviceInfo();
    const user = await this.getUserOrNull();
    const location = await getCurrentGeoJson(); // browser-compatible version
    const geoLocation = location ? geoJsonPointToWkt(location) : undefined;

    if (!deviceInfo.deviceId) {
      if (this.deviceId) {
        deviceInfo.deviceId = this.deviceId;
      } else {
        throw new Error('No device ID found');
      }
    }

    let device = await this.getOneOrNull({ column: 'deviceId', operator: 'eq', value: deviceInfo.deviceId });

    const updates: Partial<Device> = {
      ...deviceInfo,
      lastSeenAt: new Date(),
      tokenValid: false,
      geoLocation: geoLocation ?? device?.geoLocation,
      location: location ?? device?.location
    };

    if (!device) {
      const { data, error }: PostgrestSingleResponse<Device> = await this.supabase
        .from(this.table)
        .insert({
          ...updates,
          createdAt: new Date(),
          createdBy: user?.id,
          updatedAt: new Date(),
          updatedBy: user?.id
        })
        .select()
        .single();

      if (error) throw error;
      device = data;
      await this.eventLoggerService.log(EventTypeKey.DeviceAdded, { deviceType: device.type });
    } else {
      const { data, error }: PostgrestSingleResponse<Device> = await this.supabase
        .from(this.table)
        .update({ ...updates, updatedAt: new Date(), updatedBy: user?.id })
        .eq('id', device.id)
        .select()
        .single();

      if (error) throw error;
      device = data;
    }

    if (user) {
      const userDevice = await this.userDeviceService.getOneOrNull([
        {
          column: 'userId',
          operator: 'eq',
          value: user.id
        },
        {
          column: 'deviceId',
          operator: 'eq',
          value: device.id
        }
      ]);

      let updatedUserDevice: UserDevice | null = null;
      if (!userDevice) {
        updatedUserDevice = await this.userDeviceService.create({
          userId: user.id,
          deviceId: device.id,
          lastLogin: new Date(),
          lastSeenAt: new Date(),
          forceLogout: false,
          active: true
        });
      } else if (userDevice.deviceId !== device.id) {
        updatedUserDevice = await this.userDeviceService.update(userDevice.id, {
          lastSeenAt: new Date(),
          forceLogout: userDevice.forceLogout ?? false,
          active: true,
          updatedAt: new Date(),
          updatedBy: user.id
        });
      }

      if (updatedUserDevice) {
        await this.userDeviceService.updateMany({ active: false }, [
          { column: 'deviceId', operator: 'eq', value: device.id },
          { column: 'active', operator: 'eq', value: true },
          { column: 'id', operator: 'neq', value: updatedUserDevice.id }
        ]);
      }
    }

    return device;
  }

  async getAllMyDevices(): Promise<Device[]> {
    const user = await this.getUserOrNull();
    if (!user) {
      const deviceId = await getDeviceId();
      if (!deviceId) return [];
      const thisDevice = await this.getOneOrNull({ column: 'deviceId', operator: 'eq', value: deviceId });
      return thisDevice ? [thisDevice] : [];
    } else {
      const userDevices = await this.userDeviceService.getAll({ column: 'userId', operator: 'eq', value: user.id });
      if (userDevices.length === 0) return [];
      return this.getAll(
        [{ column: 'id', operator: 'in', value: userDevices.map((ud) => ud.deviceId) }],
        [{ column: 'lastSeenAt', ascending: false }]
      );
    }
  }

  async updateMyDevice(updates: Partial<Device>): Promise<Device> {
    const device = await this.getMyDevice();
    return this.update(device.id, updates);
  }

  async trackSeen() {
    try {
      const device = await this.getMyDevice();
      if (!device) return;

      const user = await this.getUserOrNull();

      await this.update(device.id, {
        lastSeenAt: new Date()
      });
      if (user) {
        await this.userDeviceService.updateMany({ lastSeenAt: new Date() }, [
          { column: 'deviceId', operator: 'eq', value: device.id },
          { column: 'userId', operator: 'eq', value: user.id }
        ]);
      }
      await this.eventLoggerService.log(EventTypeKey.Seen);
    } catch (error) {
      console.error('Error tracking seen:', error);
    }
  }

  async trackLogin() {
    const device = await this.getMyDevice();
    if (!device) return;

    await this.update(device.id, {
      lastSeenAt: new Date(),
      lastLogin: new Date()
    });

    const user = await this.getUserOrNull();
    if (user) {
      await this.userDeviceService.updateMany(
        {
          lastLogin: new Date(),
          lastSeenAt: new Date(),
          forceLogout: false,
          active: true
        },
        [
          { column: 'deviceId', operator: 'eq', value: device.id },
          { column: 'userId', operator: 'eq', value: user.id }
        ]
      );
    }
    await this.eventLoggerService.log(EventTypeKey.Login);
  }

  async trackLogout() {
    const device = await this.getMyDevice();
    if (!device) return;

    await this.update(device.id, {
      lastLogout: new Date()
    });
    const user = await this.getUserOrNull();
    if (user) {
      await this.userDeviceService.updateMany(
        {
          lastSeenAt: new Date(),
          lastLogout: new Date(),
          forceLogout: false,
          active: false
        },
        [
          { column: 'deviceId', operator: 'eq', value: device.id },
          { column: 'userId', operator: 'eq', value: user.id }
        ]
      );
    }
    await this.eventLoggerService.log(EventTypeKey.Logout);
  }

  async logoutAllDevices() {
    const user = await this.getUserOrNull();
    if (!user) return;

    await this.userDeviceService.updateMany({ active: false }, { column: 'userId', operator: 'eq', value: user.id });
    await this.eventLoggerService.log(EventTypeKey.LogoutAllDevices);
  }

  async logoutAllOtherDevices() {
    const user = await this.getUserOrNull();
    if (!user) return;

    const { id } = await this.getMyDevice();

    await this.userDeviceService.updateMany({ forceLogout: true }, [
      { column: 'userId', operator: 'eq', value: user.id },
      { column: 'id', operator: 'neq', value: id }
    ]);
    await this.eventLoggerService.log(EventTypeKey.LogoutAllOtherDevices);
  }

  private async invalidateOldDevices(deviceId: string, currentToken: string) {
    const { error }: PostgrestResponse<Device> = await this.supabase
      .from(this.table)
      .update({ tokenValid: false })
      .eq('pushToken', currentToken)
      .neq('deviceId', deviceId)
      .select('*');

    if (error) console.error('Error invalidating old devices:', error);
  }
}
