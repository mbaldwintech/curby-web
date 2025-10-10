import { GenericRecord } from '@supa/types';

export interface SupportRequestMessageMedia extends GenericRecord {
  supportRequestMessageId: string;
  mediaId: string;
}
