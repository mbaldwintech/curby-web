import { Badge, Button, Card, LoadingSpinner, Popover, PopoverContent, PopoverTrigger } from '@core/components';
import {
  CardTitle,
  Separator,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from '@core/components/base';
import { BroadcastDeliveryStatus } from '@core/enumerations';
import { BroadcastDeliveryService } from '@core/services';
import { BroadcastDelivery } from '@core/types';
import { Filters } from '@supa/services';
import { createClientService } from '@supa/utils/client';
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  subMonths
} from 'date-fns';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { cn, createLogger } from '@core/utils';

const logger = createLogger('BroadcastDeliveryCalendar');

const getStatusColor = (status: BroadcastDeliveryStatus) => {
  switch (status) {
    case BroadcastDeliveryStatus.Pending:
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800';
    case BroadcastDeliveryStatus.Processing:
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300 border-blue-200 dark:border-blue-800';
    case BroadcastDeliveryStatus.Sent:
      return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300 border-green-200 dark:border-green-800';
    case BroadcastDeliveryStatus.Failed:
      return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300 border-red-200 dark:border-red-800';
    case BroadcastDeliveryStatus.Canceled:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300 border-gray-200 dark:border-gray-800';
    case BroadcastDeliveryStatus.Active:
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300 border-blue-200 dark:border-blue-800';
    case BroadcastDeliveryStatus.Archived:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300 border-gray-200 dark:border-gray-800';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300 border-gray-200 dark:border-gray-800';
  }
};

export interface BroadcastDeliveryCalendarProps {
  broadcastId?: string;
}

export interface BroadcastDeliveryCalendarRef {
  refresh: () => Promise<void>;
}

export const BroadcastDeliveryCalendar = forwardRef<BroadcastDeliveryCalendarRef, BroadcastDeliveryCalendarProps>(
  function BroadcastDeliveryCalendar({ broadcastId }: BroadcastDeliveryCalendarProps, ref) {
    const broadcastDeliveryService = useRef(createClientService(BroadcastDeliveryService)).current;

    const [deliveries, setDeliveries] = useState<BroadcastDelivery[]>([]);
    const [loading, setLoading] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDay, setSelectedDay] = useState<Date | null>(null);
    const [sheetOpen, setSheetOpen] = useState(false);

    const fetchDeliveries = useCallback(async () => {
      setLoading(true);
      try {
        const filters: Filters<BroadcastDelivery> = [];
        if (broadcastId) {
          filters.push({ column: 'broadcastId', operator: 'eq', value: broadcastId });
        }

        // Filter deliveries for the current month and adjacent months for better UX
        const monthStart = startOfMonth(subMonths(currentMonth, 1));
        const monthEnd = endOfMonth(addMonths(currentMonth, 1));

        filters.push({ column: 'scheduledFor', operator: 'gte', value: monthStart.toISOString() as unknown as Date });
        filters.push({ column: 'scheduledFor', operator: 'lte', value: monthEnd.toISOString() as unknown as Date });

        const deliveries = await broadcastDeliveryService.getAll(filters);
        setDeliveries(deliveries);
      } catch (error) {
        logger.error('Error fetching broadcast deliveries:', error);
      } finally {
        setLoading(false);
      }
    }, [broadcastId, broadcastDeliveryService, currentMonth]);

    useEffect(() => {
      fetchDeliveries();
    }, [fetchDeliveries]);

    // Generate calendar days
    const calendarDays = useMemo(() => {
      const monthStart = startOfMonth(currentMonth);
      const monthEnd = endOfMonth(currentMonth);
      const calendarStart = startOfWeek(monthStart);
      const calendarEnd = endOfWeek(monthEnd);

      return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
    }, [currentMonth]);

    // Group deliveries by day
    const deliveriesByDay = useMemo(() => {
      const grouped = new Map<string, BroadcastDelivery[]>();

      deliveries.forEach((delivery) => {
        const dayKey = format(new Date(delivery.scheduledFor), 'yyyy-MM-dd');
        if (!grouped.has(dayKey)) {
          grouped.set(dayKey, []);
        }
        grouped.get(dayKey)!.push(delivery);
      });

      // Sort deliveries within each day by scheduledFor
      grouped.forEach((dayDeliveries) => {
        dayDeliveries.sort((a, b) => new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime());
      });

      return grouped;
    }, [deliveries]);

    const goToPreviousMonth = () => {
      setCurrentMonth((prev) => subMonths(prev, 1));
    };

    const goToNextMonth = () => {
      setCurrentMonth((prev) => addMonths(prev, 1));
    };

    const goToToday = () => {
      setCurrentMonth(new Date());
    };

    const handleDayClick = (day: Date) => {
      setSelectedDay(day);
      setSheetOpen(true);
    };

    const selectedDayDeliveries = useMemo(() => {
      if (!selectedDay) return [];
      const dayKey = format(selectedDay, 'yyyy-MM-dd');
      return deliveriesByDay.get(dayKey) || [];
    }, [selectedDay, deliveriesByDay]);

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    useImperativeHandle<
      BroadcastDeliveryCalendarRef,
      BroadcastDeliveryCalendarRef
    >(ref, (): BroadcastDeliveryCalendarRef => {
      return {
        refresh: fetchDeliveries
      };
    }, [fetchDeliveries]);

    return (
      <Card className="flex flex-col py-0 gap-0 overflow-hidden">
        {/* Calendar Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={goToToday}>
              Today
            </Button>
          </div>
          <div className="flex items-center gap-3">
            <CalendarIcon className="h-5 w-5 text-primary" />
            <CardTitle>{format(currentMonth, 'MMMM yyyy')}</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon-sm" onClick={goToPreviousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon-sm" onClick={goToNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="flex-1">
          {loading ? (
            <div className="flex items-center justify-center h-96">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="h-full">
              {/* Week day headers */}
              <div className="grid grid-cols-7 gap-px mb-px">
                {weekDays.map((day) => (
                  <div key={day} className="p-2 text-center text-sm font-semibold text-muted-foreground bg-muted/50">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar days */}
              <div className="grid grid-cols-7 gap-px bg-border">
                {calendarDays.map((day) => {
                  const dayKey = format(day, 'yyyy-MM-dd');
                  const dayDeliveries = deliveriesByDay.get(dayKey) || [];
                  const isCurrentMonth = isSameMonth(day, currentMonth);
                  const isTodayDate = isToday(day);

                  return (
                    <div
                      key={dayKey}
                      className={cn(
                        'min-h-32 p-2 bg-background cursor-pointer transition-colors hover:bg-background/90',
                        !isCurrentMonth && 'bg-muted/30 text-muted-foreground'
                      )}
                      onClick={() => handleDayClick(day)}
                    >
                      {/* Day number */}
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className={cn(
                            'text-sm font-medium',
                            isTodayDate &&
                              'flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground'
                          )}
                        >
                          {format(day, 'd')}
                        </span>
                        {dayDeliveries.length > 0 && (
                          <span className="text-xs text-muted-foreground">{dayDeliveries.length}</span>
                        )}
                      </div>

                      {/* Deliveries */}
                      <div className="space-y-1" onClick={(e) => e.stopPropagation()}>
                        {dayDeliveries.slice(0, 3).map((delivery) => (
                          <Popover key={delivery.id}>
                            <PopoverTrigger asChild>
                              <button
                                className={cn(
                                  'w-full text-left p-1.5 rounded text-xs border transition-colors hover:shadow-sm',
                                  getStatusColor(delivery.status)
                                )}
                              >
                                <div className="flex items-center gap-1 mb-0.5">
                                  <Clock className="h-3 w-3" />
                                  <span className="font-medium">
                                    {format(new Date(delivery.scheduledFor), 'HH:mm')}
                                  </span>
                                </div>
                                <div className="truncate">Delivery #{delivery.id.slice(0, 8)}</div>
                              </button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80" align="start">
                              <div className="space-y-3">
                                <div>
                                  <h4 className="font-semibold text-sm mb-1">Broadcast Delivery</h4>
                                  <p className="text-xs text-muted-foreground">ID: {delivery.id}</p>
                                </div>

                                <div className="space-y-2 text-xs">
                                  <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Scheduled:</span>
                                    <span className="font-medium">
                                      {format(new Date(delivery.scheduledFor), 'MMM d, yyyy HH:mm')}
                                    </span>
                                  </div>

                                  <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Status:</span>
                                    <Badge variant="outline" className={cn('text-xs', getStatusColor(delivery.status))}>
                                      {delivery.status}
                                    </Badge>
                                  </div>

                                  {delivery.sentAt && (
                                    <div className="flex items-center justify-between">
                                      <span className="text-muted-foreground">Sent:</span>
                                      <span className="font-medium">
                                        {format(new Date(delivery.sentAt), 'MMM d, yyyy HH:mm')}
                                      </span>
                                    </div>
                                  )}

                                  {delivery.error && (
                                    <div className="flex items-start justify-between">
                                      <span className="text-muted-foreground">Error:</span>
                                      <span className="font-medium text-destructive text-right max-w-[200px]">
                                        {delivery.error}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </PopoverContent>
                          </Popover>
                        ))}
                      </div>

                      {dayDeliveries.length > 3 && (
                        <div className="text-xs text-center text-muted-foreground py-2">
                          +{dayDeliveries.length - 3} more
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Day Details Sheet */}
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetContent className="w-full sm:max-w-lg gap-0">
            <SheetHeader>
              <SheetTitle>
                {selectedDay && (
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5 text-primary" />
                    <span>{format(selectedDay, 'EEEE, MMMM d, yyyy')}</span>
                  </div>
                )}
              </SheetTitle>
              <SheetDescription>
                {selectedDayDeliveries.length === 0
                  ? 'No deliveries scheduled for this day'
                  : `${selectedDayDeliveries.length} ${selectedDayDeliveries.length === 1 ? 'delivery' : 'deliveries'} scheduled`}
              </SheetDescription>
            </SheetHeader>

            <div className="flex-1 overflow-y-auto px-4">
              <div className="space-y-3 pb-4">
                {selectedDayDeliveries.map((delivery, index) => (
                  <div key={delivery.id}>
                    <div className={cn('p-4 rounded-lg border-2 transition-colors', getStatusColor(delivery.status))}>
                      <div className="space-y-3">
                        {/* Header */}
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Clock className="h-4 w-4" />
                              <span className="font-semibold text-base">
                                {format(new Date(delivery.scheduledFor), 'HH:mm')}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground">Delivery #{delivery.id.slice(0, 8)}</p>
                          </div>
                          <Badge variant="outline" className={cn('text-xs', getStatusColor(delivery.status))}>
                            {delivery.status}
                          </Badge>
                        </div>

                        <Separator />

                        {/* Details */}
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Full ID:</span>
                            <span className="font-mono text-xs">{delivery.id}</span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Broadcast ID:</span>
                            <span className="font-mono text-xs">{delivery.broadcastId.slice(0, 8)}</span>
                          </div>

                          {delivery.scheduleId && (
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground">Schedule ID:</span>
                              <span className="font-mono text-xs">{delivery.scheduleId.slice(0, 8)}</span>
                            </div>
                          )}

                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Scheduled For:</span>
                            <span className="font-medium">
                              {format(new Date(delivery.scheduledFor), 'MMM d, yyyy HH:mm:ss')}
                            </span>
                          </div>

                          {delivery.sentAt && (
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground">Sent At:</span>
                              <span className="font-medium">
                                {format(new Date(delivery.sentAt), 'MMM d, yyyy HH:mm:ss')}
                              </span>
                            </div>
                          )}

                          {delivery.error && (
                            <div className="flex flex-col gap-1">
                              <span className="text-muted-foreground">Error:</span>
                              <span className="font-medium text-destructive text-sm break-words">{delivery.error}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    {index < selectedDayDeliveries.length - 1 && <Separator className="my-3" />}
                  </div>
                ))}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </Card>
    );
  }
);
