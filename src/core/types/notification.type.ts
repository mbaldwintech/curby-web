import { IconProps } from '@common/components';
import { GenericRecord } from '@supa/types';
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
