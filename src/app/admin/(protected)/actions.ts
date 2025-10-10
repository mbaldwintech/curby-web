'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { createClient } from '@supa/utils/server';

export async function logout() {
  const supabase = await createClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    redirect('/admin/error');
  }

  revalidatePath('/admin', 'layout');
  redirect('/admin/login');
}
