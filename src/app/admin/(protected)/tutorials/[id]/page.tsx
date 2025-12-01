'use client';

import {
  AdminPageContainer,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  CopyableStringCell,
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
  Separator,
  Switch
} from '@core/components';
import { UserRole } from '@core/enumerations';
import { cn } from '@core/utils';
import { TutorialViewTable } from '@features/tutorials/components';
import { useTutorialForm } from '@features/tutorials/hooks';
import { format } from 'date-fns';
import { Activity, BookOpen, CheckCircle2, Eye, InfoIcon, Key, ShieldCheck, Users, XCircle } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import React, { useCallback } from 'react';
import { Controller } from 'react-hook-form';

const MemoizedTutorialViewTable = React.memo(TutorialViewTable, (prevProps, nextProps) => {
  return JSON.stringify(prevProps.restrictiveFilters) === JSON.stringify(nextProps.restrictiveFilters);
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
            {/* Tutorial Overview - Only show for existing tutorials */}
            {tutorial && (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'flex items-center justify-center w-12 h-12 rounded-full border-2',
                        tutorial.active
                          ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800'
                          : 'bg-gray-100 dark:bg-gray-900/20 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-800'
                      )}
                    >
                      {tutorial.active ? <CheckCircle2 className="h-6 w-6" /> : <XCircle className="h-6 w-6" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <CardTitle className="text-xl">{tutorial.title}</CardTitle>
                        <Badge variant={tutorial.active ? 'default' : 'secondary'} className="h-6">
                          {tutorial.active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <CardDescription>{tutorial.description || 'No description provided'}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                          <Key className="h-4 w-4" />
                          Tutorial Key
                        </p>
                        <CopyableStringCell value={tutorial.key} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                          <Activity className="h-4 w-4" />
                          Tutorial ID
                        </p>
                        <CopyableStringCell value={tutorial.id} />
                      </div>
                    </div>

                    {tutorial.roles && tutorial.roles.length > 0 && (
                      <>
                        <Separator />
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Target Roles ({tutorial.roles.length})
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {tutorial.roles.map((role) => (
                              <Badge key={role} variant="outline" className="font-normal">
                                <ShieldCheck className="h-3 w-3 mr-1" />
                                {role}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </>
                    )}

                    <Separator />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-2">Created At</p>
                        <p className="text-sm">{format(new Date(tutorial.createdAt), 'PPpp')}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-2">Last Updated</p>
                        <p className="text-sm">{format(new Date(tutorial.updatedAt), 'PPpp')}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tutorial Form Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                    <BookOpen className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle>{tutorial ? 'Edit Tutorial' : 'Create New Tutorial'}</CardTitle>
                    <CardDescription>
                      {tutorial
                        ? 'Update the tutorial information below'
                        : 'Fill out the form below to create a new tutorial'}
                    </CardDescription>
                  </div>
                </div>
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
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/20">
                      <Eye className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <CardTitle>Tutorial Views & Analytics</CardTitle>
                      <CardDescription>View analytics and user engagement data for this tutorial</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-2">
                  <MemoizedTutorialViewTable
                    restrictiveFilters={[{ column: 'tutorialId', operator: 'eq', value: id }]}
                    onRowClick={(tutorialView: { id: string }) => {
                      router.push(`/admin/tutorials/views/${tutorialView.id}`);
                    }}
                    getRowActionMenuItems={() => [
                      {
                        label: 'View Details',
                        icon: InfoIcon,
                        onClick: (tutorialView: { id: string }) => {
                          router.push(`/admin/tutorials/views/${tutorialView.id}`);
                        }
                      }
                    ]}
                  />
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </AdminPageContainer>
  );
}
