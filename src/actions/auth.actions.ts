'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { UserRole } from '@core/enumerations';
import { AuthService, ProfileService } from '@core/services';
import { createServerService } from '@supa/utils/server';
import { cookies } from 'next/headers';

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

export async function logout() {
  const deviceId = (await cookies()).get('deviceId')?.value;
  const authService = await createServerService(AuthService, deviceId);

  try {
    await authService.logout();
  } catch {
    redirect('/admin/error');
  }

  revalidatePath('/admin', 'layout');
  redirect('/admin/login');
}
