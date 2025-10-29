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
  ConditionFormGroup,
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
  Switch
} from '@core/components';
import { useEventTypeForm } from '@features/events/hooks';
import { useParams, useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { Controller } from 'react-hook-form';

export default function EventTypeDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { form, eventType, loading, submitting, handleSubmit, clear } = useEventTypeForm({
    eventTypeId: id,
    onSubmitSuccess: () => {
      handleClose();
    }
  });

  const handleClose = useCallback(() => {
    router.push('/admin/events/types');
    clear();
  }, [router, clear]);

  return (
    <AdminPageContainer title={eventType ? `Edit Event Type: ${eventType.name}` : 'Create Event Type'}>
      <div className="flex flex-col gap-6 px-4 overflow-auto max-w-6xl mx-auto w-full">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <LoadingSpinner loading={true} />
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>{eventType ? eventType.name : 'Create New Event Type'}</CardTitle>
              <CardDescription>
                {eventType ? eventType.description : 'Fill out the form below to create a new Event Type.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form id="event-type-form" onSubmit={form.handleSubmit(handleSubmit)}>
                <FieldGroup className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Controller
                    name="key"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="event-type-form-key">Key</FieldLabel>
                        <Input
                          {...field}
                          id="event-type-form-key"
                          aria-invalid={fieldState.invalid}
                          placeholder="Enter a key for the event type..."
                          autoComplete="off"
                        />
                        <FieldDescription>
                          A unique key to identify the Event Type (e.g., &quot;getting-started&quot;,
                          &quot;advanced-features&quot;).
                        </FieldDescription>
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                      </Field>
                    )}
                  />
                  <Controller
                    name="category"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="event-type-form-category">Category</FieldLabel>
                        <Input
                          {...field}
                          id="event-type-form-category"
                          aria-invalid={fieldState.invalid}
                          placeholder="Enter a category for the event type..."
                          autoComplete="off"
                        />
                        <FieldDescription>A brief, descriptive category for the event type.</FieldDescription>
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                      </Field>
                    )}
                  />
                  <Controller
                    name="name"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="event-type-form-name">Name</FieldLabel>
                        <Input
                          {...field}
                          id="event-type-form-name"
                          aria-invalid={fieldState.invalid}
                          placeholder="Enter a name for the event type..."
                          autoComplete="off"
                        />
                        <FieldDescription>A brief, descriptive name for the event type.</FieldDescription>
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                      </Field>
                    )}
                  />
                  <Controller
                    name="description"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid} className="md:col-span-2">
                        <FieldLabel htmlFor="event-type-form-description">Description</FieldLabel>
                        <InputGroup>
                          <InputGroupTextarea
                            {...field}
                            id="event-type-form-description"
                            placeholder="Describe the event type in detail..."
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
                          A detailed description of what the event type covers and its objectives.
                        </FieldDescription>
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                      </Field>
                    )}
                  />
                  <Controller
                    name="validFrom"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="event-type-form-validFrom">Valid From</FieldLabel>
                        <Input
                          {...field}
                          id="event-type-form-validFrom"
                          type="datetime-local"
                          value={field.value ? new Date(field.value).toISOString().slice(0, 16) : ''}
                          onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : null)}
                          aria-invalid={fieldState.invalid}
                        />
                        <FieldDescription>The date and time when this event type becomes active.</FieldDescription>
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                      </Field>
                    )}
                  />
                  <Controller
                    name="validTo"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="event-type-form-validTo">Valid To</FieldLabel>
                        <Input
                          {...field}
                          id="event-type-form-validTo"
                          type="datetime-local"
                          value={field.value ? new Date(field.value).toISOString().slice(0, 16) : ''}
                          onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : null)}
                          aria-invalid={fieldState.invalid}
                        />
                        <FieldDescription>The date and time when this event type expires (optional).</FieldDescription>
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                      </Field>
                    )}
                  />
                  <Controller
                    name="max"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="event-type-form-max">Max Occurrences</FieldLabel>
                        <Input
                          {...field}
                          id="event-type-form-max"
                          type="number"
                          min="1"
                          value={field.value || ''}
                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value, 10) : undefined)}
                          aria-invalid={fieldState.invalid}
                          placeholder="Unlimited"
                        />
                        <FieldDescription>Maximum number of times this event can occur (optional).</FieldDescription>
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                      </Field>
                    )}
                  />
                  <Controller
                    name="maxPerDay"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="event-type-form-maxPerDay">Max Per Day</FieldLabel>
                        <Input
                          {...field}
                          id="event-type-form-maxPerDay"
                          type="number"
                          min="1"
                          value={field.value || ''}
                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value, 10) : undefined)}
                          aria-invalid={fieldState.invalid}
                          placeholder="Unlimited"
                        />
                        <FieldDescription>
                          Maximum number of times this event can occur per day (optional).
                        </FieldDescription>
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                      </Field>
                    )}
                  />
                  <div className="md:col-span-2">
                    <ConditionFormGroup
                      control={form.control}
                      namePrefix="condition"
                      setValue={form.setValue}
                      formId="event-type-form"
                    />
                  </div>
                  <Controller
                    name="active"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field orientation="horizontal" data-invalid={fieldState.invalid}>
                        <FieldContent>
                          <FieldLabel htmlFor="event-type-form-active">Status</FieldLabel>
                          <FieldDescription>
                            {field.value
                              ? 'Event Type is active and visible to users'
                              : 'Event Type is inactive and hidden from users'}
                          </FieldDescription>
                          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                        </FieldContent>
                        <Switch
                          id="event-type-form-active"
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
                  form="event-type-form"
                  disabled={!form.formState.isDirty || !form.formState.isValid || submitting}
                >
                  {submitting && <LoadingSpinner loading={true} />}
                  {eventType ? 'Update Event Type' : 'Create Event Type'}
                </Button>
              </Field>
            </CardFooter>
          </Card>
        )}
      </div>
    </AdminPageContainer>
  );
}
