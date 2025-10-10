'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { AuthService, ProfileService } from '@core/services';
import { createServerService } from '@supa/utils/server';
import { cookies } from 'next/headers';

export async function login(formData: FormData) {
  const deviceId = (await cookies()).get('deviceId')?.value;
  const authService = await createServerService(AuthService, deviceId);

  // 1. Login
  await authService.loginWithEmail(formData.get('email') as string, formData.get('password') as string);

  // 2. Load the profile
  const profileService = await createServerService(ProfileService);
  const profile = await profileService.getMyProfile();

  // 3. Enforce role check
  if (!profile || profile.role !== 'admin') {
    // Logout immediately if not admin
    await authService.logout();
    throw new Error('Unauthorized: Admin access only');
  }

  // 4. Only admins get here
  revalidatePath('/admin', 'layout');
  redirect('/admin');
}
