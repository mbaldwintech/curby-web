'use client';

import { UserRole } from '@core/enumerations';
import { TutorialService } from '@core/services';
import { Tutorial } from '@core/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { createClientService } from '@supa/utils/client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import z from 'zod';
import { createLogger, debounce } from '@core/utils';

const logger = createLogger('UseTutorialForm');

const baseSchema = z.object({
  key: z
    .string()
    .min(1, { message: 'Key is required' })
    .max(50, { message: 'Key must be 50 characters or less' })
    .nonempty()
    .nonoptional()
    .refine((s) => !s.includes(' '), {
      message: 'String cannot contain any spaces'
    }),
  title: z
    .string()
    .min(1, { message: 'Title is required' })
    .max(100, { message: 'Title must be 100 characters or less' }),
  description: z.string().max(500, { message: 'Description must be 500 characters or less' }).optional(),
  roles: z.array(z.enum(UserRole)).min(1, { message: 'At least one role is required' }),
  active: z.boolean()
});

export type FormValues = z.infer<typeof baseSchema>;

function makeSchema(currentKey: string, validateUniqueKey: (key: string) => Promise<boolean | string>) {
  return baseSchema.superRefine(async (data, ctx) => {
    if (!data.key || data.key === currentKey) return;

    const isValid = await validateUniqueKey(data.key);
    const exists = isValid !== true;

    if (exists) {
      ctx.addIssue({
        code: 'custom',
        path: ['key'],
        message: isValid as string
      });
    }
  });
}

const defaultValues = {
  key: '',
  title: '',
  description: '',
  roles: [],
  active: true
};

export interface TutorialDetailFormProps {
  tutorialId: string | null;
  onSubmitSuccess?: (tutorial: Tutorial) => void;
}

export const useTutorialForm = ({ tutorialId, onSubmitSuccess }: TutorialDetailFormProps) => {
  const service = useRef(createClientService(TutorialService)).current;
  const [tutorial, setTutorial] = useState<Tutorial | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateKey = useCallback(
    async (key: string) => {
      try {
        const exists = await service.exists({ column: 'key', operator: 'eq', value: key });
        return !exists || 'This key is already in use';
      } catch (error) {
        logger.error('Failed to validate key uniqueness', error);
        return 'Error validating key uniqueness. Please try again.';
      }
    },
    [service]
  );

  const debouncedValidateKey = useRef(debounce(validateKey, 300, { trailing: true })).current;

  const form = useForm<FormValues>({
    resolver: zodResolver(
      makeSchema(tutorial?.key || '', async (key: string, currentKey?: string) => {
        if (!key || key === currentKey) return true;
        return debouncedValidateKey(key);
      })
    ),
    defaultValues,
    mode: 'onChange'
  });

  form.watch();

  const refresh = useCallback(async () => {
    if (tutorialId) {
      try {
        setLoading(true);
        const tutorial = await service.getById(tutorialId);
        setTutorial(tutorial);
        form.reset({
          key: tutorial.key,
          title: tutorial.title,
          description: tutorial.description || '',
          roles: tutorial.roles as UserRole[],
          active: tutorial.active
        });
      } catch (error) {
        logger.error('Failed to fetch tutorial details:', error);
        setTutorial(null);
        form.reset(defaultValues);
        setError('Failed to load tutorial details.');
      } finally {
        setLoading(false);
      }
    } else {
      setTutorial(null);
      form.reset(defaultValues);
    }
  }, [form, service, tutorialId]);

  const reset = useCallback(() => {
    if (tutorial) {
      form.reset({
        key: tutorial.key,
        title: tutorial.title,
        description: tutorial.description || '',
        roles: tutorial.roles as UserRole[],
        active: tutorial.active
      });
    } else {
      form.reset(defaultValues);
    }
    setError(null);
    setLoading(false);
    setSubmitting(false);
  }, [form, tutorial]);

  const clear = useCallback(() => {
    setTutorial(null);
    form.reset(defaultValues);
    setError(null);
    setLoading(false);
    setSubmitting(false);
  }, [form]);

  const update = useCallback(
    async (data: FormValues) => {
      if (!tutorial) return;
      setSubmitting(true);
      try {
        const updatedTutorial = await service.update(tutorial.id, data);
        toast.success('Tutorial updated successfully');
        onSubmitSuccess?.(updatedTutorial);
        reset();
      } catch (error) {
        logger.error('Failed to update tutorial:', error);
        toast.error('Failed to update tutorial. Please try again.');
      } finally {
        setSubmitting(false);
      }
    },
    [tutorial, service, onSubmitSuccess, reset]
  );

  const create = useCallback(
    async (data: FormValues) => {
      setSubmitting(true);
      try {
        const createdTutorial = await service.create(data);
        toast.success('Tutorial created successfully');
        onSubmitSuccess?.(createdTutorial);
        reset();
      } catch (error) {
        logger.error('Failed to create tutorial:', error);
        toast.error('Failed to create tutorial. Please try again.');
        setError('Failed to create tutorial. Please try again.');
      } finally {
        setSubmitting(false);
      }
    },
    [onSubmitSuccess, service, reset]
  );

  const handleSubmit = useCallback(
    async (data: FormValues) => {
      if (submitting) return;
      if (tutorial) {
        update(data);
      } else {
        create(data);
      }
    },
    [tutorial, submitting, update, create]
  );

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    form,
    tutorial,
    loading,
    submitting,
    error,
    handleSubmit,
    reset,
    clear
  };
};
