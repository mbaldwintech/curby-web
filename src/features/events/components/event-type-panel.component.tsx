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
import { forwardRef, useCallback, useImperativeHandle, useState } from 'react';
import { Controller } from 'react-hook-form';
import { useEventTypeForm } from '../hooks';

export type EventTypePanelRef = PanelRef<string | undefined>;

export interface EventTypePanelProps {
  onClose?: () => void;
}

export const EventTypePanel = forwardRef<EventTypePanelRef, EventTypePanelProps>(function EventTypePanel(
  { onClose }: EventTypePanelProps,
  ref
) {
  const [open, setOpen] = useState(false);
  const [eventTypeId, setEventTypeId] = useState<string | null>(null);
  const { form, eventType, loading, submitting, handleSubmit, clear } = useEventTypeForm({
    eventTypeId,
    onSubmitSuccess: () => {
      handleClose();
    }
  });

  const handleClose = useCallback(() => {
    setEventTypeId(null);
    setOpen(false);
    onClose?.();
    clear();
  }, [clear, onClose]);

  useImperativeHandle<EventTypePanelRef, EventTypePanelRef>(ref, (): EventTypePanelRef => {
    return {
      isOpen: open,
      open: (eventTypeId?: string) => {
        setEventTypeId(eventTypeId || null);
        setOpen(true);
      },
      close: handleClose
    };
  }, [handleClose, open]);

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{eventType ? eventType.name : 'New EventType'}</SheetTitle>
          <SheetDescription>
            {eventType ? eventType.description : 'Fill out the form below to create a new eventType.'}
          </SheetDescription>
        </SheetHeader>

        <div className="grid flex-1 auto-rows-min gap-6 px-4 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <LoadingSpinner loading={true} />
            </div>
          ) : (
            <form id="eventType-form" onSubmit={form.handleSubmit(handleSubmit)}>
              <FieldGroup className="grid grid-cols-1 gap-6">
                <Controller
                  name="key"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="eventType-form-key">Key</FieldLabel>
                      <Input
                        {...field}
                        id="eventType-form-key"
                        aria-invalid={fieldState.invalid}
                        placeholder="Enter a key for the eventType..."
                        autoComplete="off"
                      />
                      <FieldDescription>
                        A unique key to identify the eventType (e.g., &quot;getting-started&quot;,
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
                      <FieldLabel htmlFor="eventType-form-category">Category</FieldLabel>
                      <Input
                        {...field}
                        id="eventType-form-category"
                        aria-invalid={fieldState.invalid}
                        placeholder="Enter a category for the eventType..."
                        autoComplete="off"
                      />
                      <FieldDescription>A brief, descriptive category for the eventType.</FieldDescription>
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
                <Controller
                  name="name"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="eventType-form-name">Name</FieldLabel>
                      <Input
                        {...field}
                        id="eventType-form-name"
                        aria-invalid={fieldState.invalid}
                        placeholder="Enter a name for the eventType..."
                        autoComplete="off"
                      />
                      <FieldDescription>A brief, descriptive name for the eventType.</FieldDescription>
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
                <Controller
                  name="description"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="eventType-form-description">Description</FieldLabel>
                      <InputGroup>
                        <InputGroupTextarea
                          {...field}
                          id="eventType-form-description"
                          placeholder="Describe the eventType in detail..."
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
                        A detailed description of what the eventType covers and its objectives.
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
                      <FieldLabel htmlFor="eventType-form-validFrom">Valid From</FieldLabel>
                      <DateTimePicker
                        id="eventType-form-validFrom"
                        value={field.value ? new Date(field.value) : undefined}
                        onChange={(date: Date | undefined) => field.onChange(date || null)}
                        aria-invalid={fieldState.invalid}
                        name={field.name}
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
                      <FieldLabel htmlFor="eventType-form-validTo">Valid To</FieldLabel>
                      <DateTimePicker
                        id="eventType-form-validTo"
                        value={field.value ? new Date(field.value) : undefined}
                        onChange={(date: Date | undefined) => field.onChange(date || null)}
                        aria-invalid={fieldState.invalid}
                        name={field.name}
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
                      <FieldLabel htmlFor="eventType-form-max">Max Occurrences</FieldLabel>
                      <Input
                        {...field}
                        id="eventType-form-max"
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
                      <FieldLabel htmlFor="eventType-form-maxPerDay">Max Per Day</FieldLabel>
                      <Input
                        {...field}
                        id="eventType-form-maxPerDay"
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
                <ConditionFormGroup
                  control={form.control}
                  namePrefix="condition"
                  setValue={form.setValue}
                  formId="eventType-form"
                />
                <Controller
                  name="active"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field orientation="horizontal" data-invalid={fieldState.invalid}>
                      <FieldContent>
                        <FieldLabel htmlFor="eventType-form-active">Status</FieldLabel>
                        <FieldDescription>
                          {field.value
                            ? 'EventType is active and visible to users'
                            : 'EventType is inactive and hidden from users'}
                        </FieldDescription>
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                      </FieldContent>
                      <Switch
                        id="eventType-form-active"
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
              form="eventType-form"
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
