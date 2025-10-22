// utils/location.ts
import { Coordinates, GeoPoint } from '../types';
import { milesToFeet } from './miles-to-feet.util';

const EARTH_RADIUS_MILES = 3958.8;
const EARTH_RADIUS_FT = EARTH_RADIUS_MILES * 5280;
const EARTH_RADIUS_KM = 6371;
const EARTH_RADIUS_METERS = 6371000;

/** Haversine formula in meters */
export const haversineDistance = (coord1: Coordinates, coord2: Coordinates): number => {
  const R = 6371e3; // meters
  const toRadians = (deg: number) => (deg * Math.PI) / 180;
  const [lon1, lat1] = coord1;
  const [lon2, lat2] = coord2;

  const φ1 = toRadians(lat1);
  const φ2 = toRadians(lat2);
  const Δφ = toRadians(lat2 - lat1);
  const Δλ = toRadians(lon2 - lon1);

  const a = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

export const calculateDistanceInRadians = (coord1: Coordinates, coord2: Coordinates): number => {
  const [lon1, lat1] = coord1;
  const [lon2, lat2] = coord2;

  const toRadians = (deg: number) => deg * (Math.PI / 180);
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const lat1Rad = toRadians(lat1);
  const lat2Rad = toRadians(lat2);

  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.sin(dLon / 2) ** 2;
  return 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

export const calculateDistanceInMiles = (coord1: Coordinates, coord2: Coordinates) =>
  calculateDistanceInRadians(coord1, coord2) * EARTH_RADIUS_MILES;

export const calculateDistanceInFeet = (coord1: Coordinates, coord2: Coordinates) =>
  calculateDistanceInRadians(coord1, coord2) * EARTH_RADIUS_FT;

export const calculateDistanceInKm = (coord1: Coordinates, coord2: Coordinates) =>
  calculateDistanceInRadians(coord1, coord2) * EARTH_RADIUS_KM;

export const calculateDistanceInMeters = (coord1: Coordinates, coord2: Coordinates) =>
  calculateDistanceInRadians(coord1, coord2) * EARTH_RADIUS_METERS;

export const getDistanceDisplayText = (distance: number): string => {
  if (isNaN(distance)) return '0 ft';
  if (distance < 0.2) return `${Math.round(milesToFeet(distance))} ft`;
  return `${Math.round(distance * 10) / 10} mi`;
};

export const coordsToObject = (coordinates: Coordinates): { latitude: number; longitude: number } => {
  if (!coordinates || coordinates.length !== 2) throw new Error('Invalid coordinates format');
  const [longitude, latitude] = coordinates;
  return { latitude, longitude };
};

export const geoJsonPointToWkt = (point?: GeoPoint): string => {
  if (!point || point.type !== 'Point' || !Array.isArray(point.coordinates) || point.coordinates.length !== 2) {
    throw new Error('Invalid GeoJSON Point format');
  }
  const [lon, lat] = point.coordinates;
  return `SRID=4326;POINT(${lon} ${lat})`;
};

/** Get current position in browser */
export const getCurrentGeoJson = async (): Promise<GeoPoint | null> => {
  if (!navigator.geolocation) {
    console.error('Geolocation not supported');
    return null;
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          type: 'Point',
          coordinates: [pos.coords.longitude, pos.coords.latitude]
        });
      },
      (err) => {
        console.error('Error getting location:', err);
        resolve(null);
      },
      { enableHighAccuracy: true }
    );
  });
};
