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
} from '@core/components';
import { UserRole } from '@core/enumerations';
import { PanelRef } from '@core/types';
import { forwardRef, useCallback, useImperativeHandle, useState } from 'react';
import { Controller } from 'react-hook-form';
import { useTutorialForm } from '../hooks';

export type TutorialPanelRef = PanelRef<string | undefined>;

export interface TutorialPanelProps {
  onClose?: () => void;
}

export const TutorialPanel = forwardRef<TutorialPanelRef, TutorialPanelProps>(function TutorialPanel(
  { onClose }: TutorialPanelProps,
  ref
) {
  const [open, setOpen] = useState(false);
  const [tutorialId, setTutorialId] = useState<string | null>(null);
  const { form, tutorial, loading, submitting, handleSubmit, clear } = useTutorialForm({
    tutorialId,
    onSubmitSuccess: () => {
      handleClose();
    }
  });

  const handleClose = useCallback(() => {
    setTutorialId(null);
    setOpen(false);
    onClose?.();
    clear();
  }, [clear, onClose]);

  useImperativeHandle<TutorialPanelRef, TutorialPanelRef>(ref, (): TutorialPanelRef => {
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
          ) : (
            <form id="tutorial-form" onSubmit={form.handleSubmit(handleSubmit)}>
              <FieldGroup className="grid grid-cols-1 gap-6">
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
                          <InputGroupText className="tabular-nums">
                            {field.value?.length || 0}/500 characters
                          </InputGroupText>
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
                        <FieldLabel htmlFor="tutorial-form-roles">Target Roles</FieldLabel>
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
                        <FieldLabel htmlFor="tutorial-form-active">Status</FieldLabel>
                        <FieldDescription>
                          {field.value
                            ? 'Tutorial is active and visible to users'
                            : 'Tutorial is inactive and hidden from users'}
                        </FieldDescription>
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
          )}
        </div>

        <SheetFooter>
          <Field orientation="horizontal" className="w-full justify-end">
            <Button type="button" variant="outline" onClick={handleClose}>
              Close
            </Button>
            <Button
              type="submit"
              form="tutorial-form"
              disabled={!form.formState.isDirty || !form.formState.isValid || submitting}
            >
              {submitting && <LoadingSpinner loading={true} />}
              Submit
            </Button>
          </Field>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
});
