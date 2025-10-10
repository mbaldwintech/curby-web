'use client';

import { EventService } from '@core/services';
import { Event } from '@core/types';
import { createClientService } from '@supa/utils/client';
import { useEffect, useRef, useState } from 'react';
import { LinkButton } from './link-button';

export const EventCell = ({ eventId }: { eventId?: string | null }) => {
  const eventService = useRef(createClientService(EventService)).current;
  const [event, setEvent] = useState<Event | null>(null);

  useEffect(() => {
    if (eventId) {
      eventService
        .getByIdOrNull(eventId)
        .then((event) => {
          if (event !== null) {
            setEvent(event);
          }
        })
        .catch(() => {
          setEvent(null);
        });
    } else {
      setEvent(null);
    }
  }, [eventId, eventService]);

  if (!eventId || !event) {
    return null;
  }

  return (
    <LinkButton
      variant="link"
      href={`/admin/events/logs/${event.id}`}
      onClick={(e) => e.stopPropagation()}
      className="p-0"
    >
      {event.eventKey}
    </LinkButton>
  );
};
