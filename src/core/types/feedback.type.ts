import { FeedbackType } from '@core/enumerations';
import { GenericRecord, GenericRecordMetadata, GenericRecordMetadataBase } from '@supa/types';

export interface Feedback extends GenericRecord {
  userId?: string;
  message: string;
  type?: FeedbackType; // default 'general', -- e.g., 'bug', 'feature', 'question'
  resolved: boolean; // default false
}

export const FeedbackMetadata: GenericRecordMetadata<Feedback> = {
  userId: {
    isArray: false,
    isNullable: true,
    type: 'string',
    searchable: false,
    sortable: false,
    filterable: true
  },
  message: {
    isArray: false,
    isNullable: false,
    type: 'string',
    searchable: true,
    sortable: true,
    filterable: true
  },
  type: {
    isArray: false,
    isNullable: true,
    type: 'string',
    searchable: true,
    sortable: true,
    filterable: true
  },
  resolved: {
    isArray: false,
    isNullable: false,
    type: 'boolean',
    searchable: false,
    sortable: true,
    filterable: true
  },
  ...GenericRecordMetadataBase
};
