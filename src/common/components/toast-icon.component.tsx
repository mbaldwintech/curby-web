'use client';

import React from 'react';
import {
  MdCheckCircleOutline,
  MdErrorOutline,
  MdInfoOutline,
  MdNotificationsNone,
  MdWarningAmber
} from 'react-icons/md';

export type ToastIconName =
  | 'information-outline'
  | 'check-circle-outline'
  | 'alert-circle-outline'
  | 'alert-outline'
  | 'bell';

interface ToastIconProps {
  name?: ToastIconName;
  size?: number;
  className?: string; // Use Tailwind classes
}

export const ToastIcon: React.FC<ToastIconProps> = ({ name = 'information-outline', size = 40, className }) => {
  const IconComponent = {
    'information-outline': MdInfoOutline,
    'check-circle-outline': MdCheckCircleOutline,
    'alert-circle-outline': MdErrorOutline,
    'alert-outline': MdWarningAmber,
    bell: MdNotificationsNone
  }[name];

  // Default Tailwind color class
  const colorClass = 'text-primaryText';
  const combinedClassName = `${colorClass} ${className ?? ''}`;

  return <IconComponent size={size} className={combinedClassName} />;
};
