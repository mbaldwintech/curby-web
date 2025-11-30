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
  NotificationService
} from '@core/services';
import { CurbyCoinTransaction, CurbyCoinTransactionType, Event, Notification } from '@core/types';
import { cn } from '@core/utils';
import { EventCell } from '@features/events/components';
import { ProfileCard, ProfileCell } from '@features/users/components';
import { createClientService } from '@supa/utils/client';
import { format } from 'date-fns';
import { ArrowDown, ArrowUp, Bell, CheckCircle2, Clock, Coins, Database, TrendingDown, TrendingUp } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useRef, useState } from 'react';

export default function CurbyCoinTransactionDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const transactionService = useRef(createClientService(CurbyCoinTransactionService)).current;
  const transactionTypeService = useRef(createClientService(CurbyCoinTransactionTypeService)).current;
  const eventService = useRef(createClientService(EventService)).current;
  const notificationService = useRef(createClientService(NotificationService)).current;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transaction, setTransaction] = useState<CurbyCoinTransaction | null>(null);
  const [transactionType, setTransactionType] = useState<CurbyCoinTransactionType | null>(null);
  const [event, setEvent] = useState<Event | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useAsyncMemo(async () => {
    setLoading(true);
    setError(null);
    try {
      const transaction = await transactionService.getById(id);
      setTransaction(transaction);

      // Fetch transaction type if available
      if (transaction.curbyCoinTransactionTypeId) {
        const type = await transactionTypeService.getByIdOrNull(transaction.curbyCoinTransactionTypeId);
        setTransactionType(type);
      }

      // Fetch event if available
      if (transaction.eventId) {
        const event = await eventService.getByIdOrNull(transaction.eventId);
        setEvent(event);
      }

      // Fetch notifications triggered by this transaction
      const notifications = await notificationService.getAll([
        { column: 'curbyCoinTransactionId', operator: 'eq', value: id }
      ]);
      setNotifications(notifications);
    } catch (error) {
      console.error('Error fetching transaction details:', error);
      setError('Failed to load transaction details.');
    } finally {
      setLoading(false);
    }
  }, [id, transactionService, transactionTypeService, eventService, notificationService]);

  if (!transaction) {
    return <AdminPageContainer title="Transaction Details" loading={loading} error={error} />;
  }

  if (error) {
    return <AdminPageContainer title="Transaction Details" loading={loading} error={error} />;
  }

  const isPositive = transaction.amount > 0;
  const balanceBefore = transaction.balanceAfter - transaction.amount;

  return (
    <AdminPageContainer title="Transaction Details" loading={loading} error={error}>
      {/* Transaction Summary */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'flex items-center justify-center w-10 h-10 rounded-full',
                isPositive ? 'bg-green-100 dark:bg-green-900/20' : 'bg-red-100 dark:bg-red-900/20'
              )}
            >
              <Coins
                className={cn(
                  'h-5 w-5',
                  isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                )}
              />
            </div>
            <div>
              <CardTitle>Transaction Summary</CardTitle>
              <CardDescription>Curby Coin balance change</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Balance Before */}
            <div className="flex flex-col items-center p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">Balance Before</p>
              <div className="flex items-center gap-2">
                <Coins className="h-5 w-5 text-muted-foreground" />
                <span className="text-2xl font-bold">{balanceBefore}</span>
              </div>
            </div>

            {/* Amount Change */}
            <div
              className={cn(
                'flex flex-col items-center p-4 rounded-lg border-2',
                isPositive
                  ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-900'
                  : 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900'
              )}
            >
              <p className="text-sm text-muted-foreground mb-2">Amount</p>
              <div className="flex items-center gap-2">
                {isPositive ? (
                  <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
                ) : (
                  <TrendingDown className="h-6 w-6 text-red-600 dark:text-red-400" />
                )}
                <span
                  className={cn(
                    'text-3xl font-bold',
                    isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  )}
                >
                  {isPositive ? '+' : ''}
                  {transaction.amount}
                </span>
              </div>
            </div>

            {/* Balance After */}
            <div className="flex flex-col items-center p-4 bg-primary/10 rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">Balance After</p>
              <div className="flex items-center gap-2">
                <Coins className="h-5 w-5 text-primary" />
                <span className="text-2xl font-bold text-primary">{transaction.balanceAfter}</span>
              </div>
            </div>
          </div>

          {/* Visual Arrow */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="font-mono">{balanceBefore}</span>
              {isPositive ? (
                <ArrowUp className="h-5 w-5 text-green-600 dark:text-green-400" />
              ) : (
                <ArrowDown className="h-5 w-5 text-red-600 dark:text-red-400" />
              )}
              <span className="font-mono font-bold text-primary">{transaction.balanceAfter}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transaction Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                <Database className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Transaction Information</CardTitle>
                <CardDescription>Core transaction data</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Transaction ID</p>
                  <p className="font-mono text-xs break-all">{transaction.id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">User</p>
                  <ProfileCell userId={transaction.userId} />
                </div>
              </div>

              <Separator />

              <div>
                <p className="text-sm text-muted-foreground mb-2">Description</p>
                <p className="font-medium">{transaction.description}</p>
              </div>

              <Separator />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Amount</p>
                  <Badge variant={isPositive ? 'default' : 'secondary'} className="text-base px-3 py-1">
                    {isPositive ? '+' : ''}
                    {transaction.amount} coins
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Balance After</p>
                  <p className="text-lg font-bold">{transaction.balanceAfter} coins</p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground mb-1">Occurred At</p>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-xs sm:text-sm">{format(new Date(transaction.occurredAt), 'PPpp')}</span>
                  </div>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Created At</p>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-xs sm:text-sm">{format(new Date(transaction.createdAt), 'PPpp')}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Related Cards */}
        <div className="space-y-6">
          <ProfileCard userId={transaction.userId} />
        </div>
      </div>

      {/* Transaction Type Details */}
      {transactionType && (
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/20">
                  <CheckCircle2 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <CardTitle>Transaction Type Configuration</CardTitle>
                  <CardDescription>Rules and settings for this transaction type</CardDescription>
                </div>
              </div>
              <LinkButton
                variant="outline"
                size="sm"
                href={`/admin/curby-coins/transactions/types/${transactionType.id}`}
              >
                View Type
              </LinkButton>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Display Name</p>
                  <p className="font-medium">{transactionType.displayName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Category</p>
                  <Badge variant="outline">{transactionType.category}</Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Status</p>
                  <Badge variant={transactionType.active ? 'default' : 'secondary'}>
                    {transactionType.active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>

              {transactionType.description && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Description</p>
                    <p className="text-sm">{transactionType.description}</p>
                  </div>
                </>
              )}

              <Separator />

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Default Amount</p>
                  <Badge variant={transactionType.amount > 0 ? 'default' : 'secondary'}>
                    {transactionType.amount > 0 ? '+' : ''}
                    {transactionType.amount}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Recipient</p>
                  <p className="text-sm">{transactionType.recipient}</p>
                </div>
                {transactionType.max !== null && transactionType.max !== undefined && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Max Occurrences</p>
                    <p className="text-sm font-medium">{transactionType.max}</p>
                  </div>
                )}
                {transactionType.maxPerDay !== null && transactionType.maxPerDay !== undefined && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Max Per Day</p>
                    <p className="text-sm font-medium">{transactionType.maxPerDay}</p>
                  </div>
                )}
              </div>

              {transactionType.condition && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Conditions</p>
                    <pre className="text-xs bg-muted p-3 rounded-md overflow-auto max-h-32 border">
                      {JSON.stringify(transactionType.condition, null, 2)}
                    </pre>
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
                  <CardDescription>Event that triggered this transaction</CardDescription>
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

      {/* Triggered Notifications */}
      {notifications.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/20">
                <Bell className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <CardTitle>Triggered Notifications ({notifications.length})</CardTitle>
                <CardDescription>Notifications sent as a result of this transaction</CardDescription>
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

                      <Separator />

                      <div className="flex items-center justify-between text-sm">
                        <div>
                          <p className="text-muted-foreground mb-1">Sent At</p>
                          <p>{format(new Date(notification.sentAt), 'PPpp')}</p>
                        </div>
                        <LinkButton
                          variant="link"
                          size="sm"
                          href={`/admin/notifications/${notification.id}`}
                          className="p-0 h-auto"
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
