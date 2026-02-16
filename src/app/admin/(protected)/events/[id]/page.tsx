'use client';

import {
  AdminPageContainer,
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Separator
} from '@core/components';
import { useAsyncMemo } from '@core/hooks';
import {
  CurbyCoinTransactionService,
  CurbyCoinTransactionTypeService,
  EventService,
  EventTypeService,
  NotificationService,
  NotificationTemplateService
} from '@core/services';
import {
  CurbyCoinTransaction,
  CurbyCoinTransactionType,
  Event,
  EventType,
  Notification,
  NotificationTemplate
} from '@core/types';
import { DeviceCard, DeviceCell } from '@features/devices/components';
import {
  EventNotificationsCard,
  EventProcessingFlowCard,
  EventTransactionsCard,
  EventTypeConfigCard
} from '@features/events/components';
import { ProfileCard, ProfileCell } from '@features/users/components';
import { createClientService } from '@supa/utils/client';
import { format } from 'date-fns';
import { Clock, Database } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useRef, useState } from 'react';
import { createLogger } from '@core/utils';

const logger = createLogger('EventDetailPage');

export default function EventDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const eventService = useRef(createClientService(EventService)).current;
  const eventTypeService = useRef(createClientService(EventTypeService)).current;
  const notificationService = useRef(createClientService(NotificationService)).current;
  const notificationTemplateService = useRef(createClientService(NotificationTemplateService)).current;
  const curbyCoinTransactionService = useRef(createClientService(CurbyCoinTransactionService)).current;
  const curbyCoinTransactionTypeService = useRef(createClientService(CurbyCoinTransactionTypeService)).current;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [event, setEvent] = useState<Event | null>(null);
  const [eventType, setEventType] = useState<EventType | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationTemplates, setNotificationTemplates] = useState<NotificationTemplate[]>([]);
  const [transactions, setTransactions] = useState<CurbyCoinTransaction[]>([]);
  const [transactionTypes, setTransactionTypes] = useState<CurbyCoinTransactionType[]>([]);
  const [transactionNotifications, setTransactionNotifications] = useState<Notification[]>([]);

  useAsyncMemo(async () => {
    setLoading(true);
    setError(null);
    try {
      const event = await eventService.getById(id);
      setEvent(event);

      // Fetch event type if available
      if (event.eventTypeId) {
        const eventType = await eventTypeService.getByIdOrNull(event.eventTypeId);
        setEventType(eventType);

        // Fetch notification templates for this event type
        if (eventType) {
          const templates = await notificationTemplateService.getAll([
            { column: 'eventTypeId', operator: 'eq', value: eventType.id }
          ]);
          setNotificationTemplates(templates);
        }

        // Fetch transaction types for this event type
        if (eventType) {
          const types = await curbyCoinTransactionTypeService.getAll([
            { column: 'eventTypeId', operator: 'eq', value: eventType.id }
          ]);
          setTransactionTypes(types);
        }
      }

      // Fetch notifications triggered by this event
      const notifications = await notificationService.getAll([{ column: 'eventId', operator: 'eq', value: id }]);
      setNotifications(notifications);

      // Fetch transactions created by this event
      const transactions = await curbyCoinTransactionService.getAll([{ column: 'eventId', operator: 'eq', value: id }]);
      setTransactions(transactions);

      // Fetch notifications triggered by those transactions
      if (transactions.length > 0) {
        const transactionIds = transactions.map((t) => t.id);
        const allTransactionNotifications: Notification[] = [];

        // Fetch notifications for each transaction
        for (const transactionId of transactionIds) {
          const txNotifications = await notificationService.getAll([
            { column: 'curbyCoinTransactionId', operator: 'eq', value: transactionId }
          ]);
          allTransactionNotifications.push(...txNotifications);
        }

        setTransactionNotifications(allTransactionNotifications);
      }
    } catch (error) {
      logger.error('Error fetching event details:', error);
      setError('Failed to load event details.');
    } finally {
      setLoading(false);
    }
  }, [
    id,
    eventService,
    eventTypeService,
    notificationService,
    notificationTemplateService,
    curbyCoinTransactionService,
    curbyCoinTransactionTypeService
  ]);

  if (!event) {
    return <AdminPageContainer title="Event Details" loading={loading} error={error} />;
  }

  if (error) {
    return <AdminPageContainer title="Event Details" loading={loading} error={error} />;
  }

  const eventProcessed = !!eventType;
  const notificationsTriggered = notifications.length > 0;
  const transactionsCreated = transactions.length > 0;
  const transactionNotificationsTriggered = transactionNotifications.length > 0;

  return (
    <AdminPageContainer title="Event Details" loading={loading} error={error}>
      {/* Processing Flow Overview */}
      <EventProcessingFlowCard
        event={event}
        eventProcessed={eventProcessed}
        notificationsTriggered={notificationsTriggered}
        notifications={notifications}
        transactionsCreated={transactionsCreated}
        transactions={transactions}
        transactionNotificationsTriggered={transactionNotificationsTriggered}
        transactionNotifications={transactionNotifications}
      />

      {/* Event Details & Context */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Event Information */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                <Database className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Event Information</CardTitle>
                <CardDescription>Core event data and metadata</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Event ID</p>
                  <p className="font-mono text-xs break-all">{event.id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Event Key</p>
                  <Badge variant="secondary">{event.eventKey}</Badge>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {event.userId && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">User</p>
                    <ProfileCell userId={event.userId} />
                  </div>
                )}
                {event.deviceId && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Device</p>
                    <DeviceCell deviceId={event.deviceId} />
                  </div>
                )}
              </div>

              {event.metadata && Object.keys(event.metadata).length > 0 && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Event Metadata</p>
                    <pre className="text-xs bg-muted p-3 rounded-md overflow-auto max-h-64 border">
                      {JSON.stringify(event.metadata, null, 2)}
                    </pre>
                  </div>
                </>
              )}

              <Separator />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground mb-1">Created At</p>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-xs sm:text-sm">{format(new Date(event.createdAt), 'PPpp')}</span>
                  </div>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Updated At</p>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-xs sm:text-sm">{format(new Date(event.updatedAt), 'PPpp')}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Related Cards */}
        <div className="space-y-6">
          {event.userId && <ProfileCard userId={event.userId} />}
          {event.deviceId && <DeviceCard deviceId={event.deviceId} />}
        </div>
      </div>

      {/* Event Type Details */}
      <EventTypeConfigCard
        event={event}
        eventType={eventType}
        notificationTemplates={notificationTemplates}
        transactionTypes={transactionTypes}
      />

      {/* Triggered Notifications */}
      <EventNotificationsCard notifications={notifications} />

      {/* Created Transactions */}
      <EventTransactionsCard transactions={transactions} />
    </AdminPageContainer>
  );
}
