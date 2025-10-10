'use server';

import { AuthService, ProfileService } from '@core/services';
import { createServerService } from '@supa/utils/server';
import { cookies } from 'next/headers';

export async function validateUsername(username: string, currentUsername?: string) {
  console.log('Validating username', { username, currentUsername });
  if (!username || username === currentUsername) return true;

  const profileService = await createServerService(ProfileService);

  const exists = await profileService.exists({
    column: 'username',
    operator: 'eq',
    value: username
  });

  console.log('Username exists:', exists);
  return !exists || 'Username is already taken';
}

export async function updateUsername(username: string) {
  const deviceId = (await cookies()).get('deviceId')?.value;
  const authService = await createServerService(AuthService, deviceId);
  const updatedUser = await authService.updateUsername(username);
  const profileService = await createServerService(ProfileService);
  return await profileService.updateMyProfile({ username: updatedUser.user_metadata.username || username });
}

export async function updateEmail(email: string) {
  const deviceId = (await cookies()).get('deviceId')?.value;
  const authService = await createServerService(AuthService, deviceId);
  return await authService.updateEmail(email);
}
