import { GenericRecord, GenericRecordMetadata, GenericRecordMetadataBase } from '@supa/types';

export interface UserBan extends GenericRecord {
  userId: string;
  active: boolean;
  bannedAt: Date;
  userReviewId: string;
  liftedAt?: Date | null;
}

export const UserBanMetadata: GenericRecordMetadata<UserBan> = {
  userId: {
    isArray: false,
    isNullable: false,
    type: 'string',
    searchable: false,
    sortable: false,
    filterable: true
  },
  active: {
    isArray: false,
    isNullable: false,
    type: 'boolean',
    searchable: false,
    sortable: true,
    filterable: true
  },
  bannedAt: {
    isArray: false,
    isNullable: false,
    type: 'timestamp',
    searchable: false,
    sortable: true,
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
  liftedAt: {
    isArray: false,
    isNullable: true,
    type: 'timestamp',
    searchable: false,
    sortable: true,
    filterable: true
  },
  ...GenericRecordMetadataBase
};
