'use server';

import { ProfileService } from '@core/services';
import { createClient, createServerService } from '@supa/utils/server';
import { createLogger } from '@core/utils';

const logger = createLogger('UpdateUsername');

export async function updateUsername(userId: string, username: string) {
  const supabase = await createClient();
  const {
    data: { user: updatedUser },
    error
  } = await supabase.auth.admin.updateUserById(userId, { user_metadata: { username } });
  if (error) {
    logger.error('Error updating user metadata:', error);
    throw new Error('Failed to update username');
  }
  if (!updatedUser) {
    throw new Error('User not found');
  }
  const profileService = await createServerService(ProfileService);
  const profile = await profileService.findByUserId(userId);
  return await profileService.update(profile.id, { username: updatedUser.user_metadata.username || username });
}
