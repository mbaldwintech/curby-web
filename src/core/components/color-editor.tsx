'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Button,
  ColorPicker,
  ColorPickerAlpha,
  ColorPickerEyeDropper,
  ColorPickerFormat,
  ColorPickerHue,
  ColorPickerOutput,
  ColorPickerPresetPicker,
  ColorPickerSelection,
  Popover,
  PopoverContent,
  PopoverTrigger
} from './base';

export const ColorEditor = ({ value, onChange }: { value: string; onChange: (value: string) => void }) => {
  const [open, setOpen] = useState(false);
  const [initialColor, setInitialColor] = useState(value);
  const [color, setColor] = useState('rgba(255, 255, 255, 1)');

  const handleApply = useCallback(() => {
    onChange(color);
    setOpen(false);
  }, [color, onChange]);

  useEffect(() => {
    setInitialColor(value);
    setColor(value);
  }, [value]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="h-8 w-8 rounded border border-border shadow-sm"
          style={{ backgroundColor: initialColor }}
        />
      </PopoverTrigger>
      <PopoverContent className="bg-background p-3 min-w-85">
        <ColorPicker
          value={initialColor}
          onChange={(rgba) => {
            const [r, g, b, a] = rgba as number[];
            setColor(`rgba(${r}, ${g}, ${b}, ${a})`);
          }}
        >
          <div className="flex flex-col gap-2">
            <div className="h-32 w-full">
              <ColorPickerSelection />
            </div>
            <ColorPickerHue />
            <ColorPickerAlpha />
            <ColorPickerPresetPicker
              presets={['#fff5dc', '#282a29', '#2b3d43', '#587652', '#4caf50', '#ffc107', '#d1001f']}
            />
            <div className="flex gap-2">
              <ColorPickerOutput />
              <ColorPickerFormat className="flex-1" />
              <ColorPickerEyeDropper />
            </div>
          </div>
        </ColorPicker>
        <div className="mt-4 flex justify-end gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setColor(initialColor);
              setOpen(false);
            }}
          >
            Cancel
          </Button>
          <Button size="sm" onClick={handleApply}>
            Apply
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
