import { GenericRecord, GenericRecordMetadata, GenericRecordMetadataBase } from '@supa/types';
import { IconProps } from '../components/icon.component';
import { NotificationPayload } from './notification-payload.type';

export interface Notification extends GenericRecord {
  userId?: string | null;
  deviceId?: string | null;
  eventId?: string;
  curbyCoinTransactionId?: string;
  notificationTemplateId?: string;
  deliveryChannel: string;
  category: string;
  title: string;
  body: string;
  targetRoute?: string;
  iconProps?: { backgroundColor?: string } & IconProps;
  data: NotificationPayload;
  delivered: boolean;
  read: boolean;
  sentAt: Date | string;
  readAt: Date | string | null;
}

export const NotificationMetadata: GenericRecordMetadata<Notification> = {
  userId: {
    isArray: false,
    isNullable: true,
    type: 'string',
    searchable: false,
    sortable: false,
    filterable: true
  },
  deviceId: {
    isArray: false,
    isNullable: true,
    type: 'string',
    searchable: false,
    sortable: false,
    filterable: true
  },
  eventId: {
    isArray: false,
    isNullable: true,
    type: 'string',
    searchable: false,
    sortable: false,
    filterable: true
  },
  curbyCoinTransactionId: {
    isArray: false,
    isNullable: true,
    type: 'string',
    searchable: false,
    sortable: false,
    filterable: true
  },
  notificationTemplateId: {
    isArray: false,
    isNullable: true,
    type: 'string',
    searchable: false,
    sortable: false,
    filterable: true
  },
  deliveryChannel: {
    isArray: false,
    isNullable: false,
    type: 'string',
    searchable: true,
    sortable: true,
    filterable: true
  },
  category: {
    isArray: false,
    isNullable: false,
    type: 'string',
    searchable: true,
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
  targetRoute: {
    isArray: false,
    isNullable: true,
    type: 'string',
    searchable: false,
    sortable: false,
    filterable: true
  },
  iconProps: {
    isArray: false,
    isNullable: true,
    type: 'json',
    searchable: false,
    sortable: false,
    filterable: false
  },
  data: {
    isArray: false,
    isNullable: false,
    type: 'json',
    searchable: false,
    sortable: false,
    filterable: false
  },
  delivered: {
    isArray: false,
    isNullable: false,
    type: 'boolean',
    searchable: false,
    sortable: true,
    filterable: true
  },
  read: {
    isArray: false,
    isNullable: false,
    type: 'boolean',
    searchable: false,
    sortable: true,
    filterable: true
  },
  sentAt: {
    isArray: false,
    isNullable: false,
    type: 'date',
    searchable: false,
    sortable: true,
    filterable: true
  },
  readAt: {
    isArray: false,
    isNullable: true,
    type: 'date',
    searchable: false,
    sortable: true,
    filterable: true
  },
  ...GenericRecordMetadataBase
};
