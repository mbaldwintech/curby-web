import { GenericRecordMetadata } from '@supa/types';
import { GeoPoint } from './geo-point.type';
import { Item, ItemMetadata } from './item.type';
import { Media } from './media.type';

export interface ExtendedMedia extends Media {
  thumbnail?: Media;
}

export interface ExtendedItem extends Item {
  // image data from media table
  media: ExtendedMedia[];

  // parsed location data
  location?: GeoPoint;

  // additional computed fields
  reportedCount: number;
  reporters?: string[];
  distanceKm?: number;

  // scoring fields
  feedScore?: number;
  freshness?: number;
  reputation?: number;
  reportPenalty?: number;

  // moderation fields
  removalReason?: string | null;
  appealable?: boolean;
  appealDeadline?: Date | null;
  reviewId?: string | null;
}

export const ExtendedItemMetadata: GenericRecordMetadata<ExtendedItem> = {
  media: {
    isArray: true,
    isNullable: false,
    type: 'object',
    searchable: false,
    sortable: false,
    filterable: false
  },
  location: {
    isArray: false,
    isNullable: true,
    type: 'geopoint',
    searchable: false,
    sortable: false,
    filterable: true
  },
  reportedCount: {
    isArray: false,
    isNullable: false,
    type: 'number',
    searchable: false,
    sortable: true,
    filterable: true
  },
  reporters: {
    isArray: true,
    isNullable: true,
    type: 'string',
    searchable: false,
    sortable: false,
    filterable: true
  },
  distanceKm: {
    isArray: false,
    isNullable: true,
    type: 'number',
    searchable: false,
    sortable: true,
    filterable: true
  },
  feedScore: {
    isArray: false,
    isNullable: true,
    type: 'number',
    searchable: false,
    sortable: true,
    filterable: true
  },
  freshness: {
    isArray: false,
    isNullable: true,
    type: 'number',
    searchable: false,
    sortable: true,
    filterable: true
  },
  reputation: {
    isArray: false,
    isNullable: true,
    type: 'number',
    searchable: false,
    sortable: true,
    filterable: true
  },
  reportPenalty: {
    isArray: false,
    isNullable: true,
    type: 'number',
    searchable: false,
    sortable: true,
    filterable: true
  },
  removalReason: {
    isArray: false,
    isNullable: true,
    type: 'string',
    searchable: false,
    sortable: false,
    filterable: true
  },
  appealable: {
    isArray: false,
    isNullable: true,
    type: 'boolean',
    searchable: false,
    sortable: true,
    filterable: true
  },
  appealDeadline: {
    isArray: false,
    isNullable: true,
    type: 'timestamp',
    searchable: false,
    sortable: true,
    filterable: true
  },
  reviewId: {
    isArray: false,
    isNullable: true,
    type: 'string',
    searchable: false,
    sortable: false,
    filterable: true
  },
  ...ItemMetadata
};
