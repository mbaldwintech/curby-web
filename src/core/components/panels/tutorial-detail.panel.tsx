'use client';

import {
  Button,
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  InputGroupTextarea,
  LoadingSpinner,
  MultiSelect,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  Switch
} from '@common/components';
import { PanelRef } from '@common/types';
import { debounce } from '@common/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { createClientService } from '@supa/utils/client';
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import z from 'zod';
import { UserRole } from '../../enumerations';
import { TutorialService } from '../../services';
import { Tutorial } from '../../types';

const tutorialBaseSchema = z.object({
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

type TutorialFormValues = z.infer<typeof tutorialBaseSchema>;

function makeTutorialSchema(currentKey: string, validateUniqueKey: (key: string) => Promise<boolean | string>) {
  return tutorialBaseSchema.superRefine(async (data, ctx) => {
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

export type TutorialDetailPanelRef = PanelRef<string | undefined>;

export interface TutorialDetailPanelProps {
  onClose?: () => void;
}

export const TutorialDetailPanel = forwardRef<TutorialDetailPanelRef, TutorialDetailPanelProps>(
  function TutorialDetailPanel({ onClose }: TutorialDetailPanelProps, ref) {
    const service = useRef(createClientService(TutorialService)).current;
    const [open, setOpen] = useState(false);
    const [tutorialId, setTutorialId] = useState<string | null>(null);
    const [tutorial, setTutorial] = useState<Tutorial | null>(null);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const validateKey = useCallback(
      async (key: string) => {
        try {
          const exists = await service.exists({ column: 'key', operator: 'eq', value: key });
          return !exists || 'This key is already in use';
        } catch (error) {
          console.error('Failed to validate key uniqueness', error);
          return 'Error validating key uniqueness. Please try again.';
        }
      },
      [service]
    );

    const debouncedValidateKey = useRef(debounce(validateKey, 300, { trailing: true })).current;

    const form = useForm<TutorialFormValues>({
      resolver: zodResolver(
        makeTutorialSchema(tutorial?.key || '', async (key: string, currentKey?: string) => {
          if (!key || key === currentKey) return true;
          return debouncedValidateKey(key);
        })
      ),
      defaultValues: {
        key: '',
        title: '',
        description: '',
        roles: [],
        active: true
      },
      mode: 'onChange'
    });

    form.watch();

    useEffect(() => {
      if (tutorialId) {
        setLoading(true);
        service
          .getById(tutorialId)
          .then((data) => {
            setTutorial(data);
            form.reset({
              key: data.key || '',
              title: data.title || '',
              description: data.description || '',
              roles: (data.roles as UserRole[]) || [],
              active: data.active || false
            });
          })
          .catch((error) => {
            console.error('Failed to fetch tutorial details:', error);
            setTutorial(null);
          })
          .finally(() => {
            setLoading(false);
          });
      } else {
        setTutorial(null);
        form.reset({
          key: '',
          title: '',
          description: '',
          roles: [],
          active: true
        });
      }
    }, [service, form, tutorialId]);

    const handleClose = useCallback(() => {
      form.reset();
      setTutorialId(null);
      setTutorial(null);
      setOpen(false);
      onClose?.();
    }, [form, onClose]);

    const onSubmit = (data: TutorialFormValues) => {
      if (submitting) return;
      setSubmitting(true);
      if (!tutorial) {
        service
          .create(data)
          .then(() => {
            toast.success('Tutorial created successfully');
            handleClose();
          })
          .catch((error) => {
            console.error('Failed to create tutorial:', error);
            toast.error('Failed to create tutorial. Please try again.');
          })
          .finally(() => {
            setSubmitting(false);
          });
      } else {
        service
          .update(tutorial.id, data)
          .then(() => {
            toast.success('Tutorial updated successfully');
            handleClose();
          })
          .catch((error) => {
            console.error('Failed to update tutorial:', error);
            toast.error('Failed to update tutorial. Please try again.');
          })
          .finally(() => {
            setSubmitting(false);
          });
      }
    };

    useImperativeHandle<TutorialDetailPanelRef, TutorialDetailPanelRef>(ref, (): TutorialDetailPanelRef => {
      return {
        isOpen: open,
        open: (tutorialId?: string) => {
          if (tutorialId) {
            setTutorialId(tutorialId);
          } else {
            setTutorialId(null);
          }
          setOpen(true);
        },
        close: handleClose
      };
    }, [handleClose, open]);

    return (
      <Sheet open={open} onOpenChange={handleClose}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{tutorial ? tutorial.title : 'New Tutorial'}</SheetTitle>
            <SheetDescription>
              {tutorial ? tutorial.description : 'Fill out the form below to create a new tutorial.'}
            </SheetDescription>
          </SheetHeader>

          <div className="grid flex-1 auto-rows-min gap-6 px-4 overflow-auto">
            {loading ? (
              <div className="flex items-center justify-center h-48">
                <LoadingSpinner loading={true} />
              </div>
            ) : null}
            <form id="tutorial-form" onSubmit={form.handleSubmit(onSubmit)}>
              <FieldGroup>
                <Controller
                  name="key"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="tutorial-form-key">Key</FieldLabel>
                      <Input
                        {...field}
                        id="tutorial-form-key"
                        aria-invalid={fieldState.invalid}
                        placeholder="Enter a key for the tutorial..."
                        autoComplete="off"
                      />
                      <FieldDescription>
                        A unique key to identify the tutorial (e.g., &quot;getting-started&quot;,
                        &quot;advanced-features&quot;).
                      </FieldDescription>
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
                <Controller
                  name="title"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="tutorial-form-title">Title</FieldLabel>
                      <Input
                        {...field}
                        id="tutorial-form-title"
                        aria-invalid={fieldState.invalid}
                        placeholder="Enter a title for the tutorial..."
                        autoComplete="off"
                      />
                      <FieldDescription>A brief, descriptive title for the tutorial.</FieldDescription>
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
                <Controller
                  name="description"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="tutorial-form-description">Description</FieldLabel>
                      <InputGroup>
                        <InputGroupTextarea
                          {...field}
                          id="tutorial-form-description"
                          placeholder="Describe the tutorial in detail..."
                          rows={6}
                          className="min-h-24 resize-none"
                          aria-invalid={fieldState.invalid}
                        />
                        <InputGroupAddon align="block-end">
                          <InputGroupText className="tabular-nums">{field.value?.length}/100 characters</InputGroupText>
                        </InputGroupAddon>
                      </InputGroup>
                      <FieldDescription>
                        A detailed description of what the tutorial covers and its objectives.
                      </FieldDescription>
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
                <Controller
                  name="roles"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field orientation="responsive" data-invalid={fieldState.invalid}>
                      <FieldContent>
                        <FieldLabel htmlFor="tutorial-form-roles">Roles</FieldLabel>
                        <MultiSelect
                          name={field.name}
                          control={form.control}
                          options={[
                            { value: UserRole.Guest, label: 'Guest' },
                            { value: UserRole.User, label: 'User' },
                            { value: UserRole.ProUser, label: 'Pro User' },
                            { value: UserRole.BusinessUser, label: 'Business User' },
                            { value: UserRole.Support, label: 'Support' },
                            { value: UserRole.SupportAgent, label: 'Support Agent' },
                            { value: UserRole.Moderator, label: 'Moderator' },
                            { value: UserRole.Admin, label: 'Admin' }
                          ]}
                          placeholder="Select one or more roles..."
                        />
                        <FieldDescription>Select the user roles that this tutorial applies to.</FieldDescription>
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                      </FieldContent>
                    </Field>
                  )}
                />
                <Controller
                  name="active"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field orientation="horizontal" data-invalid={fieldState.invalid}>
                      <FieldContent>
                        <FieldLabel htmlFor="tutorial-form-active">Active</FieldLabel>
                        <FieldDescription>Indicates whether the tutorial is currently active.</FieldDescription>
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                      </FieldContent>
                      <Switch
                        id="tutorial-form-active"
                        name={field.name}
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        aria-invalid={fieldState.invalid}
                      />
                    </Field>
                  )}
                />
              </FieldGroup>
            </form>
          </div>

          <SheetFooter>
            <Field orientation="horizontal" className="w-full justify-end">
              <Button type="button" variant="outline" onClick={() => handleClose()}>
                Close
              </Button>
              <Button type="submit" form="tutorial-form" disabled={!form.formState.isDirty || !form.formState.isValid}>
                {submitting && <LoadingSpinner loading={true} />}
                Submit
              </Button>
            </Field>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    );
  }
);
