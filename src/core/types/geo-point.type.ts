import { Coordinates } from './coordinates.type';

/**
 * Represents a geographic point using longitude and latitude coordinates.
 *
 * @interface GeoPoint
 * @property {'Point'} type - The type of the geometry object, always 'Point'.
 * @property {[number, number]} coordinates - The coordinates of the point in [longitude, latitude] order.
 */
export interface GeoPoint {
  type: 'Point';
  coordinates: Coordinates;
}
