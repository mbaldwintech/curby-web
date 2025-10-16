import { IconProps } from '@common/components';
import { DeviceInfo } from '../types';

const DEVICE_ID_KEY = 'device_id';

/** Generate a new UUID */
const createNewDeviceId = async (): Promise<string> => {
  try {
    return crypto.randomUUID();
  } catch (error) {
    console.error('Error generating new device ID:', error);
    throw error;
  }
};

/** Get or create device ID stored in localStorage */
export const getDeviceId = async (): Promise<string | undefined> => {
  if (typeof window === 'undefined') {
    // SERVER-SIDE: return undefined
    return undefined;
  }

  // CLIENT-SIDE: read from localStorage
  try {
    // Check localStorage first
    let storedId = localStorage.getItem(DEVICE_ID_KEY);

    if (!storedId) {
      storedId = await createNewDeviceId();
      localStorage.setItem(DEVICE_ID_KEY, storedId);
    }

    // Set cookie so server can read it
    document.cookie = `${DEVICE_ID_KEY}=${storedId}; path=/; max-age=${60 * 60 * 24 * 365}`; // 1 year

    return storedId;
  } catch (error) {
    console.error('Error accessing localStorage for device ID:', error);
    return undefined;
  }
};

/** Simple device info detection for web */
export const getDeviceInfo = async (): Promise<DeviceInfo> => {
  const deviceId = await getDeviceId();
  const deviceType = getDeviceType();
  return {
    deviceId,
    type: deviceType,
    deviceName: navigator?.userAgent?.slice(0, 50) ?? 'unknown',
    platform: navigator?.platform ?? 'unknown',
    appVersion: process.env.NEXT_PUBLIC_APP_VERSION ?? 'unknown',
    osVersion: 'unknown'
  };
};

/** Determine device type based on user agent */
export const getDeviceType = (): string => {
  if (typeof navigator === 'undefined') return 'unknown';
  const ua = navigator.userAgent.toLowerCase();
  if (/mobile/.test(ua)) return 'phone';
  if (/tablet/.test(ua) || /ipad/.test(ua)) return 'tablet';
  if (/tv/.test(ua)) return 'tv';
  return 'desktop';
};

/** Get app version (from env variable) */
export const getAppVersion = (): string => process.env.NEXT_PUBLIC_APP_VERSION ?? 'unknown';

/** Map device type to icon */
export const getIconProps = (type: string | null | undefined): IconProps => {
  switch (type) {
    case 'phone':
      return { lib: 'Ionicons', name: 'phone-portrait-outline' };
    case 'tablet':
      return { lib: 'Ionicons', name: 'tablet-portrait-outline' };
    case 'desktop':
      return { lib: 'Ionicons', name: 'desktop-outline' };
    case 'tv':
      return { lib: 'Ionicons', name: 'tv-outline' };
    default:
      return { lib: 'Ionicons', name: 'phone-portrait-outline' };
  }
};
