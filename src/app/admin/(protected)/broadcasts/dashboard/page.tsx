'use client';

import { AdminPageContainer } from '@core/components';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@core/components/base';
import { BroadcastDeliveryService, BroadcastDeliveryViewService, BroadcastService } from '@core/services';
import { Broadcast, BroadcastDelivery, BroadcastDeliveryView } from '@core/types';
import { createClientService } from '@supa/utils/client';
import { useEffect, useState } from 'react';

export default function BroadcastDashboardPage() {
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [deliveries, setDeliveries] = useState<BroadcastDelivery[]>([]);
  const [views, setViews] = useState<BroadcastDeliveryView[]>([]);
  const [loading, setLoading] = useState(true);

  const broadcastService = createClientService(BroadcastService);
  const deliveryService = createClientService(BroadcastDeliveryService);
  const viewService = createClientService(BroadcastDeliveryViewService);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [broadcastsData, deliveriesData, viewsData] = await Promise.all([
          broadcastService.getAll(),
          deliveryService.getAll(),
          viewService.getAll()
        ]);

        setBroadcasts(broadcastsData);
        setDeliveries(deliveriesData);
        setViews(viewsData);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stats = {
    totalBroadcasts: broadcasts.length,
    activeBroadcasts: broadcasts.filter((b) => b.status === 'active').length,
    draftBroadcasts: broadcasts.filter((b) => b.status === 'draft').length,
    archivedBroadcasts: broadcasts.filter((b) => b.status === 'archived').length,

    totalDeliveries: deliveries.length,
    pendingDeliveries: deliveries.filter((d) => d.status === 'pending').length,
    sentDeliveries: deliveries.filter((d) => d.status === 'sent').length,
    failedDeliveries: deliveries.filter((d) => d.status === 'failed').length,
    activeDeliveries: deliveries.filter((d) => d.status === 'active').length,

    totalViews: views.length,
    viewedCount: views.filter((v) => v.viewedAt).length,
    dismissedCount: views.filter((v) => v.dismissedAt).length,
    clickedCount: views.filter((v) => v.clickedAt).length,

    // Engagement rates
    viewRate: views.length > 0 ? ((views.filter((v) => v.viewedAt).length / views.length) * 100).toFixed(1) : '0',
    dismissRate:
      views.filter((v) => v.viewedAt).length > 0
        ? ((views.filter((v) => v.dismissedAt).length / views.filter((v) => v.viewedAt).length) * 100).toFixed(1)
        : '0',
    clickRate:
      views.filter((v) => v.viewedAt).length > 0
        ? ((views.filter((v) => v.clickedAt).length / views.filter((v) => v.viewedAt).length) * 100).toFixed(1)
        : '0'
  };

  return (
    <AdminPageContainer title="Broadcast Dashboard" loading={loading}>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Broadcast Stats */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Broadcasts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBroadcasts}</div>
            <p className="text-xs text-muted-foreground">{stats.activeBroadcasts} active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Broadcasts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeBroadcasts}</div>
            <p className="text-xs text-muted-foreground">Currently running</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Draft Broadcasts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.draftBroadcasts}</div>
            <p className="text-xs text-muted-foreground">Pending configuration</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Archived Broadcasts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.archivedBroadcasts}</div>
            <p className="text-xs text-muted-foreground">Past broadcasts</p>
          </CardContent>
        </Card>

        {/* Delivery Stats */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Deliveries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDeliveries}</div>
            <p className="text-xs text-muted-foreground">
              {stats.sentDeliveries} sent, {stats.pendingDeliveries} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sent Deliveries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.sentDeliveries}</div>
            <p className="text-xs text-muted-foreground">Successfully delivered</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Deliveries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.failedDeliveries}</div>
            <p className="text-xs text-destructive">Requires attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Deliveries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeDeliveries}</div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>

        {/* View/Engagement Stats */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalViews}</div>
            <p className="text-xs text-muted-foreground">{stats.viewedCount} actually viewed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">View Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.viewRate}%</div>
            <p className="text-xs text-muted-foreground">Of all views</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Click-Through Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.clickRate}%</div>
            <p className="text-xs text-muted-foreground">{stats.clickedCount} clicks</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dismiss Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.dismissRate}%</div>
            <p className="text-xs text-muted-foreground">{stats.dismissedCount} dismissed</p>
          </CardContent>
        </Card>
      </div>

      {/* Status Breakdown */}
      <div className="grid gap-4 md:grid-cols-2 mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Broadcast Status Breakdown</CardTitle>
            <CardDescription>Distribution of broadcasts by status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Draft</span>
                <span className="text-sm font-medium">{stats.draftBroadcasts}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Active</span>
                <span className="text-sm font-medium">{stats.activeBroadcasts}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Archived</span>
                <span className="text-sm font-medium">{stats.archivedBroadcasts}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Delivery Status Breakdown</CardTitle>
            <CardDescription>Distribution of deliveries by status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Pending</span>
                <span className="text-sm font-medium">{stats.pendingDeliveries}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Active</span>
                <span className="text-sm font-medium">{stats.activeDeliveries}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Sent</span>
                <span className="text-sm font-medium">{stats.sentDeliveries}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-destructive">Failed</span>
                <span className="text-sm font-medium text-destructive">{stats.failedDeliveries}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminPageContainer>
  );
}
