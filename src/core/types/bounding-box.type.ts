export interface BoundingBox {
  centerLon: number;
  centerLat: number;
  minLon: number;
  minLat: number;
  maxLon: number;
  maxLat: number;
  gridSizeKm?: number;
}
