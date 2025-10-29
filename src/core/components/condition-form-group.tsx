'use client';

import {
  Button,
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
  Input,
  InputGroup,
  InputGroupTextarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@core/components';
import { Control, Controller, FieldPath, FieldValues, UseFormSetValue, useWatch } from 'react-hook-form';

export interface ConditionFormGroupProps<T extends FieldValues> {
  control: Control<T>;
  namePrefix: FieldPath<T>;
  setValue: UseFormSetValue<T>;
  formId?: string;
  disabled?: boolean;
}

export function ConditionFormGroup<T extends FieldValues>({
  control,
  namePrefix,
  setValue,
  formId = 'form',
  disabled = false
}: ConditionFormGroupProps<T>) {
  // Watch the condition to determine if it exists
  const condition = useWatch({
    control,
    name: namePrefix as FieldPath<T>
  });

  const hasCondition = condition && typeof condition === 'object' && condition.type;

  const addCondition = () => {
    // Set default condition values
    (setValue as (name: string, value: unknown) => void)(namePrefix, {
      type: 'sql',
      label: '',
      query: '',
      params: ''
    });
  };

  const removeCondition = () => {
    // Set condition to undefined
    (setValue as (name: string, value: unknown) => void)(namePrefix, undefined);
  };

  if (!hasCondition) {
    return (
      <Field>
        <FieldLabel>Condition</FieldLabel>
        <Button type="button" variant="outline" onClick={addCondition} disabled={disabled}>
          Add Condition
        </Button>
        <FieldDescription>Add an optional condition that must be met for this to be applicable.</FieldDescription>
      </Field>
    );
  }

  return (
    <>
      <Field>
        <div className="flex items-center justify-between">
          <FieldLabel>Condition</FieldLabel>
          <Button type="button" variant="outline" size="sm" onClick={removeCondition} disabled={disabled}>
            Remove Condition
          </Button>
        </div>
        <FieldDescription>Configure the condition that must be met for this to be applicable.</FieldDescription>
      </Field>
      <Controller
        name={`${namePrefix}.type` as FieldPath<T>}
        control={control}
        render={({ field, fieldState }) => (
          <Field orientation="responsive" data-invalid={fieldState.invalid}>
            <FieldContent>
              <FieldLabel htmlFor={`${formId}-${namePrefix}.type`}>Condition Type</FieldLabel>
              <Select
                value={field.value || ''}
                onValueChange={field.onChange}
                disabled={disabled}
                aria-invalid={fieldState.invalid}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select condition type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sql">SQL</SelectItem>
                </SelectContent>
              </Select>
              <FieldDescription>The type of condition that must be met for this to be applicable.</FieldDescription>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </FieldContent>
          </Field>
        )}
      />
      <Controller
        name={`${namePrefix}.label` as FieldPath<T>}
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={`${formId}-${namePrefix}.label`}>Condition Label</FieldLabel>
            <Input
              {...field}
              id={`${formId}-${namePrefix}.label`}
              aria-invalid={fieldState.invalid}
              placeholder="Enter a label for the condition..."
              autoComplete="off"
              disabled={disabled}
            />
            <FieldDescription>A descriptive label for this condition.</FieldDescription>
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
      <Controller
        name={`${namePrefix}.query` as FieldPath<T>}
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={`${formId}-${namePrefix}.query`}>SQL Query</FieldLabel>
            <InputGroup>
              <InputGroupTextarea
                {...field}
                id={`${formId}-${namePrefix}.query`}
                placeholder="Enter SQL query..."
                rows={4}
                className="min-h-20 resize-none font-mono text-sm"
                aria-invalid={fieldState.invalid}
                disabled={disabled}
              />
            </InputGroup>
            <FieldDescription>
              SQL query that must return a boolean result. Use :paramName for parameters.
            </FieldDescription>
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
      <Controller
        name={`${namePrefix}.params` as FieldPath<T>}
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={`${formId}-${namePrefix}.params`}>Query Parameters</FieldLabel>
            <InputGroup>
              <InputGroupTextarea
                {...field}
                id={`${formId}-${namePrefix}.params`}
                placeholder='{"userId": "recipientId", "itemId": "itemId"}'
                rows={3}
                className="min-h-16 resize-none font-mono text-sm"
                aria-invalid={fieldState.invalid}
                disabled={disabled}
              />
            </InputGroup>
            <FieldDescription>JSON object mapping query parameters to values (optional).</FieldDescription>
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
    </>
  );
}
