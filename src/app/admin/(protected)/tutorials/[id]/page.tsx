'use client';

import {
  AdminPageContainer,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
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
  Switch
} from '@core/components';
import { UserRole } from '@core/enumerations';
import { TutorialViewTable } from '@features/tutorials/components';
import { useTutorialForm } from '@features/tutorials/hooks';
import { useParams, useRouter } from 'next/navigation';
import React, { useCallback } from 'react';
import { Controller } from 'react-hook-form';

const MemoizedTutorialViewTable = React.memo(TutorialViewTable, (prevProps, nextProps) => {
  return JSON.stringify(prevProps.defaultFilters) === JSON.stringify(nextProps.defaultFilters);
});

export default function TutorialDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { form, tutorial, loading, submitting, handleSubmit, clear } = useTutorialForm({
    tutorialId: id,
    onSubmitSuccess: () => {
      handleClose();
    }
  });

  const handleClose = useCallback(() => {
    router.push('/admin/tutorials');
    clear();
  }, [router, clear]);

  return (
    <AdminPageContainer title={tutorial ? `Edit Tutorial: ${tutorial.title}` : 'Create Tutorial'}>
      <div className="flex flex-col gap-6 px-4 overflow-auto max-w-6xl mx-auto w-full">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <LoadingSpinner loading={true} />
          </div>
        ) : (
          <>
            {/* Tutorial Form Section */}
            <Card>
              <CardHeader>
                <CardTitle>{tutorial ? tutorial.title : 'Create New Tutorial'}</CardTitle>
                <CardDescription>
                  {tutorial ? tutorial.description : 'Fill out the form below to create a new tutorial.'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form id="tutorial-form" onSubmit={form.handleSubmit(handleSubmit)}>
                  <FieldGroup className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                        <Field data-invalid={fieldState.invalid} className="md:col-span-2">
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
              </CardContent>

              <CardFooter>
                <Field orientation="horizontal" className="justify-end">
                  <Button type="button" variant="outline" onClick={handleClose}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    form="tutorial-form"
                    disabled={!form.formState.isDirty || !form.formState.isValid || submitting}
                  >
                    {submitting && <LoadingSpinner loading={true} />}
                    {tutorial ? 'Update Tutorial' : 'Create Tutorial'}
                  </Button>
                </Field>
              </CardFooter>
            </Card>

            {/* Views Section - Only show for existing tutorials */}
            {id && (
              <Card>
                <CardHeader>
                  <CardTitle>Tutorial Views & Analytics</CardTitle>
                  <FieldDescription>View analytics and user engagement data for this tutorial.</FieldDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-2">
                  <MemoizedTutorialViewTable defaultFilters={[{ column: 'tutorialId', operator: 'eq', value: id }]} />
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </AdminPageContainer>
  );
}
