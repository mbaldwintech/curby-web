'use client';

import React, { useCallback, useMemo } from 'react';
import toast, { Toaster, ToastOptions } from 'react-hot-toast';
import { ImageIconProps } from './image-icon.component';
import { ToastIcon } from './toast-icon.component';

export type ToastType = 'success' | 'error' | 'info' | 'warning' | 'notification';

interface ToastMessageProps<T extends string | number | symbol> {
  type: ToastType;
  text1: string;
  text2?: string;
  Icon?: (props: ImageIconProps<T>) => React.ReactElement;
  iconProps?: ImageIconProps<T>;
  onClick?: () => void;
}

export function ToastMessage<T extends string | number | symbol>({
  type,
  text1,
  text2,
  Icon,
  iconProps,
  onClick
}: ToastMessageProps<T>) {
  const defaultIcon = useMemo(() => {
    switch (type) {
      case 'info':
        return 'information-outline';
      case 'success':
        return 'check-circle-outline';
      case 'warning':
        return 'alert-circle-outline';
      case 'error':
        return 'alert-outline';
      case 'notification':
        return 'bell';
      default:
        return 'information-outline';
    }
  }, [type]);

  // Map toast type to Tailwind color classes
  const borderLeftClass = {
    success: 'border-success',
    error: 'border-error',
    warning: 'border-warning',
    info: 'border-info',
    notification: ''
  }[type];

  const cursorClass = onClick ? 'cursor-pointer' : 'cursor-default';

  const handleClick = useCallback(() => {
    if (onClick) onClick();
  }, [onClick]);

  return (
    <div
      onClick={handleClick}
      className={`flex items-center gap-3 max-w-md p-3 rounded-2xl bg-surface ${borderLeftClass ? `border-l-4 ${borderLeftClass}` : ''} ${cursorClass}`}
    >
      <div className={`flex-shrink-0 w-8 h-8 rounded-xl`}>
        {Icon ? <Icon {...(iconProps ?? {})} /> : <ToastIcon {...(iconProps ?? {})} name={defaultIcon} />}
      </div>

      <div className="flex flex-col flex-1">
        <div className="text-primaryText font-bold text-base">{text1}</div>
        {text2 && <div className="text-primaryText text-sm mt-1">{text2}</div>}
      </div>
    </div>
  );
}

export interface ToastProps<T extends string | number | symbol> {
  Icon?: (props: ImageIconProps<T>) => React.ReactElement;
  iconProps?: ImageIconProps<T>;
}

// ToastProvider stays the same
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function ToastProvider<T extends string | number | symbol>(props: ToastProps<T>) {
  return <Toaster position="top-center" toastOptions={{ duration: 1500 }} />;
}

/** Helper function to show a toast */
export function showToast<T extends string | number | symbol>(
  type: ToastType,
  text1: string,
  text2?: string,
  options?: Omit<ToastOptions, 'duration'> & {
    Icon?: (props: ImageIconProps<T>) => React.ReactElement;
    iconProps?: ImageIconProps<T>;
  }
) {
  toast.custom(() => (
    <ToastMessage type={type} text1={text1} text2={text2} Icon={options?.Icon} iconProps={options?.iconProps} />
  ));
}
