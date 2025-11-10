import { SupportRequestMessageSenderType, SupportRequestMessageType } from '@core/enumerations';
import { GenericRecord } from '@supa/types';

export interface SupportRequestMessage extends GenericRecord {
  supportRequestId: string;
  senderId?: string | null;
  senderType: SupportRequestMessageSenderType;
  message: string;
  messageType: SupportRequestMessageType;
  isInternal: boolean;
  readAt?: Date | null;
}
