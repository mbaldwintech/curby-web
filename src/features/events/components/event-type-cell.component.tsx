'use client';

import { LinkButton } from '@core/components';
import { EventTypeService } from '@core/services';
import { EventType } from '@core/types';
import { createClientService } from '@supa/utils/client';
import { useEffect, useRef, useState } from 'react';

export const EventTypeCell = ({ eventTypeId }: { eventTypeId?: string | null }) => {
  const eventTypeService = useRef(createClientService(EventTypeService)).current;
  const [eventType, setEventType] = useState<EventType | null>(null);

  useEffect(() => {
    if (eventTypeId) {
      eventTypeService
        .getByIdOrNull(eventTypeId)
        .then((eventType) => {
          if (eventType !== null) {
            setEventType(eventType);
          }
        })
        .catch(() => {
          setEventType(null);
        });
    } else {
      setEventType(null);
    }
  }, [eventTypeId, eventTypeService]);

  if (!eventTypeId || !eventType) {
    return null;
  }

  return (
    <LinkButton
      variant="link"
      href={`/admin/events/types/${eventType.id}`}
      onClick={(e) => e.stopPropagation()}
      className="p-0"
    >
      {eventType.name}
    </LinkButton>
  );
};
