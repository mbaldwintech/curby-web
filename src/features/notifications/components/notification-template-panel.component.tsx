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
import { CurbyCoinTransactionTypeSelect } from '@features/curby-coins/components';
import { EventTypeSelect } from '@features/events/components';
import { forwardRef, useCallback, useImperativeHandle, useState } from 'react';
import { Controller } from 'react-hook-form';
import { useNotificationTemplateForm } from '../hooks';

export type NotificationTemplatePanelRef = PanelRef<string | undefined>;

export interface NotificationTemplatePanelProps {
  onClose?: () => void;
}

export const NotificationTemplatePanel = forwardRef<NotificationTemplatePanelRef, NotificationTemplatePanelProps>(
  function NotificationTemplatePanel({ onClose }: NotificationTemplatePanelProps, ref) {
    const [open, setOpen] = useState(false);
    const [notificationTemplateId, setNotificationTemplateId] = useState<string | null>(null);
    const { form, notificationTemplate, loading, submitting, handleSubmit, clear } = useNotificationTemplateForm({
      notificationTemplateId,
      onSubmitSuccess: () => {
        handleClose();
      }
    });

    const handleClose = useCallback(() => {
      setNotificationTemplateId(null);
      setOpen(false);
      onClose?.();
      clear();
    }, [clear, onClose]);

    useImperativeHandle<
      NotificationTemplatePanelRef,
      NotificationTemplatePanelRef
    >(ref, (): NotificationTemplatePanelRef => {
      return {
        isOpen: open,
        open: (notificationTemplateId?: string) => {
          setNotificationTemplateId(notificationTemplateId || null);
          setOpen(true);
        },
        close: handleClose
      };
    }, [handleClose, open]);

    return (
      <Sheet open={open} onOpenChange={handleClose}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{notificationTemplate ? notificationTemplate.key : 'New Notification Template'}</SheetTitle>
            <SheetDescription>
              {notificationTemplate
                ? notificationTemplate.category
                : 'Fill out the form below to create a new notification template.'}
            </SheetDescription>
          </SheetHeader>

          <div className="grid flex-1 auto-rows-min gap-6 px-4 overflow-auto">
            {loading ? (
              <div className="flex items-center justify-center h-48">
                <LoadingSpinner loading={true} />
              </div>
            ) : (
              <form id="notificationTemplate-form" onSubmit={form.handleSubmit(handleSubmit)}>
                <FieldGroup className="grid grid-cols-1 gap-6">
                  <Controller
                    name="key"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="notificationTemplate-form-key">Key</FieldLabel>
                        <Input
                          {...field}
                          id="notificationTemplate-form-key"
                          aria-invalid={fieldState.invalid}
                          placeholder="Enter a key for the notification template..."
                          autoComplete="off"
                        />
                        <FieldDescription>
                          A unique key to identify the notification template (e.g., &quot;item-posted&quot;,
                          &quot;item-taken&quot;).
                        </FieldDescription>
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                      </Field>
                    )}
                  />
                  <Controller
                    name="version"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="notificationTemplate-form-version">Version</FieldLabel>
                        <Input
                          {...field}
                          id="notificationTemplate-form-version"
                          type="number"
                          min="1"
                          value={field.value || ''}
                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value, 10) : 1)}
                          aria-invalid={fieldState.invalid}
                          placeholder="1"
                        />
                        <FieldDescription>Version number for this template.</FieldDescription>
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                      </Field>
                    )}
                  />
                  <Controller
                    name="eventTypeId"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="notificationTemplate-form-eventTypeId">Event Type</FieldLabel>
                        <EventTypeSelect
                          {...field}
                          id="notificationTemplate-panel-eventTypeId"
                          aria-invalid={fieldState.invalid}
                          placeholder="Select event type..."
                          value={field.value ?? undefined}
                          onSelect={(val) => field.onChange(val ?? undefined)}
                        />
                        <FieldDescription>The event type that triggers this notification (optional).</FieldDescription>
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                      </Field>
                    )}
                  />
                  <Controller
                    name="curbyCoinTransactionTypeId"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="notificationTemplate-form-curbyCoinTransactionTypeId">
                          Curby Coin Transaction Type
                        </FieldLabel>
                        <CurbyCoinTransactionTypeSelect
                          {...field}
                          id="notificationTemplate-panel-curbyCoinTransactionTypeId"
                          aria-invalid={fieldState.invalid}
                          placeholder="Select the transaction type..."
                          value={field.value ?? null}
                          onSelect={(val) => field.onChange(val ?? undefined)}
                        />
                        <FieldDescription>
                          The Curby Coin transaction type that triggers this notification (optional).
                        </FieldDescription>
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                      </Field>
                    )}
                  />
                  <Controller
                    name="recipient"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="notificationTemplate-form-recipient">Recipient</FieldLabel>
                        <Input
                          {...field}
                          id="notificationTemplate-form-recipient"
                          aria-invalid={fieldState.invalid}
                          placeholder="Enter recipient type..."
                          autoComplete="off"
                        />
                        <FieldDescription>
                          Who should receive this notification (e.g., &quot;user&quot;, &quot;admin&quot;).
                        </FieldDescription>
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                      </Field>
                    )}
                  />
                  <Controller
                    name="deliveryChannel"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="notificationTemplate-form-deliveryChannel">Delivery Channel</FieldLabel>
                        <Input
                          {...field}
                          id="notificationTemplate-form-deliveryChannel"
                          aria-invalid={fieldState.invalid}
                          placeholder="Enter delivery channel..."
                          autoComplete="off"
                        />
                        <FieldDescription>
                          How the notification should be delivered (e.g., &quot;push&quot;, &quot;email&quot;,
                          &quot;in-app&quot;).
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
                        <FieldLabel htmlFor="notificationTemplate-form-category">Category</FieldLabel>
                        <Input
                          {...field}
                          id="notificationTemplate-form-category"
                          aria-invalid={fieldState.invalid}
                          placeholder="Enter a category for the notification template..."
                          autoComplete="off"
                        />
                        <FieldDescription>
                          A category to group similar notifications (e.g., &quot;items&quot;, &quot;social&quot;).
                        </FieldDescription>
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                      </Field>
                    )}
                  />
                  <Controller
                    name="titleTemplate"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="notificationTemplate-form-titleTemplate">Title Template</FieldLabel>
                        <Input
                          {...field}
                          id="notificationTemplate-form-titleTemplate"
                          aria-invalid={fieldState.invalid}
                          placeholder="Enter notification title template (optional)..."
                          autoComplete="off"
                        />
                        <FieldDescription>
                          Template for the notification title. Use placeholders like {'{'}
                          {'{'}userName{'}'}
                          {'}'}.
                        </FieldDescription>
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                      </Field>
                    )}
                  />
                  <Controller
                    name="bodyTemplate"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="notificationTemplate-form-bodyTemplate">Body Template</FieldLabel>
                        <InputGroup>
                          <InputGroupTextarea
                            {...field}
                            id="notificationTemplate-form-bodyTemplate"
                            placeholder="Enter notification body template (optional)..."
                            rows={4}
                            className="min-h-24 resize-none"
                            aria-invalid={fieldState.invalid}
                          />
                        </InputGroup>
                        <FieldDescription>
                          Template for the notification body. Use placeholders like {'{'}
                          {'{'}itemTitle{'}'}
                          {'}'}.
                        </FieldDescription>
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                      </Field>
                    )}
                  />
                  <Controller
                    name="targetRoute"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="notificationTemplate-form-targetRoute">Target Route</FieldLabel>
                        <Input
                          {...field}
                          id="notificationTemplate-form-targetRoute"
                          aria-invalid={fieldState.invalid}
                          placeholder="Enter target route (optional)..."
                          autoComplete="off"
                        />
                        <FieldDescription>
                          Where to navigate when notification is tapped (e.g., &quot;/items/{'{'}itemId{'}'}&quot;).
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
                        <FieldLabel htmlFor="notificationTemplate-form-validFrom">Valid From</FieldLabel>
                        <DateTimePicker
                          id="notificationTemplate-form-validFrom"
                          value={field.value ? new Date(field.value) : undefined}
                          onChange={(date: Date | undefined) => field.onChange(date || null)}
                          aria-invalid={fieldState.invalid}
                          name={field.name}
                        />
                        <FieldDescription>
                          The date and time when this notification template becomes active.
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
                        <FieldLabel htmlFor="notificationTemplate-form-validTo">Valid To</FieldLabel>
                        <DateTimePicker
                          id="notificationTemplate-form-validTo"
                          value={field.value ? new Date(field.value) : undefined}
                          onChange={(date: Date | undefined) => field.onChange(date || null)}
                          aria-invalid={fieldState.invalid}
                          name={field.name}
                        />
                        <FieldDescription>
                          The date and time when this notification template expires (optional).
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
                        <FieldLabel htmlFor="notificationTemplate-form-max">Max Occurrences</FieldLabel>
                        <Input
                          {...field}
                          id="notificationTemplate-form-max"
                          type="number"
                          min="1"
                          value={field.value || ''}
                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value, 10) : undefined)}
                          aria-invalid={fieldState.invalid}
                          placeholder="Unlimited"
                        />
                        <FieldDescription>
                          Maximum number of times this notification can be sent (optional).
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
                        <FieldLabel htmlFor="notificationTemplate-form-maxPerDay">Max Per Day</FieldLabel>
                        <Input
                          {...field}
                          id="notificationTemplate-form-maxPerDay"
                          type="number"
                          min="1"
                          value={field.value || ''}
                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value, 10) : undefined)}
                          aria-invalid={fieldState.invalid}
                          placeholder="Unlimited"
                        />
                        <FieldDescription>
                          Maximum number of times this notification can be sent per day (optional).
                        </FieldDescription>
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                      </Field>
                    )}
                  />
                  <ConditionFormGroup
                    control={form.control}
                    namePrefix="condition"
                    setValue={form.setValue}
                    formId="notificationTemplate-form"
                  />
                  <Controller
                    name="active"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field orientation="horizontal" data-invalid={fieldState.invalid}>
                        <FieldContent>
                          <FieldLabel htmlFor="notificationTemplate-form-active">Status</FieldLabel>
                          <FieldDescription>
                            {field.value
                              ? 'Notification template is active and can be used'
                              : 'Notification template is inactive and will not be used'}
                          </FieldDescription>
                          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                        </FieldContent>
                        <Switch
                          id="notificationTemplate-form-active"
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
                form="notificationTemplate-form"
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
  }
);
