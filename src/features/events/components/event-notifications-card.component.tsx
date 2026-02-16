import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  LinkButton,
  Separator
} from '@core/components';
import { Notification } from '@core/types';
import { format } from 'date-fns';
import { Bell } from 'lucide-react';

interface EventNotificationsCardProps {
  notifications: Notification[];
}

export function EventNotificationsCard({ notifications }: EventNotificationsCardProps) {
  if (notifications.length === 0) return null;

  return (
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
  );
}
