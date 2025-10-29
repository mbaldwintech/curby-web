'use server';

import { UserRole } from '@core/enumerations';
import { AuthService, ProfileService } from '@core/services';
import { createServerService } from '@supa/utils/server';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function login(email: string, password: string) {
  const deviceId = (await cookies()).get('deviceId')?.value;
  const authService = await createServerService(AuthService, deviceId);

  try {
    await authService.loginWithEmail(email, password);
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }

  const profileService = await createServerService(ProfileService);
  const profile = await profileService.getMyProfile();

  const allowedRoles: UserRole[] = [UserRole.Admin, UserRole.Moderator, UserRole.Support];
  if (!profile || !allowedRoles.includes(profile.role)) {
    await authService.logout();
    throw new Error('Unauthorized');
  }

  revalidatePath('/admin', 'layout');
  redirect('/admin');
}
