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
  DateTimePicker,
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
import { useCurbyCoinTransactionTypeForm } from '@features/curby-coins/hooks';
import { EventTypeSelect } from '@features/events/components';
import { useParams, useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { Controller } from 'react-hook-form';

export default function CurbyCoinTransactionTypeDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { form, curbyCoinTransactionType, loading, submitting, handleSubmit, clear } = useCurbyCoinTransactionTypeForm({
    curbyCoinTransactionTypeId: id,
    onSubmitSuccess: () => {
      handleClose();
    }
  });

  const handleClose = useCallback(() => {
    clear();
    router.push('/admin/curby-coins/transactions/types');
  }, [clear, router]);

  const isNew = !id || id === 'new';

  if (loading) {
    return (
      <AdminPageContainer title="Loading...">
        <div className="flex h-96 items-center justify-center">
          <LoadingSpinner />
        </div>
      </AdminPageContainer>
    );
  }

  return (
    <AdminPageContainer
      title={
        isNew
          ? 'Create Curby Coin Transaction Type'
          : `Edit ${curbyCoinTransactionType?.displayName || 'Curby Coin Transaction Type'}`
      }
    >
      <div className="flex flex-col gap-6 px-4 overflow-auto max-w-6xl mx-auto w-full">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <LoadingSpinner loading={true} />
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>
                {isNew ? 'Create Curby Coin Transaction Type' : `Edit ${curbyCoinTransactionType?.displayName}`}
              </CardTitle>
              <CardDescription>
                {isNew
                  ? 'Create a new curby coin transaction type by filling out the form below.'
                  : 'Edit the details of the curby coin transaction type below.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form id="curby-coin-transaction-type-form" onSubmit={form.handleSubmit(handleSubmit)}>
                <FieldGroup className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Controller
                    name="key"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="curby-coin-transaction-type-form-key">Key</FieldLabel>
                        <Input
                          {...field}
                          id="curby-coin-transaction-type-form-key"
                          aria-invalid={fieldState.invalid}
                          placeholder="Enter a unique key..."
                          autoComplete="off"
                        />
                        <FieldDescription>
                          A unique identifier for the curby coin transaction type. No spaces allowed.
                        </FieldDescription>
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                      </Field>
                    )}
                  />
                  <Controller
                    name="eventTypeId"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="curby-coin-transaction-type-panel-eventTypeId">Event Type</FieldLabel>
                        <EventTypeSelect
                          {...field}
                          id="curby-coin-transaction-type-panel-eventTypeId"
                          aria-invalid={fieldState.invalid}
                          placeholder="Enter event type ID..."
                          value={field.value}
                          onSelect={field.onChange}
                        />
                        <FieldDescription>The ID of the event type this transaction type belongs to.</FieldDescription>
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                      </Field>
                    )}
                  />
                  <Controller
                    name="category"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="curby-coin-transaction-type-form-category">Category</FieldLabel>
                        <Input
                          {...field}
                          id="curby-coin-transaction-type-form-category"
                          aria-invalid={fieldState.invalid}
                          placeholder="Enter a category..."
                          autoComplete="off"
                        />
                        <FieldDescription>A category for grouping similar transaction types.</FieldDescription>
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                      </Field>
                    )}
                  />
                  <Controller
                    name="recipient"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="curby-coin-transaction-type-form-recipient">Recipient</FieldLabel>
                        <Input
                          {...field}
                          id="curby-coin-transaction-type-form-recipient"
                          aria-invalid={fieldState.invalid}
                          placeholder="Enter recipient..."
                          autoComplete="off"
                        />
                        <FieldDescription>
                          Who receives the curby coins (e.g., &apos;user&apos;, &apos;admin&apos;).
                        </FieldDescription>
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                      </Field>
                    )}
                  />
                  <Controller
                    name="sortOrder"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="curby-coin-transaction-type-form-sortOrder">Sort Order</FieldLabel>
                        <Input
                          {...field}
                          id="curby-coin-transaction-type-form-sortOrder"
                          type="number"
                          min="0"
                          value={field.value || ''}
                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value, 10) : 0)}
                          aria-invalid={fieldState.invalid}
                        />
                        <FieldDescription>Display order for sorting (lower numbers appear first).</FieldDescription>
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                      </Field>
                    )}
                  />
                  <Controller
                    name="displayName"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="curby-coin-transaction-type-form-displayName">Display Name</FieldLabel>
                        <Input
                          {...field}
                          id="curby-coin-transaction-type-form-displayName"
                          aria-invalid={fieldState.invalid}
                          placeholder="Enter display name..."
                          autoComplete="off"
                        />
                        <FieldDescription>The user-friendly name shown in the interface.</FieldDescription>
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                      </Field>
                    )}
                  />
                  <Controller
                    name="description"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid} className="md:col-span-2">
                        <FieldLabel htmlFor="curby-coin-transaction-type-form-description">Description</FieldLabel>
                        <InputGroup>
                          <InputGroupTextarea
                            {...field}
                            id="curby-coin-transaction-type-form-description"
                            placeholder="Describe the curby coin transaction type in detail..."
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
                          Optional description of what this transaction type represents.
                        </FieldDescription>
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                      </Field>
                    )}
                  />
                  <Controller
                    name="amount"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="curby-coin-transaction-type-form-amount">Amount</FieldLabel>
                        <Input
                          {...field}
                          id="curby-coin-transaction-type-form-amount"
                          type="number"
                          min="1"
                          value={field.value || ''}
                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value, 10) : 1)}
                          aria-invalid={fieldState.invalid}
                        />
                        <FieldDescription>The number of curby coins awarded for this transaction.</FieldDescription>
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                      </Field>
                    )}
                  />
                  <Controller
                    name="validFrom"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="curby-coin-transaction-type-form-validFrom">Valid From</FieldLabel>
                        <DateTimePicker
                          id="curby-coin-transaction-type-form-validFrom"
                          value={field.value ? new Date(field.value) : undefined}
                          onChange={(date) => field.onChange(date || null)}
                          aria-invalid={fieldState.invalid}
                          name={field.name}
                        />
                        <FieldDescription>
                          The date and time when this transaction type becomes active.
                        </FieldDescription>
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                      </Field>
                    )}
                  />
                  <Controller
                    name="validTo"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="curby-coin-transaction-type-form-validTo">Valid To</FieldLabel>
                        <DateTimePicker
                          id="curby-coin-transaction-type-form-validTo"
                          value={field.value ? new Date(field.value) : undefined}
                          onChange={(date) => field.onChange(date || null)}
                          aria-invalid={fieldState.invalid}
                          name={field.name}
                        />
                        <FieldDescription>
                          The date and time when this transaction type expires (optional).
                        </FieldDescription>
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                      </Field>
                    )}
                  />
                  <Controller
                    name="max"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="curby-coin-transaction-type-form-max">Max Occurrences</FieldLabel>
                        <Input
                          {...field}
                          id="curby-coin-transaction-type-form-max"
                          type="number"
                          min="1"
                          value={field.value || ''}
                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value, 10) : undefined)}
                          aria-invalid={fieldState.invalid}
                          placeholder="Unlimited"
                        />
                        <FieldDescription>
                          Maximum number of times this transaction can occur (optional).
                        </FieldDescription>
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                      </Field>
                    )}
                  />
                  <Controller
                    name="maxPerDay"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="curby-coin-transaction-type-form-maxPerDay">Max Per Day</FieldLabel>
                        <Input
                          {...field}
                          id="curby-coin-transaction-type-form-maxPerDay"
                          type="number"
                          min="1"
                          value={field.value || ''}
                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value, 10) : undefined)}
                          aria-invalid={fieldState.invalid}
                          placeholder="Unlimited"
                        />
                        <FieldDescription>
                          Maximum number of times this transaction can occur per day (optional).
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
                      formId="curby-coin-transaction-type-form"
                    />
                  </div>
                  <Controller
                    name="active"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field orientation="horizontal" data-invalid={fieldState.invalid} className="md:col-span-2">
                        <FieldContent>
                          <FieldLabel htmlFor="curby-coin-transaction-type-form-active">Status</FieldLabel>
                          <FieldDescription>
                            {field.value
                              ? 'Transaction Type is active and can be used'
                              : 'Transaction Type is inactive and hidden from users'}
                          </FieldDescription>
                          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                        </FieldContent>
                        <Switch
                          id="curby-coin-transaction-type-form-active"
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
              <Field orientation="horizontal" className="flex justify-end">
                <Button type="button" variant="outline" onClick={handleClose} disabled={submitting}>
                  Cancel
                </Button>
                <Button
                  type="button"
                  form="curby-coin-transaction-type-form"
                  disabled={!form.formState.isDirty || !form.formState.isValid || submitting}
                >
                  {submitting
                    ? isNew
                      ? 'Creating...'
                      : 'Updating...'
                    : isNew
                      ? 'Create Curby Coin Transaction Type'
                      : 'Update Curby Coin Transaction Type'}
                </Button>
              </Field>
            </CardFooter>
          </Card>
        )}
      </div>
    </AdminPageContainer>
  );
}
