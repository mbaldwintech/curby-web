import { GeoPoint } from './geo-point.type';
import { Item } from './item.type';
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
