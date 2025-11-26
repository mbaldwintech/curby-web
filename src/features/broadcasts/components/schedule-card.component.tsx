import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  CurbyTableRef,
  DateTimePicker,
  Label,
  RowMenuItem,
  Switch
} from '@core/components';
import { BroadcastDeliveryStatus } from '@core/enumerations';
import { useAsyncMemo } from '@core/hooks';
import { useConfirmDialog } from '@core/providers';
import { BroadcastDeliveryService, FunctionsService, ScheduleService } from '@core/services';
import { Broadcast, BroadcastDelivery, Schedule } from '@core/types';
import { createClientService } from '@supa/utils/client';
import { formatInTimeZone } from 'date-fns-tz';
import { CalendarCog, ChevronRight, Clock, Edit, RefreshCw, Trash } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import { toast } from 'sonner';
import { BroadcastDeliveryTable } from './broadcast-delivery-table.component';
import { BroadcastDeliveryViewCountCell } from './broadcast-delivery-view-count-cell.component';
import { BroadcastDeliveryViewTable } from './broadcast-delivery-view-table.component';
import { SchedulePanel, SchedulePanelRef } from './schedule-panel.component';

export interface ScheduleCardProps {
  broadcast: Broadcast;
  schedule: Schedule;
  refresh: () => Promise<void>;
}

export const ScheduleCard = ({ broadcast, schedule, refresh }: ScheduleCardProps) => {
  const [processing, setProcessing] = useState(false);

  const scheduleService = useRef(createClientService(ScheduleService)).current;
  const functionsService = useRef(createClientService(FunctionsService)).current;
  const deliveryService = useRef(createClientService(BroadcastDeliveryService)).current;
  const schedulePanelRef = useRef<SchedulePanelRef>(null);
  const broadcastDeliveryTableRef = useRef<CurbyTableRef<BroadcastDelivery>>(null);
  const { open: openConfirmDialog } = useConfirmDialog();
  const [open, setOpen] = useState(false);

  const countOfDeliveries = useAsyncMemo(async () => {
    try {
      return await deliveryService.count([{ column: 'scheduleId', operator: 'eq', value: schedule.id }]);
    } catch (error) {
      console.error('Failed to fetch delivery count:', error);
      return 0;
    }
  }, [schedule.id]);

  const generateDeliveries = useCallback(async () => {
    if (!broadcast) return;
    setProcessing(true);
    try {
      const result = await functionsService.generateBroadcastDeliveries(broadcast.id, schedule.id);
      if (result.success) {
        toast.success(`Generated ${result.deliveriesCreated} deliveries for this schedule.`);
        await refresh();
      } else {
        toast.error('Failed to generate deliveries.');
      }
    } catch (error) {
      console.error('Failed to generate deliveries:', error);
      alert('Failed to generate deliveries. Check console for details.');
    } finally {
      setProcessing(false);
    }
  }, [broadcast, schedule.id, functionsService, refresh]);

  const handleGenerateDeliveries = useCallback(async () => {
    if (!broadcast) return;
    if (countOfDeliveries && countOfDeliveries > 0) {
      openConfirmDialog({
        title: 'Generate Deliveries',
        message:
          'All existing deliveries for this schedule will be deleted and new ones will be generated. Do you want to continue?',
        variant: 'destructive',
        confirmButtonText: 'Generate',
        onConfirm: async () => {
          await generateDeliveries();
        }
      });
    } else {
      await generateDeliveries();
    }
  }, [broadcast, countOfDeliveries, generateDeliveries, openConfirmDialog]);

  const deleteSchedule = useCallback(async () => {
    try {
      await scheduleService.delete(schedule.id);
      await refresh();
      toast.success('Schedule deleted successfully.');
    } catch (error) {
      console.error('Failed to delete schedule:', error);
      toast.error('Failed to delete schedule.');
    }
  }, [schedule.id, scheduleService, refresh]);

  const toggleScheduleActive = useCallback(async () => {
    try {
      await scheduleService.update(schedule.id, { active: !schedule.active });
      await refresh();
      toast.success(`Schedule ${!schedule.active ? 'activated' : 'deactivated'} successfully.`);
    } catch (error) {
      console.error('Failed to toggle schedule:', error);
      toast.error('Failed to update schedule.');
    }
  }, [schedule.id, schedule.active, scheduleService, refresh]);

  const handleDeleteSchedule = useCallback(() => {
    if (!broadcast) return;
    if (countOfDeliveries && countOfDeliveries > 0) {
      openConfirmDialog({
        title: 'Delete Schedule',
        message: 'Are you sure you want to delete this schedule? All associated deliveries will also be deleted.',
        variant: 'destructive',
        confirmButtonText: 'Delete',
        onConfirm: async () => {
          await deleteSchedule();
        }
      });
    } else {
      openConfirmDialog({
        title: 'Delete Schedule',
        message: 'Are you sure you want to delete this schedule?',
        variant: 'destructive',
        confirmButtonText: 'Delete',
        onConfirm: async () => {
          await deleteSchedule();
        }
      });
    }
  }, [deleteSchedule, openConfirmDialog, broadcast, countOfDeliveries]);

  return (
    <>
      <Card key={schedule.id} className={!schedule.active ? 'opacity-60' : ''}>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <CardTitle className="text-base">{schedule.name}</CardTitle>
                {!schedule.active && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">Inactive</span>
                )}
              </div>
              {schedule.description && <CardDescription>{schedule.description}</CardDescription>}
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <Label htmlFor={`schedule-${schedule.id}-active`} className="text-sm text-muted-foreground">
                  Active
                </Label>
                <Switch
                  id={`schedule-${schedule.id}-active`}
                  checked={schedule.active}
                  onCheckedChange={toggleScheduleActive}
                />
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => schedulePanelRef.current?.open({ broadcastId: broadcast.id, scheduleId: schedule.id })}
              >
                <Edit className="h-3.5 w-3.5 mr-1.5" />
                Edit
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-destructive hover:text-foreground hover:bg-destructive dark:hover:bg-destructive"
                onClick={handleDeleteSchedule}
              >
                <Trash className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 p-2 rounded-md bg-primary/10">
                <Clock className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-muted-foreground">Start Date</p>
                <p className="text-sm font-medium truncate">
                  {formatInTimeZone(new Date(schedule.dtStart), schedule.timezone || 'UTC', 'MMM d, yyyy h:mm aa')}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">{schedule.timezone || 'UTC'}</p>
              </div>
            </div>

            {schedule.dtEnd && (
              <div className="flex items-start gap-3">
                <div className="mt-0.5 p-2 rounded-md bg-destructive/10">
                  <Clock className="h-4 w-4 text-destructive" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-muted-foreground">End Date</p>
                  <p className="text-sm font-medium truncate">
                    {formatInTimeZone(new Date(schedule.dtEnd), schedule.timezone || 'UTC', 'MMM d, yyyy h:mm aa')}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">{schedule.timezone || 'UTC'}</p>
                </div>
              </div>
            )}

            {schedule.rrule && (
              <div className="flex items-start gap-3">
                <div className="mt-0.5 p-2 rounded-md bg-secondary">
                  <RefreshCw className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-muted-foreground">Recurrence</p>
                  <p className="text-xs font-mono truncate">{schedule.rrule}</p>
                </div>
              </div>
            )}
          </div>

          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-medium">Scheduled Deliveries</h4>
                <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                  {countOfDeliveries ?? 0}
                </span>
              </div>
              <Button size="sm" variant="secondary" onClick={() => handleGenerateDeliveries()} disabled={processing}>
                <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${processing ? 'animate-spin' : ''}`} />
                {processing ? 'Generating...' : 'Generate Deliveries'}
              </Button>
            </div>

            <Collapsible open={open} onOpenChange={setOpen}>
              <CollapsibleTrigger asChild>
                <button className="w-full px-4 py-3 flex items-center gap-3 rounded-md border hover:bg-muted/50 transition-colors">
                  <ChevronRight className={`h-4 w-4 transition-transform ${open ? 'rotate-90' : ''}`} />
                  <span className="text-sm font-medium">{open ? 'Hide' : 'Show'} Delivery Schedule</span>
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-4 space-y-2">
                <BroadcastDeliveryTable
                  ref={broadcastDeliveryTableRef}
                  restrictiveFilters={[
                    { column: 'broadcastId', operator: 'eq', value: broadcast.id },
                    { column: 'scheduleId', operator: 'eq', value: schedule.id }
                  ]}
                  extraColumns={[
                    {
                      accessorKey: 'viewCount',
                      header: 'View Count',
                      cell: ({ row }) => <BroadcastDeliveryViewCountCell broadcastDeliveryId={row.original.id} />,
                      enableColumnFilter: false,
                      enableSorting: false,
                      enableSearching: false
                    }
                  ]}
                  getExpandedContent={(row) => {
                    return (
                      <div className="flex flex-col gap-2 py-4 px-6">
                        <BroadcastDeliveryViewTable
                          restrictiveFilters={[{ column: 'broadcastDeliveryId', operator: 'eq', value: row.id }]}
                          maxHeight={200}
                        />
                      </div>
                    );
                  }}
                  getRowActionMenuItems={(row) => {
                    const opts: RowMenuItem<BroadcastDelivery>[] = [];
                    const canDelete = row.original.status === BroadcastDeliveryStatus.Pending;
                    opts.push({
                      label: 'Reschedule',
                      icon: CalendarCog,
                      onClick: () => {
                        openConfirmDialog({
                          title: 'Reschedule Broadcast Delivery',
                          message: 'Please select the new scheduled time for this broadcast delivery.',
                          initialData: {
                            scheduledFor: row.original.scheduledFor || new Date()
                          },
                          Body: ({
                            formState,
                            setFormState
                          }: {
                            formState: { scheduledFor: Date };
                            setFormState: React.Dispatch<React.SetStateAction<{ scheduledFor: Date }>>;
                          }) => {
                            return (
                              <div className="flex flex-col gap-4">
                                <Label className="font-medium">New Scheduled Time</Label>
                                <DateTimePicker
                                  value={new Date(formState.scheduledFor)}
                                  onChange={(date) => setFormState({ scheduledFor: date! })}
                                />
                              </div>
                            );
                          },
                          confirmButtonText: 'Update',
                          variant: 'default',
                          onConfirm: async (data: { scheduledFor: Date }) => {
                            await deliveryService.update(row.original.id, { scheduledFor: data.scheduledFor });
                            broadcastDeliveryTableRef.current?.refresh();
                          }
                        });
                      }
                    });
                    opts.push({
                      label: 'Delete',
                      icon: Trash,
                      variant: 'destructive',
                      disabled: !canDelete,
                      separator: true,
                      onClick: () => {
                        openConfirmDialog({
                          title: 'Delete Broadcast Delivery',
                          message:
                            'Are you sure you want to delete this broadcast delivery? This action cannot be undone.',
                          confirmButtonText: 'Delete',
                          variant: 'destructive',
                          onConfirm: async () => {
                            await deliveryService.delete(row.original.id);
                            broadcastDeliveryTableRef.current?.refresh();
                          }
                        });
                      }
                    });
                    return opts;
                  }}
                />
              </CollapsibleContent>
            </Collapsible>
          </div>
        </CardContent>
      </Card>
      <SchedulePanel ref={schedulePanelRef} onClose={refresh} />
    </>
  );
};
