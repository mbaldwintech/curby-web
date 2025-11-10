import { TutorialViewStatus } from '@core/enumerations';
import { GenericRecord, GenericRecordMetadata, GenericRecordMetadataBase } from '@supa/types';

export interface TutorialView extends GenericRecord {
  tutorialId: string;
  userId?: string;
  deviceId?: string;
  status: TutorialViewStatus;
}

export const TutorialViewMetadata: GenericRecordMetadata<TutorialView> = {
  tutorialId: {
    isArray: false,
    isNullable: false,
    type: 'string',
    searchable: false,
    sortable: false,
    filterable: true
  },
  userId: {
    isArray: false,
    isNullable: true,
    type: 'string',
    searchable: false,
    sortable: false,
    filterable: true
  },
  deviceId: {
    isArray: false,
    isNullable: true,
    type: 'string',
    searchable: false,
    sortable: false,
    filterable: true
  },
  status: {
    isArray: false,
    isNullable: false,
    type: 'string',
    searchable: true,
    sortable: true,
    filterable: true
  },
  ...GenericRecordMetadataBase
};
