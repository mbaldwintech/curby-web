'use client';

import {
  Button,
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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  Switch
} from '@core/components';
import { PanelRef } from '@core/types';
import { EventTypeSelect } from '@features/events/components';
import { forwardRef, useCallback, useImperativeHandle, useState } from 'react';
import { Controller } from 'react-hook-form';
import { useCurbyCoinTransactionTypeForm } from '../hooks';

export type CurbyCoinTransactionTypePanelRef = PanelRef<string | undefined>;

export interface CurbyCoinTransactionTypePanelProps {
  onClose?: () => void;
}

export const CurbyCoinTransactionTypePanel = forwardRef<
  CurbyCoinTransactionTypePanelRef,
  CurbyCoinTransactionTypePanelProps
>(function CurbyCoinTransactionTypePanel({ onClose }: CurbyCoinTransactionTypePanelProps, ref) {
  const [open, setOpen] = useState(false);
  const [curbyCoinTransactionTypeId, setCurbyCoinTransactionTypeId] = useState<string | null>(null);

  const { form, curbyCoinTransactionType, loading, submitting, handleSubmit, clear } = useCurbyCoinTransactionTypeForm({
    curbyCoinTransactionTypeId,
    onSubmitSuccess: () => {
      handleClose();
    }
  });

  const handleClose = useCallback(() => {
    setOpen(false);
    setCurbyCoinTransactionTypeId(null);
    clear();
    onClose?.();
  }, [onClose, clear]);

  useImperativeHandle(
    ref,
    () => ({
      isOpen: open,
      open: (curbyCoinTransactionTypeId?: string) => {
        setCurbyCoinTransactionTypeId(curbyCoinTransactionTypeId || null);
        setOpen(true);
      },
      close: handleClose
    }),
    [open, handleClose]
  );

  return (
    <Sheet open={open} onOpenChange={(open) => !open && handleClose()}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>
            {curbyCoinTransactionTypeId ? 'Edit Curby Coin Transaction Type' : 'Create Curby Coin Transaction Type'}
          </SheetTitle>
          <SheetDescription>
            {curbyCoinTransactionTypeId
              ? 'Edit the details of the curby coin transaction type below.'
              : 'Create a new curby coin transaction type by filling out the form below.'}
          </SheetDescription>
        </SheetHeader>
        <div className="grid flex-1 auto-rows-min gap-6 px-4 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <LoadingSpinner />
            </div>
          ) : (
            <form id="curby-coin-transaction-type-form" onSubmit={form.handleSubmit(handleSubmit)}>
              <FieldGroup className="grid grid-cols-1 gap-6">
                <Controller
                  name="key"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="curby-coin-transaction-type-panel-key">Key</FieldLabel>
                      <Input
                        {...field}
                        id="curby-coin-transaction-type-panel-key"
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
                      <FieldLabel htmlFor="curby-coin-transaction-type-panel-category">Category</FieldLabel>
                      <Input
                        {...field}
                        id="curby-coin-transaction-type-panel-category"
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
                      <FieldLabel htmlFor="curby-coin-transaction-type-panel-recipient">Recipient</FieldLabel>
                      <Input
                        {...field}
                        id="curby-coin-transaction-type-panel-recipient"
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
                      <FieldLabel htmlFor="curby-coin-transaction-type-panel-sortOrder">Sort Order</FieldLabel>
                      <Input
                        {...field}
                        id="curby-coin-transaction-type-panel-sortOrder"
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
                      <FieldLabel htmlFor="curby-coin-transaction-type-panel-displayName">Display Name</FieldLabel>
                      <Input
                        {...field}
                        id="curby-coin-transaction-type-panel-displayName"
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
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="curby-coin-transaction-type-panel-description">Description</FieldLabel>
                      <InputGroup>
                        <InputGroupTextarea
                          {...field}
                          id="curby-coin-transaction-type-panel-description"
                          placeholder="Describe the curby coin transaction type..."
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
                      <FieldLabel htmlFor="curby-coin-transaction-type-panel-amount">Amount</FieldLabel>
                      <Input
                        {...field}
                        id="curby-coin-transaction-type-panel-amount"
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
                      <FieldLabel htmlFor="curby-coin-transaction-type-panel-validFrom">Valid From</FieldLabel>
                      <DateTimePicker
                        id="curby-coin-transaction-type-panel-validFrom"
                        value={field.value ? new Date(field.value) : undefined}
                        onChange={(date: Date | undefined) => field.onChange(date || null)}
                        aria-invalid={fieldState.invalid}
                        name={field.name}
                      />
                      <FieldDescription>When this transaction type becomes active.</FieldDescription>
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
                <Controller
                  name="validTo"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="curby-coin-transaction-type-panel-validTo">Valid To</FieldLabel>
                      <DateTimePicker
                        id="curby-coin-transaction-type-panel-validTo"
                        value={field.value ? new Date(field.value) : undefined}
                        onChange={(date: Date | undefined) => field.onChange(date || null)}
                        aria-invalid={fieldState.invalid}
                        name={field.name}
                      />
                      <FieldDescription>When this transaction type expires (optional).</FieldDescription>
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
                <Controller
                  name="max"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="curby-coin-transaction-type-panel-max">Max Occurrences</FieldLabel>
                      <Input
                        {...field}
                        id="curby-coin-transaction-type-panel-max"
                        type="number"
                        min="1"
                        value={field.value || ''}
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value, 10) : undefined)}
                        aria-invalid={fieldState.invalid}
                        placeholder="Unlimited"
                      />
                      <FieldDescription>Maximum times this transaction can occur (optional).</FieldDescription>
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
                <Controller
                  name="maxPerDay"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="curby-coin-transaction-type-panel-maxPerDay">Max Per Day</FieldLabel>
                      <Input
                        {...field}
                        id="curby-coin-transaction-type-panel-maxPerDay"
                        type="number"
                        min="1"
                        value={field.value || ''}
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value, 10) : undefined)}
                        aria-invalid={fieldState.invalid}
                        placeholder="Unlimited"
                      />
                      <FieldDescription>Maximum times this transaction can occur per day (optional).</FieldDescription>
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
                <ConditionFormGroup
                  control={form.control}
                  namePrefix="condition"
                  setValue={form.setValue}
                  formId="curby-coin-transaction-type-panel"
                />
                <Controller
                  name="active"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field orientation="horizontal" data-invalid={fieldState.invalid}>
                      <FieldContent>
                        <FieldLabel htmlFor="curby-coin-transaction-type-panel-active">Status</FieldLabel>
                        <FieldDescription>
                          {field.value
                            ? 'Transaction type is active and can be used'
                            : 'Transaction type is inactive and hidden'}
                        </FieldDescription>
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                      </FieldContent>
                      <Switch
                        id="curby-coin-transaction-type-panel-active"
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
          <Field orientation="horizontal" className="w-full justify-end gap-2">
            <Button type="button" variant="outline" onClick={handleClose} disabled={submitting}>
              Cancel
            </Button>
            <Button
              type="submit"
              form="curby-coin-transaction-type-form"
              disabled={!form.formState.isDirty || !form.formState.isValid || submitting}
            >
              {submitting ? (
                <>
                  <LoadingSpinner loading={true} />
                  {curbyCoinTransactionType ? 'Updating...' : 'Creating...'}
                </>
              ) : curbyCoinTransactionType ? (
                'Update'
              ) : (
                'Create'
              )}
            </Button>
          </Field>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
});
