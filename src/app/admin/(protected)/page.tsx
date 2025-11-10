'use client';

import {
  AdminPageContainer,
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@core/components';
import { UserStatus } from '@core/enumerations';
import {
  CurbyCoinTransactionService,
  ItemReportService,
  ItemService,
  NotificationService,
  ProfileService
} from '@core/services';
import { CurbyCoinTransaction, Item, ItemReport, Notification, Profile } from '@core/types';
import { createClientService } from '@supa/utils/client';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, Bell, DollarSign, Loader2, Package, Users } from 'lucide-react';
import { useMemo } from 'react';

export default function AdminDashboard() {
  const profileService = useMemo(() => createClientService(ProfileService), []);
  const reportedItemService = useMemo(() => createClientService(ItemReportService), []);
  const curbyCoinTransactionService = useMemo(() => createClientService(CurbyCoinTransactionService), []);
  const notificationService = useMemo(() => createClientService(NotificationService), []);
  const itemService = useMemo(() => createClientService(ItemService), []);

  // Stats queries

  const { data: activeUserCount = 0, isLoading: loadingUsers } = useQuery<number>({
    queryKey: ['admin-stats', 'users'],
    queryFn: () => profileService.count({ column: 'status', operator: 'eq', value: UserStatus.Active }),
    staleTime: 10000
  });

  const { data: activeItemCount = 0, isLoading: loadingItems } = useQuery<number>({
    queryKey: ['admin-stats', 'active-items'],
    queryFn: () =>
      itemService.count([
        { column: 'taken', operator: 'eq', value: false },
        { column: 'expiresAt', operator: 'gt', value: new Date().toISOString() }
      ]),
    staleTime: 10000
  });

  const { data: reportedItemCount = 0, isLoading: loadingReported } = useQuery<number>({
    queryKey: ['admin-stats', 'reported-items'],
    queryFn: () => reportedItemService.count({ column: 'reviewId', operator: 'is', value: null }),
    staleTime: 10000
  });

  const { data: coinTransactionCount = 0, isLoading: loadingCoin } = useQuery<number>({
    queryKey: ['admin-stats', 'coin-transactions'],
    queryFn: () => curbyCoinTransactionService.count(),
    staleTime: 10000
  });

  const { data: notificationCount = 0, isLoading: loadingNotifications } = useQuery<number>({
    queryKey: ['admin-stats', 'notifications'],
    queryFn: () => notificationService.count(),
    staleTime: 10000
  });

  // Recent data queries

  const { data: itemReportes = [], isLoading: loadingItemReports } = useQuery<ItemReport[]>({
    queryKey: ['admin-recent', 'item-reports'],
    queryFn: async () => {
      return await reportedItemService.getAll(
        { column: 'reviewId', operator: 'is', value: null },
        { column: 'reportedAt', ascending: false },
        { column: 'reportedAt', value: new Date().toISOString() },
        5
      );
    },
    staleTime: 10000
  });

  const itemIds = useMemo(
    () => (Array.isArray(itemReportes) ? itemReportes.map((ri) => ri.itemId) : []),
    [itemReportes]
  );
  const { data: reportedItems = [], isLoading: loadingReportedItems } = useQuery<Item[]>({
    queryKey: ['admin-recent', 'reported-items', itemIds],
    queryFn: () =>
      itemIds.length > 0 ? itemService.getAll({ column: 'id', operator: 'in', value: itemIds }) : Promise.resolve([]),
    enabled: itemIds.length > 0,
    staleTime: 10000
  });

  const { data: coinTransactions = [], isLoading: loadingCoinTx } = useQuery<CurbyCoinTransaction[]>({
    queryKey: ['admin-recent', 'coin-transactions'],
    queryFn: () =>
      curbyCoinTransactionService.getAll(
        [],
        { column: 'occurredAt', ascending: false },
        { column: 'occurredAt', value: new Date().toISOString() },
        5
      ),
    staleTime: 10000
  });

  const userIds = useMemo(
    () => (Array.isArray(coinTransactions) ? coinTransactions.map((tx) => tx.userId) : []),
    [coinTransactions]
  );
  const { data: profiles = [], isLoading: loadingProfiles } = useQuery<Profile[]>({
    queryKey: ['admin-recent', 'profiles', userIds],
    queryFn: () =>
      userIds.length > 0
        ? profileService.getAll({ column: 'userId', operator: 'in', value: userIds })
        : Promise.resolve([]),
    enabled: userIds.length > 0,
    staleTime: 10000
  });

  const { data: notifications = [], isLoading: loadingRecentNotifications } = useQuery<Notification[]>({
    queryKey: ['admin-recent', 'notifications'],
    queryFn: () =>
      notificationService.getAll(
        [],
        { column: 'sentAt', ascending: false },
        { column: 'sentAt', value: new Date().toISOString() },
        5
      ),
    staleTime: 10000
  });

  const loading =
    loadingUsers ||
    loadingItems ||
    loadingReported ||
    loadingCoin ||
    loadingNotifications ||
    loadingItemReports ||
    loadingReportedItems ||
    loadingCoinTx ||
    loadingProfiles ||
    loadingRecentNotifications;

  return (
    <AdminPageContainer title="Dashboard">
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : activeUserCount}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : activeItemCount}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reported Items</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : reportedItemCount}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Coin Transactions</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : coinTransactionCount}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Notifications</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : notificationCount}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reported Items, Coin Transactions, and Notifications */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Reported Items */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Reported Items</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : Array.isArray(itemReportes) && itemReportes.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Reported At</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportedItems.map((item) => {
                    const reports = itemReportes.filter((ir) => ir.itemId === item.id);
                    const report = reports.sort(
                      (a, b) => new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime()
                    )[0];
                    if (reports.length === 0) return null;
                    return (
                      <TableRow key={item.id}>
                        <TableCell>{item.title}</TableCell>
                        <TableCell>{new Date(report.reportedAt).toLocaleDateString()}</TableCell>
                        <TableCell>{report.reason || 'No reason provided'}</TableCell>
                        <TableCell>
                          <Badge variant={report.reviewId === null ? 'destructive' : 'secondary'}>
                            {report.reviewId === null ? 'Pending Review' : 'In Review'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              <p className="text-center text-muted-foreground">No reported items.</p>
            )}
          </CardContent>
        </Card>

        {/* Curby Coin Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Coin Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : coinTransactions.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Username</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {coinTransactions.map((transaction) => {
                    const profile = profiles.find((p) => p.userId === transaction.userId);
                    const username = profile ? profile.username : 'Unknown User';
                    return (
                      <TableRow key={transaction.id}>
                        <TableCell>{username}</TableCell>
                        <TableCell>
                          <Badge variant={transaction.amount > 0 ? 'default' : 'destructive'}>
                            {transaction.amount > 0 ? '+' : ''}
                            {transaction.amount}
                          </Badge>
                        </TableCell>
                        <TableCell>{transaction.description}</TableCell>
                        <TableCell>{new Date(transaction.occurredAt).toLocaleDateString()}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              <p className="text-center text-muted-foreground">No recent coin transactions.</p>
            )}
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Recent Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : notifications.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Body</TableHead>
                    <TableHead>Channel</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Sent At</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {notifications.map((notification) => (
                    <TableRow key={notification.id}>
                      <TableCell>{notification.title}</TableCell>
                      <TableCell className="max-w-xs truncate">{notification.body}</TableCell>
                      <TableCell>{notification.deliveryChannel}</TableCell>
                      <TableCell>{notification.category}</TableCell>
                      <TableCell>{new Date(notification.sentAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge variant={notification.read ? 'default' : 'secondary'}>
                          {notification.read ? 'Read' : 'Unread'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-center text-muted-foreground">No recent notifications.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminPageContainer>
  );
}
