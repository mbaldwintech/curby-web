'use client';

import { NotificationService } from '@core/services';
import { Notification } from '@core/types';
import { createClientService } from '@supa/utils/client';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef } from 'react';

interface UseNotificationOptions {
  pollInterval?: number; // milliseconds
}

export const useNotifications = ({ pollInterval = 15000 }: UseNotificationOptions = {}) => {
  const notificationService = useRef(createClientService(NotificationService)).current;
  const router = useRouter();
  const seenNotifications = useRef<Set<string>>(new Set());

  const handleNotification = useCallback(
    async (notification: Notification) => {
      if (seenNotifications.current.has(notification.id)) return;
      seenNotifications.current.add(notification.id);

      try {
        await notificationService.markAsRead(notification.id);

        if (notification.targetRoute) {
          const params = new URLSearchParams(notification.data as Record<string, string>);
          router.push(`${notification.targetRoute}?${params.toString()}`);
        } else {
          console.warn(`No targetRoute defined for notification id: ${notification.id}`);
          router.push('/profile/notifications');
        }
      } catch (error) {
        console.error('Error handling notification:', error);
      }
    },
    [router, notificationService]
  );

  useEffect(() => {
    let isMounted = true;

    const pollNotifications = async () => {
      try {
        const unreadNotifications = await notificationService.getMyUnreadNotifications();
        if (!isMounted) return;

        for (const notification of unreadNotifications) {
          await handleNotification(notification);
        }
      } catch (error) {
        console.error('Error fetching unread notifications:', error);
      }
    };

    // Initial poll
    pollNotifications();

    // Polling interval
    const intervalId = setInterval(pollNotifications, pollInterval);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [pollInterval, router, handleNotification, notificationService]);

  return null; // This hook does not render anything
};
