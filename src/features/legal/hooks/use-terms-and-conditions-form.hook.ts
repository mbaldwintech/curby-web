'use client';

import { TermsAndConditionsService } from '@core/services';
import { TermsAndConditions } from '@core/types';
import { debounce } from '@core/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { createClientService } from '@supa/utils/client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import z from 'zod';

// Step 1: Define the base validation schema
// This validates the structure of our form fields
const baseSchema = z.object({
  version: z
    .string()
    .min(1, { message: 'Version is required' })
    .max(50, { message: 'Version must be 50 characters or less' })
    .nonempty()
    .nonoptional()
    .refine((s) => !s.includes(' '), {
      message: 'Version cannot contain spaces'
    }),
  content: z
    .string()
    .min(1, { message: 'Content is required' })
    .min(10, { message: 'Content must be at least 10 characters' }),
  effectiveDate: z.date({
    message: 'Effective date is required and must be a valid date'
  })
});

export type FormValues = z.infer<typeof baseSchema>;

// Step 2: Create an enhanced schema with async validation
// This function adds validation to ensure the version is unique
function makeSchema(currentVersion: string, validateUniqueVersion: (version: string) => Promise<boolean | string>) {
  return baseSchema.superRefine(async (data, ctx) => {
    // Skip validation if version is empty or unchanged (when editing)
    if (!data.version || data.version === currentVersion) return;

    const isValid = await validateUniqueVersion(data.version);
    const exists = isValid !== true;

    if (exists) {
      ctx.addIssue({
        code: 'custom',
        path: ['version'],
        message: isValid as string
      });
    }
  });
}

// Step 3: Define default form values
const defaultValues: FormValues = {
  version: '',
  content: '',
  effectiveDate: new Date()
};

// Step 4: Define the hook's props interface
export interface TermsAndConditionsFormProps {
  termsAndConditionsId: string | null;
  onSubmitSuccess?: (termsAndConditions: TermsAndConditions) => void;
}

// Step 5: Create the main hook
export const useTermsAndConditionsForm = ({ termsAndConditionsId, onSubmitSuccess }: TermsAndConditionsFormProps) => {
  // Initialize the TermsAndConditionsService (persists across renders with useRef)
  const service = useRef(createClientService(TermsAndConditionsService)).current;

  // State management for the hook
  const [termsAndConditions, setTermsAndConditions] = useState<TermsAndConditions | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 6: Create async validation function for version uniqueness
  const validateVersion = useCallback(
    async (version: string) => {
      try {
        // Check if a TermsAndConditions record with this version already exists
        const exists = await service.exists({ column: 'version', operator: 'eq', value: version });
        return !exists || 'This version is already in use';
      } catch (error) {
        console.error('Failed to validate version uniqueness', error);
        return 'Error validating version uniqueness. Please try again.';
      }
    },
    [service]
  );

  // Debounce the validation to avoid excessive API calls (300ms delay)
  const debouncedValidateVersion = useRef(debounce(validateVersion, 300, { trailing: true })).current;

  // Step 7: Initialize react-hook-form with validation
  const form = useForm<FormValues>({
    resolver: zodResolver(
      makeSchema(termsAndConditions?.version || '', async (version: string) => {
        if (!version || version === termsAndConditions?.version) return true;
        return debouncedValidateVersion(version);
      })
    ),
    defaultValues,
    mode: 'onChange' // Validate on every change
  });

  // Watch for form changes (enables real-time validation)
  form.watch();

  // Step 8: Function to fetch existing TermsAndConditions (for editing)
  const refresh = useCallback(async () => {
    if (termsAndConditionsId) {
      try {
        setLoading(true);
        const termsAndConditions = await service.getById(termsAndConditionsId);
        setTermsAndConditions(termsAndConditions);

        // Reset form with the fetched data
        form.reset({
          version: termsAndConditions.version,
          content: termsAndConditions.content,
          effectiveDate: new Date(termsAndConditions.effectiveDate)
        });
      } catch (error) {
        console.error('Failed to fetch terms and conditions details:', error);
        setTermsAndConditions(null);
        form.reset(defaultValues);
        setError('Failed to load terms and conditions details.');
      } finally {
        setLoading(false);
      }
    } else {
      // No ID means we're creating a new record
      setTermsAndConditions(null);
      form.reset(defaultValues);
    }
  }, [form, service, termsAndConditionsId]);

  // Step 9: Reset function - reverts form to last saved state
  const reset = useCallback(() => {
    if (termsAndConditions) {
      form.reset({
        version: termsAndConditions.version,
        content: termsAndConditions.content,
        effectiveDate: new Date(termsAndConditions.effectiveDate)
      });
    } else {
      form.reset(defaultValues);
    }
    setError(null);
    setLoading(false);
    setSubmitting(false);
  }, [form, termsAndConditions]);

  // Step 10: Clear function - completely clears the form
  const clear = useCallback(() => {
    setTermsAndConditions(null);
    form.reset(defaultValues);
    setError(null);
    setLoading(false);
    setSubmitting(false);
  }, [form]);

  // Step 11: Update function - updates an existing TermsAndConditions record
  const update = useCallback(
    async (data: FormValues) => {
      if (!termsAndConditions) return;
      setSubmitting(true);
      try {
        const updatedTermsAndConditions = await service.update(termsAndConditions.id, data);
        toast.success('Terms and Conditions updated successfully');
        onSubmitSuccess?.(updatedTermsAndConditions);
        reset();
      } catch (error) {
        console.error('Failed to update terms and conditions:', error);
        toast.error('Failed to update terms and conditions. Please try again.');
      } finally {
        setSubmitting(false);
      }
    },
    [termsAndConditions, service, onSubmitSuccess, reset]
  );

  // Step 12: Create function - creates a new TermsAndConditions record
  const create = useCallback(
    async (data: FormValues) => {
      setSubmitting(true);
      try {
        const createdTermsAndConditions = await service.create(data);
        toast.success('Terms and Conditions created successfully');
        onSubmitSuccess?.(createdTermsAndConditions);
        reset();
      } catch (error) {
        console.error('Failed to create terms and conditions:', error);
        toast.error('Failed to create terms and conditions. Please try again.');
        setError('Failed to create terms and conditions. Please try again.');
      } finally {
        setSubmitting(false);
      }
    },
    [onSubmitSuccess, service, reset]
  );

  // Step 13: Main submit handler - determines whether to create or update
  const handleSubmit = useCallback(
    async (data: FormValues) => {
      if (submitting) return;
      if (termsAndConditions) {
        update(data);
      } else {
        create(data);
      }
    },
    [termsAndConditions, submitting, update, create]
  );

  // Step 14: Load data when the component mounts or termsAndConditionsId changes
  useEffect(() => {
    refresh();
  }, [refresh]);

  // Step 15: Return all the necessary state and functions
  return {
    form,
    termsAndConditions,
    loading,
    submitting,
    error,
    handleSubmit,
    reset,
    clear
  };
};
