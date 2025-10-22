'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { AuthService } from '@core/services';
import { createServerService } from '@supa/utils/server';
import { cookies } from 'next/headers';

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
