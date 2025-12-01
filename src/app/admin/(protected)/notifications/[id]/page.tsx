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
import { EventService, NotificationService, NotificationTemplateService } from '@core/services';
import { Event, Notification, NotificationTemplate } from '@core/types';
import { cn } from '@core/utils';
import { DeviceCard, DeviceCell } from '@features/devices/components';
import { EventCell } from '@features/events/components';
import { ProfileCard, ProfileCell } from '@features/users/components';
import { createClientService } from '@supa/utils/client';
import { format } from 'date-fns';
import { Bell, Check, CheckCircle2, Clock, Database, Eye, Mail, Send, Smartphone, X } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useRef, useState } from 'react';

export default function NotificationDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const notificationService = useRef(createClientService(NotificationService)).current;
  const notificationTemplateService = useRef(createClientService(NotificationTemplateService)).current;
  const eventService = useRef(createClientService(EventService)).current;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notification | null>(null);
  const [template, setTemplate] = useState<NotificationTemplate | null>(null);
  const [event, setEvent] = useState<Event | null>(null);

  useAsyncMemo(async () => {
    setLoading(true);
    setError(null);
    try {
      const notification = await notificationService.getById(id);
      setNotification(notification);

      // Fetch template if available
      if (notification.notificationTemplateId) {
        const template = await notificationTemplateService.getByIdOrNull(notification.notificationTemplateId);
        setTemplate(template);
      }

      // Fetch event if available
      if (notification.eventId) {
        const event = await eventService.getByIdOrNull(notification.eventId);
        setEvent(event);
      }
    } catch (error) {
      console.error('Error fetching notification details:', error);
      setError('Failed to load notification details.');
    } finally {
      setLoading(false);
    }
  }, [id, notificationService, notificationTemplateService, eventService]);

  if (!notification) {
    return <AdminPageContainer title="Notification Details" loading={loading} error={error} />;
  }

  if (error) {
    return <AdminPageContainer title="Notification Details" loading={loading} error={error} />;
  }

  const getChannelIcon = (channel: string) => {
    switch (channel.toLowerCase()) {
      case 'push':
        return <Smartphone className="h-4 w-4" />;
      case 'email':
        return <Mail className="h-4 w-4" />;
      case 'in-app':
        return <Bell className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  return (
    <AdminPageContainer title="Notification Details" loading={loading} error={error}>
      {/* Status Overview */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/20">
              <Bell className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <CardTitle>Notification Status</CardTitle>
              <CardDescription>Delivery and engagement tracking</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 overflow-x-auto pb-2">
            {/* Created */}
            <div className="flex flex-col items-center gap-2 min-w-fit">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/20 border-2 border-green-500">
                <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium whitespace-nowrap">Created</p>
                <p className="text-xs text-muted-foreground">{format(new Date(notification.createdAt), 'PPp')}</p>
              </div>
            </div>

            <div className="h-0.5 w-8 bg-border flex-shrink-0" />

            {/* Delivered */}
            <div className="flex flex-col items-center gap-2 min-w-fit">
              <div
                className={cn(
                  'flex items-center justify-center w-12 h-12 rounded-full border-2',
                  notification.delivered
                    ? 'bg-green-100 dark:bg-green-900/20 border-green-500'
                    : 'bg-gray-100 dark:bg-gray-900/20 border-gray-500'
                )}
              >
                {notification.delivered ? (
                  <Send className="h-6 w-6 text-green-600 dark:text-green-400" />
                ) : (
                  <Clock className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                )}
              </div>
              <div className="text-center">
                <p className="text-sm font-medium whitespace-nowrap">Delivered</p>
                <p className="text-xs text-muted-foreground">
                  {notification.delivered ? format(new Date(notification.sentAt), 'PPp') : 'Pending'}
                </p>
              </div>
            </div>

            <div className="h-0.5 w-8 bg-border flex-shrink-0" />

            {/* Read */}
            <div className="flex flex-col items-center gap-2 min-w-fit">
              <div
                className={cn(
                  'flex items-center justify-center w-12 h-12 rounded-full border-2',
                  notification.read
                    ? 'bg-blue-100 dark:bg-blue-900/20 border-blue-500'
                    : 'bg-gray-100 dark:bg-gray-900/20 border-gray-500'
                )}
              >
                {notification.read ? (
                  <Eye className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                ) : (
                  <X className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                )}
              </div>
              <div className="text-center">
                <p className="text-sm font-medium whitespace-nowrap">Read</p>
                <p className="text-xs text-muted-foreground">
                  {notification.read && notification.readAt ? format(new Date(notification.readAt), 'PPp') : 'Unread'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                <Database className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Notification Content</CardTitle>
                <CardDescription>Message details and metadata</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Notification ID</p>
                  <p className="font-mono text-xs break-all">{notification.id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Category</p>
                  <Badge variant="secondary">{notification.category}</Badge>
                </div>
              </div>

              <Separator />

              <div>
                <p className="text-sm text-muted-foreground mb-1">Delivery Channel</p>
                <div className="flex items-center gap-2">
                  {getChannelIcon(notification.deliveryChannel)}
                  <Badge variant="outline">{notification.deliveryChannel}</Badge>
                </div>
              </div>

              <Separator />

              <div>
                <p className="text-sm text-muted-foreground mb-2">Title</p>
                <p className="font-semibold">{notification.title}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">Body</p>
                <p className="text-sm">{notification.body}</p>
              </div>

              {notification.targetRoute && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Target Route</p>
                    <p className="text-sm font-mono bg-muted px-2 py-1 rounded">{notification.targetRoute}</p>
                  </div>
                </>
              )}

              {notification.iconProps && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Icon Configuration</p>
                    <pre className="text-xs bg-muted p-3 rounded-md overflow-auto max-h-32 border">
                      {JSON.stringify(notification.iconProps, null, 2)}
                    </pre>
                  </div>
                </>
              )}

              {notification.data && Object.keys(notification.data).length > 0 && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Additional Data</p>
                    <pre className="text-xs bg-muted p-3 rounded-md overflow-auto max-h-64 border">
                      {JSON.stringify(notification.data, null, 2)}
                    </pre>
                  </div>
                </>
              )}

              <Separator />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Status</p>
                  <div className="flex items-center gap-2">
                    <Badge variant={notification.delivered ? 'default' : 'secondary'}>
                      {notification.delivered ? 'Delivered' : 'Pending'}
                    </Badge>
                    <Badge variant={notification.read ? 'default' : 'outline'}>
                      {notification.read ? 'Read' : 'Unread'}
                    </Badge>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground mb-1">Created At</p>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-xs sm:text-sm">{format(new Date(notification.createdAt), 'PPpp')}</span>
                  </div>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Sent At</p>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-xs sm:text-sm">{format(new Date(notification.sentAt), 'PPpp')}</span>
                  </div>
                </div>
              </div>

              {notification.readAt && (
                <div className="text-sm">
                  <p className="text-muted-foreground mb-1">Read At</p>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-xs sm:text-sm">{format(new Date(notification.readAt), 'PPpp')}</span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Related Cards */}
        <div className="space-y-6">
          {notification.userId && <ProfileCard userId={notification.userId} />}
          {notification.deviceId && <DeviceCard deviceId={notification.deviceId} />}
        </div>
      </div>

      {/* Recipient Information */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Recipient Information</CardTitle>
          <CardDescription>User and device details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {notification.userId ? (
              <div>
                <p className="text-sm text-muted-foreground mb-1">User</p>
                <ProfileCell userId={notification.userId} />
              </div>
            ) : (
              <div>
                <p className="text-sm text-muted-foreground mb-1">User</p>
                <p className="text-sm">Anonymous User</p>
              </div>
            )}
            {notification.deviceId ? (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Device</p>
                <DeviceCell deviceId={notification.deviceId} />
              </div>
            ) : (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Device</p>
                <p className="text-sm">No device specified</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Template Details */}
      {template && (
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/20">
                  <Check className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <CardTitle>Notification Template</CardTitle>
                  <CardDescription>Template configuration used to generate this notification</CardDescription>
                </div>
              </div>
              <LinkButton variant="outline" size="sm" href={`/admin/notifications/templates/${template.id}`}>
                View Template
              </LinkButton>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Template Key</p>
                  <Badge variant="secondary">{template.key}</Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Version</p>
                  <Badge variant="outline">v{template.version}</Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Status</p>
                  <Badge variant={template.active ? 'default' : 'secondary'}>
                    {template.active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Recipient</p>
                  <p className="text-sm">{template.recipient}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Category</p>
                  <p className="text-sm">{template.category}</p>
                </div>
              </div>

              {(template.titleTemplate || template.bodyTemplate) && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    {template.titleTemplate && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Title Template</p>
                        <p className="text-sm font-mono bg-muted px-2 py-1 rounded">{template.titleTemplate}</p>
                      </div>
                    )}
                    {template.bodyTemplate && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Body Template</p>
                        <p className="text-sm font-mono bg-muted px-2 py-1 rounded">{template.bodyTemplate}</p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Trigger Event */}
      {event && (
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/20">
                  <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <CardTitle>Trigger Event</CardTitle>
                  <CardDescription>Event that triggered this notification</CardDescription>
                </div>
              </div>
              <LinkButton variant="outline" size="sm" href={`/admin/events/${event.id}`}>
                View Event
              </LinkButton>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Event Key</p>
                  <Badge variant="secondary">{event.eventKey}</Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Event ID</p>
                  <EventCell eventId={event.id} />
                </div>
              </div>

              <Separator />

              <div className="text-sm">
                <p className="text-muted-foreground mb-1">Event Created At</p>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span>{format(new Date(event.createdAt), 'PPpp')}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Transaction Link */}
      {notification.curbyCoinTransactionId && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Related Transaction</CardTitle>
                <CardDescription>Curby Coin transaction that triggered this notification</CardDescription>
              </div>
              <LinkButton
                variant="outline"
                size="sm"
                href={`/admin/curby-coins/transactions/${notification.curbyCoinTransactionId}`}
              >
                View Transaction
              </LinkButton>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Transaction ID: <span className="font-mono text-foreground">{notification.curbyCoinTransactionId}</span>
            </p>
          </CardContent>
        </Card>
      )}
    </AdminPageContainer>
  );
}
