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
import { PanelRef } from '@core/types';
import { toZonedTime } from 'date-fns-tz';
import { forwardRef, useCallback, useEffect, useImperativeHandle, useState } from 'react';
import { Controller } from 'react-hook-form';
import { Frequency, Options, RRule } from 'rrule';
import { ScheduleFormValues, useScheduleForm } from '../hooks/use-schedule-form.hook';

export type SchedulePanelRef = PanelRef<{ scheduleId?: string; broadcastId: string }>;

export interface SchedulePanelProps {
  onClose?: () => void;
}

export const SchedulePanel = forwardRef<SchedulePanelRef, SchedulePanelProps>(function SchedulePanel(
  { onClose }: SchedulePanelProps,
  ref
) {
  const [open, setOpen] = useState(false);
  const [scheduleId, setScheduleId] = useState<string | null>(null);
  const [broadcastId, setBroadcastId] = useState<string>('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [frequency, setFrequency] = useState<keyof typeof Frequency>('DAILY');
  const [interval, setInterval] = useState(1);
  const [count, setCount] = useState<number | null>(null);
  const [displayDate, setDisplayDate] = useState<Date | undefined>(undefined);
  const [displayEndDate, setDisplayEndDate] = useState<Date | undefined>(undefined);

  const { form, schedule, loading, submitting, handleSubmit, clear } = useScheduleForm({
    scheduleId,
    broadcastId,
    onSubmitSuccess: () => {
      handleClose();
    }
  });

  const currentTimezone = form.watch('timezone') || 'UTC';

  // Convert stored UTC date to display date in selected timezone
  useEffect(() => {
    const dtStart = form.getValues('dtStart');
    if (dtStart && currentTimezone) {
      const zonedDate = toZonedTime(dtStart, currentTimezone);
      setDisplayDate(zonedDate);
    }
  }, [form, currentTimezone]);

  // Convert stored UTC end date to display date in selected timezone
  useEffect(() => {
    const dtEnd = form.getValues('dtEnd');
    if (dtEnd && currentTimezone) {
      const zonedDate = toZonedTime(dtEnd, currentTimezone);
      setDisplayEndDate(zonedDate);
    }
  }, [form, currentTimezone]);

  // Handle date change - convert from display timezone to UTC for storage
  const handleDateChange = useCallback(
    (date: Date | undefined) => {
      if (!date) {
        form.setValue('dtStart', new Date());
        setDisplayDate(undefined);
        return;
      }

      setDisplayDate(date);

      // Interpret the date as being in the selected timezone, then store as UTC
      const year = date.getFullYear();
      const month = date.getMonth();
      const day = date.getDate();
      const hours = date.getHours();
      const minutes = date.getMinutes();
      const seconds = date.getSeconds();

      // Create ISO string in the selected timezone
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
      const zonedDate = toZonedTime(dateStr, currentTimezone);

      form.setValue('dtStart', zonedDate, { shouldDirty: true, shouldValidate: true });
    },
    [form, currentTimezone]
  );

  // Handle end date change
  const handleEndDateChange = useCallback(
    (date: Date | undefined) => {
      if (!date) {
        // For optional dtEnd field, we need to clear it properly
        form.setValue('dtEnd', null as unknown as Date);
        setDisplayEndDate(undefined);
        return;
      }

      setDisplayEndDate(date);

      // Interpret the date as being in the selected timezone, then store as UTC
      const year = date.getFullYear();
      const month = date.getMonth();
      const day = date.getDate();
      const hours = date.getHours();
      const minutes = date.getMinutes();
      const seconds = date.getSeconds();

      // Create ISO string in the selected timezone
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
      const zonedDate = toZonedTime(dateStr, currentTimezone);

      form.setValue('dtEnd', zonedDate, { shouldDirty: true, shouldValidate: true });
    },
    [form, currentTimezone]
  );

  const handleClose = useCallback(() => {
    setScheduleId(null);
    setBroadcastId('');
    setIsRecurring(false);
    setOpen(false);
    onClose?.();
    clear();
  }, [clear, onClose]);

  const generateRRule = useCallback(() => {
    if (!isRecurring) return null;

    const dtStart = form.getValues('dtStart');
    const dtEnd = form.getValues('dtEnd');

    const options: Partial<Options> = {
      freq: Frequency[frequency],
      interval,
      dtstart: dtStart
    };

    if (count) {
      options.count = count;
    } else if (dtEnd) {
      options.until = dtEnd;
    }

    const rule = new RRule(options);
    // RRule.toString() returns "DTSTART:...\nRRULE:..." so we need to get the RRULE line
    const lines = rule.toString().split('\n');
    const rruleLine = lines.find((line) => line.startsWith('RRULE:'));
    return rruleLine || lines[0]; // Fallback to first line if RRULE not found
  }, [isRecurring, frequency, interval, count, form]);

  const onSubmit = useCallback(
    async (data: ScheduleFormValues) => {
      const rruleString = generateRRule();
      await handleSubmit({ ...data, rrule: rruleString });
    },
    [handleSubmit, generateRRule]
  );

  useImperativeHandle<SchedulePanelRef, SchedulePanelRef>(ref, (): SchedulePanelRef => {
    return {
      isOpen: open,
      open: (params?: { scheduleId?: string; broadcastId: string }) => {
        if (!params) return;
        setBroadcastId(params.broadcastId);
        if (params.scheduleId) {
          setScheduleId(params.scheduleId);
        } else {
          setScheduleId(null);
        }
        setOpen(true);
      },
      close: handleClose
    };
  }, [handleClose, open]);

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent className="overflow-y-auto w-full sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>{schedule ? 'Edit Schedule' : 'New Schedule'}</SheetTitle>
          <SheetDescription>
            {schedule
              ? 'Edit the schedule configuration'
              : 'Create a schedule to automatically send this broadcast at specific times'}
          </SheetDescription>
        </SheetHeader>

        <div className="grid flex-1 auto-rows-min gap-6 px-4 overflow-auto py-6">
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <LoadingSpinner loading={true} />
            </div>
          ) : (
            // @ts-expect-error - React Hook Form type inference issue with zodResolver
            <form id="schedule-form" onSubmit={form.handleSubmit(onSubmit)}>
              <FieldGroup className="grid grid-cols-1 gap-6">
                <Controller
                  name="name"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <Label htmlFor="schedule-form-name">Name *</Label>
                      <Input
                        {...field}
                        id="schedule-form-name"
                        aria-invalid={fieldState.invalid}
                        placeholder="e.g., Weekly Monday Reminder"
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
                      <Label htmlFor="schedule-form-description">Description</Label>
                      <Textarea
                        {...field}
                        value={field.value || ''}
                        id="schedule-form-description"
                        placeholder="Optional description..."
                        rows={3}
                      />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />

                <div className="flex gap-2">
                  <Controller
                    name="dtStart"
                    control={form.control}
                    render={({ fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <DateTimePicker value={displayDate} onChange={handleDateChange} />
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                      </Field>
                    )}
                  />

                  <Controller
                    name="timezone"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <Label htmlFor="schedule-form-timezone">Timezone</Label>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger id="schedule-form-timezone">
                            <SelectValue placeholder="Select timezone" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="UTC">UTC</SelectItem>
                            <SelectItem value="America/New_York">America/New_York</SelectItem>
                            <SelectItem value="America/Los_Angeles">America/Los_Angeles</SelectItem>
                            <SelectItem value="America/Chicago">America/Chicago</SelectItem>
                            <SelectItem value="America/Denver">America/Denver</SelectItem>
                            <SelectItem value="Europe/London">Europe/London</SelectItem>
                            <SelectItem value="Europe/Paris">Europe/Paris</SelectItem>
                            <SelectItem value="Asia/Tokyo">Asia/Tokyo</SelectItem>
                            <SelectItem value="Australia/Sydney">Australia/Sydney</SelectItem>
                          </SelectContent>
                        </Select>
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                      </Field>
                    )}
                  />
                </div>

                <div className="text-xs text-muted-foreground">
                  The date/time above will be interpreted as {form.watch('timezone') || 'UTC'} time. For example,
                  &quot;9:00 AM&quot; means 9:00 AM in the selected timezone.
                </div>

                <Field orientation="horizontal">
                  <Label>Recurring Schedule</Label>
                  <Switch checked={isRecurring} onCheckedChange={setIsRecurring} />
                </Field>

                {isRecurring && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <Field>
                        <Label htmlFor="frequency">Frequency</Label>
                        <Select value={frequency} onValueChange={(val) => setFrequency(val as keyof typeof Frequency)}>
                          <SelectTrigger id="frequency">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="DAILY">Daily</SelectItem>
                            <SelectItem value="WEEKLY">Weekly</SelectItem>
                            <SelectItem value="MONTHLY">Monthly</SelectItem>
                            <SelectItem value="YEARLY">Yearly</SelectItem>
                          </SelectContent>
                        </Select>
                      </Field>

                      <Field>
                        <Label htmlFor="interval">Interval</Label>
                        <Input
                          id="interval"
                          type="number"
                          min="1"
                          value={interval}
                          onChange={(e) => setInterval(parseInt(e.target.value) || 1)}
                          placeholder="1"
                        />
                      </Field>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <Field>
                        <Label htmlFor="count">Occurrences</Label>
                        <Input
                          id="count"
                          type="number"
                          min="1"
                          value={count || ''}
                          onChange={(e) => setCount(e.target.value ? parseInt(e.target.value) : null)}
                          placeholder="Leave empty for until date"
                        />
                      </Field>

                      <div />
                    </div>

                    <Controller
                      name="dtEnd"
                      control={form.control}
                      render={({ fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <DateTimePicker
                            value={displayEndDate}
                            onChange={handleEndDateChange}
                            disabled={count !== null}
                          />
                          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                        </Field>
                      )}
                    />

                    <div className="text-sm text-muted-foreground">
                      {generateRRule() && (
                        <div>
                          <strong>RRULE:</strong> {generateRRule()}
                        </div>
                      )}
                    </div>
                  </>
                )}

                <Controller
                  name="active"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field orientation="horizontal" data-invalid={fieldState.invalid}>
                      <Label htmlFor="schedule-form-active">Active</Label>
                      <Switch id="schedule-form-active" checked={field.value} onCheckedChange={field.onChange} />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
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
              form="schedule-form"
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
