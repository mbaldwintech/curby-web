import { GenericRecord } from '@supa/types';

export interface ItemMedia extends GenericRecord {
  itemId: string;
  mediaId: string;
  thumbnailId?: string;
}
