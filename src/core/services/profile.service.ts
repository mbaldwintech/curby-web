import { BaseService } from '@supa/services';
import type { SupabaseClient } from '@supabase/supabase-js';
import { UserRole, UserStatus } from '../enumerations';
import { CreateProfile, Profile, ProfileMetadata } from '../types';

export class ProfileService extends BaseService<Profile> {
  constructor(protected supabase: SupabaseClient) {
    super('profile', supabase, ProfileMetadata);
  }

  async findByUserId(userId: string): Promise<Profile> {
    return this.getOne({ column: 'userId', operator: 'eq', value: userId });
  }

  async createNewUser(record: CreateProfile, isGuest: boolean): Promise<Profile> {
    return this.create({
      ...record,
      role: isGuest ? UserRole.Guest : UserRole.User,
      radius: 5,
      pushNotifications: true,
      emailNotifications: true,
      emailMarketing: true,
      theme: 'dark',
      status: UserStatus.Active,
      username: record.username ?? `Guest_${Math.floor(Math.random() * 1000000)}`
    });
  }

  async getMyProfile(): Promise<Profile> {
    const user = await this.getUser();
    const profile = await this.getOneOrNull({ column: 'userId', operator: 'eq', value: user.id });

    if (profile) {
      return profile;
    }

    return this.create({
      userId: user.id,
      username: user.user_metadata.username || `Guest_${Math.floor(Math.random() * 1000000)}`,
      role: user.is_anonymous ? UserRole.Guest : UserRole.User,
      radius: 5,
      pushNotifications: true,
      emailNotifications: true,
      emailMarketing: true,
      theme: 'dark',
      status: UserStatus.Active
    });
  }

  async getMyProfileOrNull(): Promise<Profile | null> {
    const user = await this.getUserOrNull();
    if (!user) return null;
    return this.getOneOrNull({ column: 'userId', operator: 'eq', value: user.id });
  }

  async updateMyProfile(record: Partial<Profile>): Promise<Profile> {
    const profile = await this.getMyProfile();
    return this.update(profile.id, record);
  }

  async deleteMyProfile(): Promise<void> {
    const profile = await this.getMyProfile();
    return this.delete(profile.id);
  }
}
