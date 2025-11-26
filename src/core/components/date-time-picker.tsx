'use client';

import { ChevronDownIcon } from 'lucide-react';
import * as React from 'react';

import { Button } from './base/button';
import { Calendar } from './base/calendar';
import { Input } from './base/input';
import { Label } from './base/label';
import { Popover, PopoverContent, PopoverTrigger } from './base/popover';

export interface DateTimePickerProps {
  id?: string;
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  disabled?: boolean;
  required?: boolean;
  'aria-invalid'?: boolean;
  'aria-describedby'?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  name?: string;
  className?: string;
  dateLabel?: string;
  timeLabel?: string;
  placeholder?: string;
}

export function DateTimePicker({
  id,
  value,
  onChange,
  disabled,
  required,
  'aria-invalid': ariaInvalid,
  'aria-describedby': ariaDescribedBy,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  name,
  className,
  dateLabel = 'Date',
  timeLabel = 'Time',
  placeholder = 'Select date'
}: DateTimePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [timeValue, setTimeValue] = React.useState('00:00:00');

  // Initialize time from value prop
  React.useEffect(() => {
    if (value) {
      const hours = value.getHours().toString().padStart(2, '0');
      const minutes = value.getMinutes().toString().padStart(2, '0');
      const seconds = value.getSeconds().toString().padStart(2, '0');
      setTimeValue(`${hours}:${minutes}:${seconds}`);
    }
  }, [value]);

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value;
    setTimeValue(newTime);

    // Parse time string (HH:mm:ss or HH:mm)
    const [hoursStr, minutesStr, secondsStr = '0'] = newTime.split(':');
    const hours = parseInt(hoursStr, 10);
    const minutes = parseInt(minutesStr, 10);
    const seconds = parseInt(secondsStr, 10);

    if (value) {
      // Create new date with existing date but new time
      const newDate = new Date(value);
      newDate.setHours(hours, minutes, seconds);
      onChange?.(newDate);
    } else {
      // Create new date with today's date and the specified time
      const newDate = new Date();
      newDate.setHours(hours, minutes, seconds);
      onChange?.(newDate);
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      // Parse current time value to preserve it
      const [hoursStr, minutesStr, secondsStr = '0'] = timeValue.split(':');
      const hours = parseInt(hoursStr, 10);
      const minutes = parseInt(minutesStr, 10);
      const seconds = parseInt(secondsStr, 10);

      // Set the time on the selected date
      date.setHours(hours, minutes, seconds);
      onChange?.(date);
    } else {
      onChange?.(undefined);
    }
    setOpen(false);
  };
  const datePickerId = id ? `${id}-date` : 'date-picker';
  const timePickerId = id ? `${id}-time` : 'time-picker';

  return (
    <div id={id} className={className}>
      <div className="flex gap-4">
        <div className="flex flex-col gap-3">
          <Label htmlFor={datePickerId} className="px-1">
            {dateLabel}
            {required && <span className="text-destructive ml-1">*</span>}
          </Label>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                id={datePickerId}
                className="w-32 justify-between font-normal"
                disabled={disabled}
                aria-invalid={ariaInvalid}
                aria-describedby={ariaDescribedBy}
                aria-label={ariaLabel}
                aria-labelledby={ariaLabelledBy}
                aria-required={required}
                data-state={ariaInvalid ? 'invalid' : undefined}
              >
                {value ? value.toLocaleDateString() : placeholder}
                <ChevronDownIcon className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-fit p-0 overflow-hidden">
              <Calendar
                mode="single"
                selected={value}
                captionLayout="dropdown"
                onSelect={handleDateSelect}
                disabled={disabled}
                required={required}
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="flex flex-col gap-3">
          <Label htmlFor={timePickerId} className="px-1">
            {timeLabel}
            {required && <span className="text-destructive ml-1">*</span>}
          </Label>
          <Input
            type="time"
            id={timePickerId}
            name={name}
            step="1"
            value={timeValue}
            onChange={handleTimeChange}
            disabled={disabled}
            required={required}
            aria-invalid={ariaInvalid}
            aria-describedby={ariaDescribedBy}
            aria-label={ariaLabel ? `${ariaLabel} time` : undefined}
            aria-labelledby={ariaLabelledBy}
            data-state={ariaInvalid ? 'invalid' : undefined}
            className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
          />
        </div>
      </div>
    </div>
  );
}
