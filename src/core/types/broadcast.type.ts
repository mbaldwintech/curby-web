import { GenericRecord } from '@supa/types';

export interface Broadcast extends GenericRecord {
  name: string;
  description?: string | null;
  category: string;
  priority: number;
  status: string;
  validFrom: Date;
  validTo?: Date | null;
  title: string;
  body: string;
  ctaLabel?: string | null;
  ctaUrl?: string | null;
  mediaId?: string | null;
  mediaType?: 'lottie' | 'image' | 'icon' | null;
  mediaProps?: Record<string, unknown> | null;
  useMediaInNotification: boolean;
  isDismissible: boolean;
  audience: string;
  platform: string;
  geoLocation?: string | null;
  radius?: number | null;
  sendPush: boolean;
  sendEmail: boolean;
  emailSubject?: string | null;
  emailTemplate?: string | null;
  emailPlaceholders?: Record<string, unknown> | null;
}
