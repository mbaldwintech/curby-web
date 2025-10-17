'use client';

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  Input,
  LoadingSpinner
} from '@common/components';
import { cn } from '@common/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import z from 'zod';
import { login } from '../../actions/auth.actions';

const loginSchema = z.object({
  email: z.string().nonempty('Email is required'),
  password: z.string().nonempty('Password is required')
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: ''
    },
    mode: 'onChange'
  });

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>Enter your email below to login to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            id="login-form"
            onSubmit={form.handleSubmit(async ({ email, password }) => {
              setSubmitting(true);
              await login(email, password);
              setSubmitting(false);
              form.reset();
            })}
          >
            <FieldGroup>
              <div className="flex flex-col gap-6">
                <Controller
                  name="email"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="login-form-email">Email</FieldLabel>
                      <Input
                        {...field}
                        id="login-form-email"
                        type="email"
                        aria-invalid={fieldState.invalid}
                        placeholder="my_email@example.com"
                        autoComplete="off"
                        required
                      />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
                <Controller
                  name="password"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <div className="flex items-center">
                        <FieldLabel htmlFor="login-form-password">Password</FieldLabel>
                        <a href="#" className="ml-auto inline-block text-sm underline-offset-4 hover:underline">
                          Forgot your password?
                        </a>
                      </div>
                      <Input
                        {...field}
                        id="login-form-password"
                        type="password"
                        aria-invalid={fieldState.invalid}
                        autoComplete="off"
                        required
                      />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
                <Button
                  type="submit"
                  form="login-form"
                  disabled={!form.formState.isDirty || !form.formState.isValid || submitting}
                  className="w-full"
                >
                  {submitting && <LoadingSpinner loading={submitting} />}
                  Login
                </Button>
              </div>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
