import { GenericRecord } from '@supa/types';

export interface Media extends GenericRecord {
  url: string;
  filename: string;
  fileExtension: string;
  filePath: string;
  mimeType: string;
}
