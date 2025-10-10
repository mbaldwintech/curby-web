export interface DeviceInfo {
  deviceId?: string; // unique identifier for the device
  type?: string | null; // optional (e.g. "phone", "tablet", "emulator"...)
  deviceName?: string | null; // optional (e.g., "iPhone 14", "Pixel 6")
  platform?: string | null; // optional (e.g. "iOS", "Android")
  appVersion?: string | null; // optional (e.g. "1.0.0")
  osVersion?: string | null; // optional (e.g. "14.4", "11")
}
