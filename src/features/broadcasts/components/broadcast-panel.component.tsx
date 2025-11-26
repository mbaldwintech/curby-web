'use client';

import { DateTimePicker } from '@core/components';
import {
  Button,
  Field,
  FieldError,
  FieldGroup,
  Input,
  Label,
  LoadingSpinner,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  Switch,
  Textarea
} from '@core/components/base';
import { BroadcastCategory, BroadcastStatus } from '@core/enumerations';
import { PanelRef } from '@core/types';
import { forwardRef, useCallback, useImperativeHandle, useState } from 'react';
import { Controller } from 'react-hook-form';
import { FormValues, useBroadcastForm } from '../hooks/use-broadcast-form.hook';

export type BroadcastPanelRef = PanelRef<string | undefined>;

export interface BroadcastPanelProps {
  onClose?: () => void;
}

export const BroadcastPanel = forwardRef<BroadcastPanelRef, BroadcastPanelProps>(function BroadcastPanel(
  { onClose }: BroadcastPanelProps,
  ref
) {
  const [open, setOpen] = useState(false);
  const [broadcastId, setBroadcastId] = useState<string | null>(null);

  const { form, broadcast, loading, submitting, handleSubmit, clear } = useBroadcastForm({
    broadcastId,
    onSubmitSuccess: () => {
      handleClose();
    }
  });

  const handleClose = useCallback(() => {
    setBroadcastId(null);
    setOpen(false);
    onClose?.();
    clear();
  }, [clear, onClose]);

  const onSubmit = useCallback(
    async (data: FormValues) => {
      await handleSubmit(data);
    },
    [handleSubmit]
  );

  useImperativeHandle<BroadcastPanelRef, BroadcastPanelRef>(ref, (): BroadcastPanelRef => {
    return {
      isOpen: open,
      open: (broadcastId?: string) => {
        if (broadcastId) {
          setBroadcastId(broadcastId);
        } else {
          setBroadcastId(null);
        }
        setOpen(true);
      },
      close: handleClose
    };
  }, [handleClose, open]);

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent className="sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>{broadcast ? broadcast.name : 'New Broadcast'}</SheetTitle>
          <SheetDescription>
            {broadcast ? 'Edit broadcast configuration' : 'Fill out the form below to create a new broadcast.'}
          </SheetDescription>
        </SheetHeader>

        <div className="grid flex-1 auto-rows-min gap-6 px-4 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <LoadingSpinner loading={true} />
            </div>
          ) : (
            // @ts-expect-error - React Hook Form type inference issue with zodResolver async validation
            <form id="broadcast-form" onSubmit={form.handleSubmit(onSubmit)}>
              <FieldGroup className="grid grid-cols-1 gap-6">
                {/* General Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">General</h3>

                  <Controller
                    name="name"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <Label htmlFor="broadcast-form-name">Name *</Label>
                        <Input
                          {...field}
                          id="broadcast-form-name"
                          aria-invalid={fieldState.invalid}
                          placeholder="Enter internal name..."
                          autoComplete="off"
                        />
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                      </Field>
                    )}
                  />

                  <Controller
                    name="description"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <Label htmlFor="broadcast-form-description">Description</Label>
                        <Textarea
                          {...field}
                          value={field.value || ''}
                          id="broadcast-form-description"
                          placeholder="Internal description for admin reference..."
                          rows={3}
                        />
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                      </Field>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <Controller
                      name="category"
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <Label htmlFor="broadcast-form-category">Category *</Label>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger id="broadcast-form-category">
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={BroadcastCategory.General}>General</SelectItem>
                              <SelectItem value={BroadcastCategory.Promo}>Promo</SelectItem>
                              <SelectItem value={BroadcastCategory.System}>System</SelectItem>
                              <SelectItem value={BroadcastCategory.MOTD}>MOTD</SelectItem>
                              <SelectItem value={BroadcastCategory.Event}>Event</SelectItem>
                              <SelectItem value={BroadcastCategory.ProFeature}>Pro Feature</SelectItem>
                            </SelectContent>
                          </Select>
                          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                        </Field>
                      )}
                    />

                    <Controller
                      name="priority"
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <Label htmlFor="broadcast-form-priority">Priority</Label>
                          <Input
                            {...field}
                            type="number"
                            id="broadcast-form-priority"
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            placeholder="0"
                          />
                          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                        </Field>
                      )}
                    />
                  </div>

                  <Controller
                    name="status"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <Label htmlFor="broadcast-form-status">Status *</Label>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger id="broadcast-form-status">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={BroadcastStatus.Draft}>Draft</SelectItem>
                            <SelectItem value={BroadcastStatus.Active}>Active</SelectItem>
                            <SelectItem value={BroadcastStatus.Archived}>Archived</SelectItem>
                          </SelectContent>
                        </Select>
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                      </Field>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <Controller
                      name="validFrom"
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <Label htmlFor="broadcast-form-valid-from">Valid From *</Label>
                          <DateTimePicker
                            id="broadcast-form-valid-from"
                            value={field.value ? new Date(field.value) : undefined}
                            onChange={(date: Date | undefined) => field.onChange(date)}
                            aria-invalid={fieldState.invalid}
                            name={field.name}
                          />
                          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                        </Field>
                      )}
                    />

                    <Controller
                      name="validTo"
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <Label htmlFor="broadcast-form-valid-to">Valid To</Label>
                          <DateTimePicker
                            id="broadcast-form-valid-to"
                            value={field.value ? new Date(field.value) : undefined}
                            onChange={(date: Date | undefined) => field.onChange(date || null)}
                            aria-invalid={fieldState.invalid}
                            name={field.name}
                          />
                          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                        </Field>
                      )}
                    />
                  </div>
                </div>

                {/* Targeting Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Targeting</h3>

                  <div className="grid grid-cols-2 gap-4">
                    <Controller
                      name="audience"
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <Label htmlFor="broadcast-form-audience">Audience *</Label>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger id="broadcast-form-audience">
                              <SelectValue placeholder="Select audience" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All</SelectItem>
                              <SelectItem value="guest">Guest</SelectItem>
                              <SelectItem value="registered">Registered</SelectItem>
                              <SelectItem value="pro">Pro</SelectItem>
                              <SelectItem value="business">Business</SelectItem>
                            </SelectContent>
                          </Select>
                          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                        </Field>
                      )}
                    />

                    <Controller
                      name="platform"
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <Label htmlFor="broadcast-form-platform">Platform *</Label>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger id="broadcast-form-platform">
                              <SelectValue placeholder="Select platform" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All</SelectItem>
                              <SelectItem value="ios">iOS</SelectItem>
                              <SelectItem value="android">Android</SelectItem>
                            </SelectContent>
                          </Select>
                          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                        </Field>
                      )}
                    />
                  </div>
                </div>

                {/* Channels Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Channels</h3>

                  <Controller
                    name="sendPush"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field orientation="horizontal" data-invalid={fieldState.invalid}>
                        <Label htmlFor="broadcast-form-send-push">Send Push Notification</Label>
                        <Switch id="broadcast-form-send-push" checked={field.value} onCheckedChange={field.onChange} />
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                      </Field>
                    )}
                  />

                  <Controller
                    name="sendEmail"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field orientation="horizontal" data-invalid={fieldState.invalid}>
                        <Label htmlFor="broadcast-form-send-email">Send Email</Label>
                        <Switch id="broadcast-form-send-email" checked={field.value} onCheckedChange={field.onChange} />
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                      </Field>
                    )}
                  />

                  {form.watch('sendEmail') && (
                    <>
                      <Controller
                        name="emailSubject"
                        control={form.control}
                        render={({ field, fieldState }) => (
                          <Field data-invalid={fieldState.invalid}>
                            <Label htmlFor="broadcast-form-email-subject">Email Subject *</Label>
                            <Input
                              {...field}
                              value={field.value || ''}
                              id="broadcast-form-email-subject"
                              placeholder="Email subject line..."
                            />
                            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                          </Field>
                        )}
                      />

                      <Controller
                        name="emailTemplate"
                        control={form.control}
                        render={({ field, fieldState }) => (
                          <Field data-invalid={fieldState.invalid}>
                            <Label htmlFor="broadcast-form-email-template">Email Template</Label>
                            <Textarea
                              {...field}
                              value={field.value || ''}
                              id="broadcast-form-email-template"
                              placeholder="Custom email template (optional)..."
                              rows={4}
                            />
                            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                          </Field>
                        )}
                      />
                    </>
                  )}
                </div>
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
              form="broadcast-form"
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
