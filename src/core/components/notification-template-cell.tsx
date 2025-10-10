'use client';

import { NotificationTemplateService } from '@core/services';
import { NotificationTemplate } from '@core/types';
import { createClientService } from '@supa/utils/client';
import { useEffect, useRef, useState } from 'react';
import { LinkButton } from './link-button';

export const NotificationTemplateCell = ({ notificationTemplateId }: { notificationTemplateId?: string | null }) => {
  const notificationTemplateService = useRef(createClientService(NotificationTemplateService)).current;
  const [notificationTemplate, setNotificationTemplate] = useState<NotificationTemplate | null>(null);

  useEffect(() => {
    if (notificationTemplateId) {
      notificationTemplateService
        .getByIdOrNull(notificationTemplateId)
        .then((notificationTemplate) => {
          if (notificationTemplate !== null) {
            setNotificationTemplate(notificationTemplate);
          }
        })
        .catch(() => {
          setNotificationTemplate(null);
        });
    } else {
      setNotificationTemplate(null);
    }
  }, [notificationTemplateId, notificationTemplateService]);

  if (!notificationTemplateId || !notificationTemplate) {
    return null;
  }

  return (
    <LinkButton
      variant="link"
      href={`/admin/notifications/templates/${notificationTemplate.id}`}
      onClick={(e) => e.stopPropagation()}
      className="p-0"
    >
      {notificationTemplate.key}
    </LinkButton>
  );
};
