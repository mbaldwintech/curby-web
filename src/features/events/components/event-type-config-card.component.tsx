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
import { CurbyCoinTransactionType, EventType, NotificationTemplate } from '@core/types';
import { format } from 'date-fns';
import { AlertCircle, Bell, CheckCircle2, Coins, XCircle } from 'lucide-react';
import { Event } from '@core/types';

interface EventTypeConfigCardProps {
  event: Event;
  eventType: EventType | null;
  notificationTemplates: NotificationTemplate[];
  transactionTypes: CurbyCoinTransactionType[];
}

export function EventTypeConfigCard({
  event,
  eventType,
  notificationTemplates,
  transactionTypes
}: EventTypeConfigCardProps) {
  if (eventType) {
    return (
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
    );
  }

  // No Event Type Found
  if (event.eventTypeId) {
    return (
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
    );
  }

  // No Event Type Configured
  return (
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
  );
}
