import { GenericRecord } from '@supa/types';

export interface SupportRequestMessage extends GenericRecord {
  supportRequestId: string;
  senderId?: string | null;
  senderType: 'user' | 'support_agent' | 'system';
  message: string;
  messageType: 'reply' | 'internal_note' | 'status_change' | 'assignment_change';
  isInternal: boolean;
  readAt?: Date | null;
}
