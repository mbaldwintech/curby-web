'use server';

import { ProfileService } from '@core/services';
import { createClient, createServerService } from '@supa/utils/server';

export async function updateUsername(userId: string, username: string) {
  const supabase = await createClient();
  const {
    data: { user: updatedUser },
    error
  } = await supabase.auth.admin.updateUserById(userId, { user_metadata: { username } });
  if (error) {
    console.error('Error updating user metadata:', error);
    throw new Error('Failed to update username');
  }
  if (!updatedUser) {
    throw new Error('User not found');
  }
  const profileService = await createServerService(ProfileService);
  const profile = await profileService.findByUserId(userId);
  return await profileService.update(profile.id, { username: updatedUser.user_metadata.username || username });
}

export async function updateEmail(userId: string, email: string) {
  const supabase = await createClient();
  const {
    data: { user: updatedUser },
    error
  } = await supabase.auth.admin.updateUserById(userId, { email });
  if (error) {
    console.error('Error updating user email:', error);
    throw new Error('Failed to update email');
  }
  if (!updatedUser) {
    throw new Error('User not found');
  }
  const profileService = await createServerService(ProfileService);
  const profile = await profileService.findByUserId(userId);
  return await profileService.update(profile.id, { email: updatedUser.email || email });
}
