import { GenericRecord, GenericRecordMetadata, GenericRecordMetadataBase } from '@supa/types';

export interface UserSuspension extends GenericRecord {
  userId: string;
  active: boolean;
  effectiveFrom: Date;
  effectiveTo?: Date | null;
  userReviewId: string;
  liftedAt?: Date | null;
}

export const UserSuspensionMetadata: GenericRecordMetadata<UserSuspension> = {
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
  effectiveFrom: {
    isArray: false,
    isNullable: false,
    type: 'timestamp',
    searchable: false,
    sortable: true,
    filterable: true
  },
  effectiveTo: {
    isArray: false,
    isNullable: true,
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
