'use client';

import { AdminPageContainer, CurbyTableRef, DateTimePicker } from '@core/components';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Label,
  RowMenuItem,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@core/components/base';
import { BroadcastDeliveryStatus } from '@core/enumerations';
import { useConfirmDialog } from '@core/providers';
import { BroadcastDeliveryService, BroadcastService, FunctionsService, ScheduleService } from '@core/services';
import { Broadcast, BroadcastDelivery, Schedule } from '@core/types';
import {
  BroadcastAudienceBadge,
  BroadcastCategoryBadge,
  BroadcastDeliveryCalendar,
  BroadcastDeliveryTable,
  BroadcastDeliveryViewCountCell,
  BroadcastDeliveryViewTable,
  BroadcastEditor,
  BroadcastPanel,
  BroadcastPanelRef,
  BroadcastPlatformBadge,
  BroadcastStatusBadge,
  ScheduleCard,
  SchedulePanel,
  SchedulePanelRef
} from '@features/broadcasts/components';
import { createClientService } from '@supa/utils/client';
import { format } from 'date-fns';
import { CalendarCog, Edit2, Info, Megaphone, Target, Trash, Zap } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

export default function BroadcastDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [broadcast, setBroadcast] = useState<Broadcast | null>(null);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const schedulePanelRef = useRef<SchedulePanelRef>(null);
  const broadcastPanelRef = useRef<BroadcastPanelRef>(null);
  const broadcastDeliveryTableRef = useRef<CurbyTableRef<BroadcastDelivery>>(null);

  const broadcastService = createClientService(BroadcastService);
  const scheduleService = createClientService(ScheduleService);
  const deliveryService = createClientService(BroadcastDeliveryService);
  const functionsService = createClientService(FunctionsService);

  const { open: openConfirmDialog } = useConfirmDialog();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [broadcastData, schedulesData] = await Promise.all([
          broadcastService.getById(id),
          scheduleService.getAll({ column: 'ownerId', operator: 'eq', value: id })
        ]);

        setBroadcast(broadcastData);
        setSchedules(schedulesData);
      } catch (error) {
        console.error('Failed to fetch broadcast details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const refreshData = async () => {
    try {
      const [broadcastData, schedulesData] = await Promise.all([
        broadcastService.getById(id),
        scheduleService.getAll({ column: 'ownerId', operator: 'eq', value: id })
      ]);

      setBroadcast(broadcastData);
      setSchedules(schedulesData);
    } catch (error) {
      console.error('Failed to refresh data:', error);
    }
  };

  const handleGenerateOneTimeDelivery = async (scheduledFor: Date) => {
    if (!broadcast) return;
    setProcessing(true);
    try {
      const result = await functionsService.generateBroadcastDeliveries(broadcast.id, undefined, scheduledFor);
      if (result.success) {
        toast.success(`Generated ${result.deliveriesCreated} one-time delivery.`);
        await refreshData();
      } else {
        toast.error('Failed to generate one-time delivery.');
      }
    } catch (error) {
      console.error('Failed to generate one-time delivery:', error);
      alert('Failed to generate one-time delivery. Check console for details.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return <AdminPageContainer title="Loading..." loading={loading} />;
  }

  if (!broadcast) {
    return <AdminPageContainer title="Broadcast Not Found" error="Broadcast not found" />;
  }

  return (
    <AdminPageContainer title="Broadcast Details">
      <div className="space-y-6">
        {/* Broadcast Header Card */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4 flex-1">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Megaphone className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <CardTitle className="text-2xl">{broadcast.name}</CardTitle>
                    <BroadcastStatusBadge status={broadcast.status} />
                  </div>
                  {broadcast.description && (
                    <CardDescription className="text-base">{broadcast.description}</CardDescription>
                  )}
                </div>
              </div>
              <Button variant="default" size="sm" onClick={() => broadcastPanelRef.current?.open(id)}>
                <Edit2 className="h-4 w-4 mr-2" />
                Edit Broadcast
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Validity Period */}
              <div className="flex items-start gap-3">
                <div className="mt-0.5 p-2 rounded-md bg-blue-500/10">
                  <Info className="h-4 w-4 text-blue-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-muted-foreground mb-1">Validity Period</p>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">
                      {format(new Date(broadcast.validFrom), 'MMM d, yyyy h:mm aa')}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      to{' '}
                      {broadcast.validTo ? format(new Date(broadcast.validTo), 'MMM d, yyyy h:mm aa') : 'No expiration'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Target Audience */}
              <div className="flex items-start gap-3">
                <div className="mt-0.5 p-2 rounded-md bg-purple-500/10">
                  <Target className="h-4 w-4 text-purple-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-muted-foreground mb-1">Target Audience</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    <BroadcastPlatformBadge platform={broadcast.platform} />
                    <BroadcastAudienceBadge audience={broadcast.audience} />
                  </div>
                </div>
              </div>

              {/* Delivery Settings */}
              <div className="flex items-start gap-3">
                <div className="mt-0.5 p-2 rounded-md bg-green-500/10">
                  <Zap className="h-4 w-4 text-green-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-muted-foreground mb-1">Delivery Settings</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    <BroadcastCategoryBadge category={broadcast.category} />
                    <Badge variant="outline">Priority: {broadcast.priority}</Badge>
                  </div>
                  {(broadcast.sendEmail || broadcast.sendPush) && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {broadcast.sendPush && (
                        <Badge variant="secondary" className="text-xs">
                          Push
                        </Badge>
                      )}
                      {broadcast.sendEmail && (
                        <Badge variant="secondary" className="text-xs">
                          Email
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <BroadcastEditor broadcast={broadcast} refresh={refreshData} />

        {/* Tabs for Schedule, Deliveries, and Views */}
        <Tabs defaultValue="schedule" className="w-full">
          <TabsList>
            <TabsTrigger value="schedule">Schedules</TabsTrigger>
            <TabsTrigger value="deliveries">One-Time Deliveries</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
          </TabsList>

          <TabsContent value="schedule" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-start justify-between">
                <div className="flex flex-col gap-1">
                  <CardTitle>Schedules</CardTitle>
                  <CardDescription>Manage scheduled deliveries for this broadcast.</CardDescription>
                </div>
                <Button size="sm" onClick={() => schedulePanelRef.current?.open({ broadcastId: id })}>
                  Add Schedule
                </Button>
              </CardHeader>
              <CardContent>
                {(!schedules || schedules.length === 0) && (
                  <div className="space-y-4">
                    <p className="text-muted-foreground text-center">
                      No schedules configured for this broadcast. Click &quot;Add Schedule&quot; to create one.
                    </p>
                  </div>
                )}
                {schedules.length > 0 && (
                  <div className="space-y-4">
                    {schedules.map((schedule) => (
                      <ScheduleCard key={schedule.id} broadcast={broadcast} schedule={schedule} refresh={refreshData} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="deliveries" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-start justify-between">
                <div className="flex flex-col gap-1">
                  <CardTitle>One-Time Deliveries</CardTitle>
                  <CardDescription>List of all deliveries generated for this broadcast.</CardDescription>
                </div>
                <Button
                  size="sm"
                  onClick={() => {
                    openConfirmDialog({
                      title: 'Generate One-Time Delivery',
                      message: 'Please select the scheduled time for this one-time broadcast delivery.',
                      initialData: {
                        scheduledFor: new Date()
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
                            <Label className="font-medium">Scheduled Time</Label>
                            <DateTimePicker
                              value={new Date(formState.scheduledFor)}
                              onChange={(date) => setFormState({ scheduledFor: date! })}
                            />
                          </div>
                        );
                      },
                      confirmButtonText: 'Generate',
                      variant: 'default',
                      onConfirm: async (data: { scheduledFor: Date }) => {
                        handleGenerateOneTimeDelivery(data.scheduledFor);
                      }
                    });
                  }}
                  disabled={processing}
                >
                  {processing ? 'Generating...' : 'Generate One-Time Delivery'}
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <BroadcastDeliveryTable
                  ref={broadcastDeliveryTableRef}
                  restrictiveFilters={[
                    { column: 'broadcastId', operator: 'eq', value: broadcast.id },
                    { column: 'scheduleId', operator: 'is', value: null }
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
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="calendar" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex flex-col gap-1">
                  <CardTitle>Delivery Calendar</CardTitle>
                  <CardDescription>Visual calendar view of broadcast deliveries.</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <BroadcastDeliveryCalendar broadcastId={broadcast.id} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      <BroadcastPanel ref={broadcastPanelRef} onClose={() => refreshData()} />
      <SchedulePanel ref={schedulePanelRef} onClose={() => refreshData()} />
    </AdminPageContainer>
  );
}
