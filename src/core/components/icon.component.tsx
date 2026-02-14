'use client';

import {
  AlertCircle,
  AlertTriangle,
  Bell,
  CheckCircle,
  CircleAlert,
  Info,
  type LucideIcon,
  TriangleAlert,
  XCircle
} from 'lucide-react';

export type IconProps =
  | { lib?: 'Ionicons'; name: string; size?: number; colorClass?: string; className?: string }
  | { lib: 'MaterialIcons'; name: string; size?: number; colorClass?: string; className?: string }
  | { lib: 'MaterialCommunityIcons'; name: string; size?: number; colorClass?: string; className?: string };

const iconMap: Record<string, LucideIcon> = {
  // Ionicons equivalents
  'information-outline': Info,
  'check-circle-outline': CheckCircle,
  'alert-circle-outline': CircleAlert,
  'alert-outline': AlertTriangle,
  bell: Bell,

  // MaterialIcons equivalents
  'md-check-circle': CheckCircle,
  'md-error': XCircle,
  'md-warning': TriangleAlert,
  'md-notifications': Bell
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
