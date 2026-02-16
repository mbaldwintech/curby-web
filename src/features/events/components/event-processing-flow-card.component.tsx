import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@core/components';
import { CurbyCoinTransaction, Event, Notification } from '@core/types';
import { cn } from '@core/utils';
import { format } from 'date-fns';
import { Activity, Bell, CheckCircle2, ChevronRight, Coins, XCircle } from 'lucide-react';

interface EventProcessingFlowCardProps {
  event: Event;
  eventProcessed: boolean;
  notificationsTriggered: boolean;
  notifications: Notification[];
  transactionsCreated: boolean;
  transactions: CurbyCoinTransaction[];
  transactionNotificationsTriggered: boolean;
  transactionNotifications: Notification[];
}

export function EventProcessingFlowCard({
  event,
  eventProcessed,
  notificationsTriggered,
  notifications,
  transactionsCreated,
  transactions,
  transactionNotificationsTriggered,
  transactionNotifications
}: EventProcessingFlowCardProps) {
  return (
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
  );
}
