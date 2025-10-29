import { GenericRecord, GenericRecordMetadata, GenericRecordMetadataBase } from '@supa/types';

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

export const BroadcastMetadata: GenericRecordMetadata<Broadcast> = {
  name: {
    isArray: false,
    isNullable: false,
    type: 'string',
    searchable: true,
    sortable: true,
    filterable: true
  },
  description: {
    isArray: false,
    isNullable: true,
    type: 'string',
    searchable: true,
    sortable: true,
    filterable: false
  },
  category: {
    isArray: false,
    isNullable: false,
    type: 'string',
    searchable: true,
    sortable: true,
    filterable: true
  },
  priority: {
    isArray: false,
    isNullable: false,
    type: 'number',
    searchable: false,
    sortable: true,
    filterable: true
  },
  status: {
    isArray: false,
    isNullable: false,
    type: 'string',
    searchable: true,
    sortable: true,
    filterable: true
  },
  validFrom: {
    isArray: false,
    isNullable: false,
    type: 'date',
    searchable: false,
    sortable: true,
    filterable: true
  },
  validTo: {
    isArray: false,
    isNullable: true,
    type: 'date',
    searchable: false,
    sortable: true,
    filterable: true
  },
  title: {
    isArray: false,
    isNullable: false,
    type: 'string',
    searchable: true,
    sortable: true,
    filterable: true
  },
  body: {
    isArray: false,
    isNullable: false,
    type: 'string',
    searchable: true,
    sortable: true,
    filterable: true
  },
  ctaLabel: {
    isArray: false,
    isNullable: true,
    type: 'string',
    searchable: true,
    sortable: true,
    filterable: true
  },
  ctaUrl: {
    isArray: false,
    isNullable: true,
    type: 'string',
    searchable: true,
    sortable: true,
    filterable: true
  },
  mediaId: {
    isArray: false,
    isNullable: true,
    type: 'string',
    searchable: false,
    sortable: false,
    filterable: false
  },
  mediaType: {
    isArray: false,
    isNullable: true,
    type: 'string',
    searchable: true,
    sortable: true,
    filterable: true
  },
  mediaProps: {
    isArray: false,
    isNullable: true,
    type: 'json',
    searchable: false,
    sortable: false,
    filterable: false
  },
  useMediaInNotification: {
    isArray: false,
    isNullable: false,
    type: 'boolean',
    searchable: false,
    sortable: true,
    filterable: true
  },
  isDismissible: {
    isArray: false,
    isNullable: false,
    type: 'boolean',
    searchable: false,
    sortable: true,
    filterable: true
  },
  audience: {
    isArray: false,
    isNullable: false,
    type: 'string',
    searchable: true,
    sortable: true,
    filterable: true
  },
  platform: {
    isArray: false,
    isNullable: false,
    type: 'string',
    searchable: true,
    sortable: true,
    filterable: true
  },
  geoLocation: {
    isArray: false,
    isNullable: true,
    type: 'string',
    searchable: false,
    sortable: false,
    filterable: true
  },
  radius: {
    isArray: false,
    isNullable: true,
    type: 'number',
    searchable: false,
    sortable: true,
    filterable: true
  },
  sendPush: {
    isArray: false,
    isNullable: false,
    type: 'boolean',
    searchable: false,
    sortable: true,
    filterable: true
  },
  sendEmail: {
    isArray: false,
    isNullable: false,
    type: 'boolean',
    searchable: false,
    sortable: true,
    filterable: true
  },
  emailSubject: {
    isArray: false,
    isNullable: true,
    type: 'string',
    searchable: true,
    sortable: true,
    filterable: true
  },
  emailTemplate: {
    isArray: false,
    isNullable: true,
    type: 'string',
    searchable: true,
    sortable: true,
    filterable: true
  },
  emailPlaceholders: {
    isArray: false,
    isNullable: true,
    type: 'json',
    searchable: false,
    sortable: false,
    filterable: false
  },
  ...GenericRecordMetadataBase
};
