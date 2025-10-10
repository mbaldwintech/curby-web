'use client';

import { debounce } from '@common/utils';
import { useProfile } from '@core/hooks';
import { Profile } from '@core/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@supa/providers';
import { User } from '@supabase/supabase-js';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from './button';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './form';
import { Input } from './input';

const profileBaseSchema = z.object({
  email: z.email({ message: 'Invalid email format' }),
  username: z
    .string()
    .min(1, { message: 'Username is required' })
    .min(3, { message: 'Must be at least 3 characters' })
    .max(20, { message: 'Must be at most 20 characters' })
    .regex(/^[A-Za-z].*$/, 'Must start with a letter')
    .regex(/^[A-Za-z0-9_]+$/, 'Only letters, numbers, and underscores are allowed')
});

type ProfileFormValues = z.infer<typeof profileBaseSchema>;

function makeProfileSchema(
  currentUsername: string,
  validateUsername: (username: string, currentUsername?: string) => Promise<boolean | string>
) {
  return profileBaseSchema.superRefine(async (data, ctx) => {
    if (!data.username || data.username === currentUsername) return;

    const isValid = await validateUsername(data.username, currentUsername);
    const exists = isValid !== true;

    if (exists) {
      ctx.addIssue({
        code: 'custom',
        path: ['username'],
        message: isValid as string
      });
    }
  });
}

export function ProfileDetails({
  validateUsername,
  updateUsername,
  updateEmail
  // updateProfile
}: {
  validateUsername: (username: string, currentUsername?: string) => Promise<boolean | string>;
  updateUsername: (username: string) => Promise<Profile>;
  updateEmail: (email: string) => Promise<User>;
  // updateProfile: (profile: Partial<Profile>) => Promise<void>;
}) {
  const { user } = useAuth();
  const { profile, refetch: refetchProfile } = useProfile();
  const debouncedValidateUsername = useRef(debounce(validateUsername, 300, { trailing: true })).current;

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(makeProfileSchema('', debouncedValidateUsername)),
    defaultValues: {
      username: '',
      email: ''
    },
    mode: 'onChange'
  });

  const usernameValue = form.watch('username');
  const emailValue = form.watch('email');

  const isDirty = usernameValue !== (profile?.username || '') || emailValue !== (user?.email || '');

  const [saving, setSaving] = useState(false);

  const onSubmit = async (values: ProfileFormValues) => {
    setSaving(true);
    try {
      if (values.username !== profile?.username) {
        const res = await updateUsername(values.username);
        console.log('Updated username result:', res);
      }
      if (values.email !== user?.email) {
        const res = await updateEmail(values.email);
        console.log('Updated email result:', res);
      }
      // await updateProfile({ username: values.username });
      form.reset(values);
      refetchProfile();
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    form.reset({
      username: profile?.username || '',
      email: user?.email || ''
    });
  }, [profile, user, form]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="Your username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Email */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="you@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end">
                <Button type="submit" disabled={saving || !form.formState.isValid || !isDirty}>
                  {saving ? 'Saving…' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
