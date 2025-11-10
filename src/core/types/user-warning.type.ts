import { GenericRecord, GenericRecordMetadata, GenericRecordMetadataBase } from '@supa/types';

export interface UserWarning extends GenericRecord {
  userId: string;
  warningAt: Date; // timestamp
  reason: string;
  userReviewId: string;
  acknowledgedAt?: Date | null; // timestamp
  expiresAt?: Date | null; // timestamp
  retractedAt?: Date | null; // timestamp
}

export const UserWarningMetadata: GenericRecordMetadata<UserWarning> = {
  userId: {
    isArray: false,
    isNullable: false,
    type: 'string',
    searchable: false,
    sortable: false,
    filterable: true
  },
  warningAt: {
    isArray: false,
    isNullable: false,
    type: 'date',
    searchable: false,
    sortable: true,
    filterable: true
  },
  reason: {
    isArray: false,
    isNullable: false,
    type: 'string',
    searchable: true,
    sortable: false,
    filterable: true
  },
  userReviewId: {
    isArray: false,
    isNullable: false,
    type: 'string',
    searchable: false,
    sortable: false,
    filterable: true
  },
  acknowledgedAt: {
    isArray: false,
    isNullable: true,
    type: 'date',
    searchable: false,
    sortable: true,
    filterable: true
  },
  expiresAt: {
    isArray: false,
    isNullable: true,
    type: 'date',
    searchable: false,
    sortable: true,
    filterable: true
  },
  retractedAt: {
    isArray: false,
    isNullable: true,
    type: 'date',
    searchable: false,
    sortable: true,
    filterable: true
  },
  ...GenericRecordMetadataBase
};
