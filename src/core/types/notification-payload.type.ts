export interface NotificationPayload {
  itemId?: string;
  searchId?: string;
  badgeId?: string;
  userId?: string;
  deviceId?: string;
  [key: string]: unknown;
}
