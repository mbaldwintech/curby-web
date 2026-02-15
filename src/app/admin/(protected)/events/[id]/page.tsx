'use client';

import {
  AdminPageContainer,
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  LinkButton,
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
import { ProfileCard, ProfileCell } from '@features/users/components';
import { createClientService } from '@supa/utils/client';
import { format } from 'date-fns';
import { Activity, AlertCircle, Bell, CheckCircle2, ChevronRight, Clock, Coins, Database, XCircle } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useRef, useState } from 'react';
import { cn, createLogger } from '@core/utils';

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
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
              <Activity className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Event Processing Flow</CardTitle>
              <CardDescription>Status of event processing through the system</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 overflow-x-auto pb-2">
            {/* Event Logged */}
            <div className="flex flex-col items-center gap-2 min-w-fit">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/20 border-2 border-green-500">
                <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium whitespace-nowrap">Event Logged</p>
                <p className="text-xs text-muted-foreground">{format(new Date(event.createdAt), 'PPp')}</p>
              </div>
            </div>

            <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />

            {/* Event Type Check */}
            <div className="flex flex-col items-center gap-2 min-w-fit">
              <div
                className={cn(
                  'flex items-center justify-center w-12 h-12 rounded-full border-2',
                  eventProcessed
                    ? 'bg-green-100 dark:bg-green-900/20 border-green-500'
                    : 'bg-gray-100 dark:bg-gray-900/20 border-gray-500'
                )}
              >
                {eventProcessed ? (
                  <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                ) : (
                  <XCircle className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                )}
              </div>
              <div className="text-center">
                <p className="text-sm font-medium whitespace-nowrap">Event Type</p>
                <p className="text-xs text-muted-foreground">{eventProcessed ? 'Matched' : 'No Type'}</p>
              </div>
            </div>

            {eventProcessed && (
              <>
                <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />

                {/* Notifications */}
                <div className="flex flex-col items-center gap-2 min-w-fit">
                  <div
                    className={cn(
                      'flex items-center justify-center w-12 h-12 rounded-full border-2',
                      notificationsTriggered
                        ? 'bg-blue-100 dark:bg-blue-900/20 border-blue-500'
                        : 'bg-gray-100 dark:bg-gray-900/20 border-gray-500'
                    )}
                  >
                    <Bell className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium whitespace-nowrap">Notifications</p>
                    <p className="text-xs text-muted-foreground">
                      {notificationsTriggered ? `${notifications.length} Sent` : 'None'}
                    </p>
                  </div>
                </div>

                <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />

                {/* Transactions */}
                <div className="flex flex-col items-center gap-2 min-w-fit">
                  <div
                    className={cn(
                      'flex items-center justify-center w-12 h-12 rounded-full border-2',
                      transactionsCreated
                        ? 'bg-amber-100 dark:bg-amber-900/20 border-amber-500'
                        : 'bg-gray-100 dark:bg-gray-900/20 border-gray-500'
                    )}
                  >
                    <Coins className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium whitespace-nowrap">Transactions</p>
                    <p className="text-xs text-muted-foreground">
                      {transactionsCreated ? `${transactions.length} Created` : 'None'}
                    </p>
                  </div>
                </div>

                {transactionsCreated && (
                  <>
                    <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />

                    {/* Transaction Notifications */}
                    <div className="flex flex-col items-center gap-2 min-w-fit">
                      <div
                        className={cn(
                          'flex items-center justify-center w-12 h-12 rounded-full border-2',
                          transactionNotificationsTriggered
                            ? 'bg-purple-100 dark:bg-purple-900/20 border-purple-500'
                            : 'bg-gray-100 dark:bg-gray-900/20 border-gray-500'
                        )}
                      >
                        <Bell className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium whitespace-nowrap">Tx Notifications</p>
                        <p className="text-xs text-muted-foreground">
                          {transactionNotificationsTriggered ? `${transactionNotifications.length} Sent` : 'None'}
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>

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
      {eventType && (
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/20">
                  <CheckCircle2 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <CardTitle>Event Type Configuration</CardTitle>
                  <CardDescription>Rules and conditions for this event type</CardDescription>
                </div>
              </div>
              <LinkButton variant="outline" size="sm" href={`/admin/events/types/${eventType.id}`}>
                View Details
              </LinkButton>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Name</p>
                  <p className="font-medium">{eventType.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Category</p>
                  <Badge variant="outline">{eventType.category}</Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Status</p>
                  <Badge variant={eventType.active ? 'default' : 'secondary'}>
                    {eventType.active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>

              {eventType.description && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Description</p>
                    <p className="text-sm">{eventType.description}</p>
                  </div>
                </>
              )}

              <Separator />

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Valid From</p>
                  <p className="text-sm">{format(new Date(eventType.validFrom), 'PP')}</p>
                </div>
                {eventType.validTo && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Valid To</p>
                    <p className="text-sm">{format(new Date(eventType.validTo), 'PP')}</p>
                  </div>
                )}
                {eventType.max !== null && eventType.max !== undefined && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Max Occurrences</p>
                    <p className="text-sm font-medium">{eventType.max}</p>
                  </div>
                )}
                {eventType.maxPerDay !== null && eventType.maxPerDay !== undefined && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Max Per Day</p>
                    <p className="text-sm font-medium">{eventType.maxPerDay}</p>
                  </div>
                )}
              </div>

              {eventType.condition && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Conditions</p>
                    <pre className="text-xs bg-muted p-3 rounded-md overflow-auto max-h-32 border">
                      {JSON.stringify(eventType.condition, null, 2)}
                    </pre>
                  </div>
                </>
              )}

              {/* Show configured templates and transaction types */}
              {(notificationTemplates.length > 0 || transactionTypes.length > 0) && (
                <>
                  <Separator />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {notificationTemplates.length > 0 && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Notification Templates</p>
                        <div className="space-y-2">
                          {notificationTemplates.map((template) => (
                            <LinkButton
                              key={template.id}
                              variant="outline"
                              size="sm"
                              href={`/admin/notifications/templates/${template.id}`}
                              className="w-full justify-start"
                            >
                              <Bell className="h-4 w-4 mr-2" />
                              {template.key} (v{template.version})
                            </LinkButton>
                          ))}
                        </div>
                      </div>
                    )}
                    {transactionTypes.length > 0 && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Transaction Types</p>
                        <div className="space-y-2">
                          {transactionTypes.map((type) => (
                            <LinkButton
                              key={type.id}
                              variant="outline"
                              size="sm"
                              href={`/admin/curby-coins/transactions/types/${type.id}`}
                              className="w-full justify-start"
                            >
                              <Coins className="h-4 w-4 mr-2" />
                              {type.displayName} ({type.amount > 0 ? '+' : ''}
                              {type.amount})
                            </LinkButton>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Event Type Found */}
      {!eventType && event.eventTypeId && (
        <Card className="mb-6 border-amber-200 dark:border-amber-900">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/20">
                <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <CardTitle className="text-amber-900 dark:text-amber-100">Event Type Not Found</CardTitle>
                <CardDescription>The event type may have been deleted</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              Event Type ID: <span className="font-mono">{event.eventTypeId}</span>
            </p>
          </CardContent>
        </Card>
      )}

      {/* No Event Type Configured */}
      {!eventType && !event.eventTypeId && (
        <Card className="mb-6 border-gray-200 dark:border-gray-800">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-900/20">
                <XCircle className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </div>
              <div>
                <CardTitle>No Event Type Configured</CardTitle>
                <CardDescription>This event was logged but no event type was found for the key</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              The event key <Badge variant="secondary">{event.eventKey}</Badge> does not have a corresponding event type
              configured in the system. The event was recorded for tracking purposes only.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Triggered Notifications */}
      {notifications.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/20">
                <Bell className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <CardTitle>Triggered Notifications ({notifications.length})</CardTitle>
                <CardDescription>Notifications sent as a result of this event</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {notifications.map((notification) => (
                <Card key={notification.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-base">{notification.title}</CardTitle>
                        <CardDescription>
                          {notification.category} • {notification.deliveryChannel}
                          {notification.delivered ? ' • Delivered' : ' • Pending'}
                        </CardDescription>
                      </div>
                      <Badge variant={notification.read ? 'secondary' : 'default'}>
                        {notification.read ? 'Read' : 'Unread'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Body</p>
                        <p className="text-sm">{notification.body}</p>
                      </div>

                      {notification.targetRoute && (
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Target Route</p>
                          <p className="text-sm font-mono">{notification.targetRoute}</p>
                        </div>
                      )}

                      <Separator />

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground mb-1">Sent At</p>
                          <p>{format(new Date(notification.sentAt), 'PPpp')}</p>
                        </div>
                        {notification.readAt && (
                          <div>
                            <p className="text-muted-foreground mb-1">Read At</p>
                            <p>{format(new Date(notification.readAt), 'PPpp')}</p>
                          </div>
                        )}
                      </div>

                      <Separator />

                      <div className="flex items-center justify-between">
                        {notification.notificationTemplateId && (
                          <LinkButton
                            variant="link"
                            size="sm"
                            href={`/admin/notifications/templates/${notification.notificationTemplateId}`}
                            className="p-0 h-auto"
                          >
                            View Template
                          </LinkButton>
                        )}
                        <LinkButton variant="outline" size="sm" href={`/admin/notifications/${notification.id}`}>
                          View Details
                        </LinkButton>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Created Transactions */}
      {transactions.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/20">
                <Coins className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <CardTitle>Curby Coin Transactions ({transactions.length})</CardTitle>
                <CardDescription>Coin transactions created from this event</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {transactions.map((transaction) => (
                <Card key={transaction.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-base">{transaction.description}</CardTitle>
                        <CardDescription>{format(new Date(transaction.occurredAt), 'PPpp')}</CardDescription>
                      </div>
                      <Badge variant={transaction.amount > 0 ? 'default' : 'secondary'} className="text-base px-3">
                        {transaction.amount > 0 ? '+' : ''}
                        {transaction.amount}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">User</p>
                          <ProfileCell userId={transaction.userId} />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Balance After</p>
                          <p className="text-sm font-medium">{transaction.balanceAfter} coins</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        {transaction.curbyCoinTransactionTypeId && (
                          <LinkButton
                            variant="link"
                            size="sm"
                            href={`/admin/curby-coins/transactions/types/${transaction.curbyCoinTransactionTypeId}`}
                            className="p-0 h-auto"
                          >
                            View Transaction Type
                          </LinkButton>
                        )}
                        <LinkButton
                          variant="outline"
                          size="sm"
                          href={`/admin/curby-coins/transactions/${transaction.id}`}
                        >
                          View Details
                        </LinkButton>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </AdminPageContainer>
  );
}
