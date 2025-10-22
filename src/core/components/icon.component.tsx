'use client';

import { IconType } from 'react-icons';
import {
  IoIosAlert,
  IoIosInformationCircleOutline,
  IoMdAlert,
  IoMdCheckmarkCircleOutline,
  IoMdNotifications
} from 'react-icons/io';
import { MdCheckCircle, MdError, MdNotifications, MdWarning } from 'react-icons/md';

export type IconProps =
  | { lib?: 'Ionicons'; name: string; size?: number; colorClass?: string; className?: string }
  | { lib: 'MaterialIcons'; name: string; size?: number; colorClass?: string; className?: string }
  | { lib: 'MaterialCommunityIcons'; name: string; size?: number; colorClass?: string; className?: string };

const iconMap: Record<string, IconType> = {
  // Ionicons
  'information-outline': IoIosInformationCircleOutline,
  'check-circle-outline': IoMdCheckmarkCircleOutline,
  'alert-circle-outline': IoIosAlert,
  'alert-outline': IoMdAlert,
  bell: IoMdNotifications,

  // MaterialIcons
  'md-check-circle': MdCheckCircle,
  'md-error': MdError,
  'md-warning': MdWarning,
  'md-notifications': MdNotifications
};

export function Icon(props: IconProps) {
  const lib = props.lib ?? 'Ionicons';
  const size = props.size ?? 24;

  // Use a Tailwind color class if provided, else default to primaryText
  const colorClass = props.colorClass ?? 'text-primaryText';
  const className = `${colorClass} ${props.className ?? ''}`;

  const IconComponent = iconMap[props.name];

  if (!IconComponent) {
    console.warn(`Icon "${props.name}" not found in library "${lib}"`);
    return null;
  }

  return <IconComponent size={size} className={className} />;
}
