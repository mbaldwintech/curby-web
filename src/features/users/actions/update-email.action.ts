'use server';

import { ProfileService } from '@core/services';
import { createClient, createServerService } from '@supa/utils/server';
import { createLogger } from '@core/utils';

const logger = createLogger('UpdateEmail');

export async function updateEmail(userId: string, email: string) {
  const supabase = await createClient();
  const {
    data: { user: updatedUser },
    error
  } = await supabase.auth.admin.updateUserById(userId, { email });
  if (error) {
    logger.error('Error updating user email:', error);
    throw new Error('Failed to update email');
  }
  if (!updatedUser) {
    throw new Error('User not found');
  }
  const profileService = await createServerService(ProfileService);
  const profile = await profileService.findByUserId(userId);
  return await profileService.update(profile.id, { email: updatedUser.email || email });
}
