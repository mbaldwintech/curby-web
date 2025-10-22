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
import { AlertTriangle, Bell, DollarSign, Loader2, Package, Users } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export default function AdminDashboard() {
  const profileService = useRef(createClientService(ProfileService)).current;
  const reportedItemService = useRef(createClientService(ItemReportService)).current;
  const curbyCoinTransactionService = useRef(createClientService(CurbyCoinTransactionService)).current;
  const notificationService = useRef(createClientService(NotificationService)).current;
  const itemService = useRef(createClientService(ItemService)).current;

  const [stats, setStats] = useState({
    totalUsers: 0,
    activeItems: 0,
    reportedItems: 0,
    totalCoinTransactions: 0,
    totalNotifications: 0
  });
  const [itemReportes, setItemReports] = useState<ItemReport[]>([]);
  const [reportedItems, setReportedItems] = useState<Item[]>([]);
  const [coinTransactions, setCoinTransactions] = useState<CurbyCoinTransaction[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch total users
        const activeUserCount = await profileService.count({
          column: 'status',
          operator: 'eq',
          value: UserStatus.Active
        });

        // Fetch active items
        const activeItemCount = await itemService.count([
          { column: 'taken', operator: 'eq', value: false },
          { column: 'expiresAt', operator: 'gt', value: new Date().toISOString() }
        ]);

        // Fetch reported items
        const reportedItemCount = await reportedItemService.count({
          column: 'reviewId',
          operator: 'is',
          value: null
        });

        // Fetch total coin transactions
        const coinTransactionCount = await curbyCoinTransactionService.count();

        // Fetch total notifications
        const notificationCount = await notificationService.count();

        // Fetch reported items details
        const itemReports = await reportedItemService.getAll(
          {
            column: 'reviewId',
            operator: 'is',
            value: null
          }, // Filter by status
          { column: 'reportedAt', ascending: false }, // Order by reportedAt descending
          { column: 'reportedAt', value: new Date().toISOString() }, // Cursor pagination placeholder
          5
        );

        // Enrich reported items with actual item entities
        const itemIds = itemReports.map((ri) => ri.itemId);
        const reportedItems = await itemService.getAll({ column: 'id', operator: 'in', value: itemIds });

        // Fetch recent coin transactions
        const coinTransactions = await curbyCoinTransactionService.getAll(
          [],
          { column: 'occurredAt', ascending: false },
          { column: 'occurredAt', value: new Date().toISOString() },
          5
        );

        // Enrich transactions with usernames
        const userIds = coinTransactions.map((tx) => tx.userId);
        const profiles = await profileService.getAll({ column: 'userId', operator: 'in', value: userIds });

        // Fetch recent notifications
        const notifications = await notificationService.getAll(
          [],
          { column: 'sentAt', ascending: false },
          { column: 'sentAt', value: new Date().toISOString() },
          5
        );

        setStats({
          totalUsers: activeUserCount || 0,
          activeItems: activeItemCount || 0,
          reportedItems: reportedItemCount || 0,
          totalCoinTransactions: coinTransactionCount || 0,
          totalNotifications: notificationCount || 0
        });
        setItemReports(itemReports);
        setReportedItems(reportedItems);
        setCoinTransactions(coinTransactions);
        setProfiles(profiles);
        setNotifications(notifications);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [itemService, notificationService, profileService, reportedItemService, curbyCoinTransactionService]);

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
              {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats.totalUsers}
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
              {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats.activeItems}
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
              {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats.reportedItems}
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
              {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats.totalCoinTransactions}
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
              {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats.totalNotifications}
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
            ) : itemReportes.length > 0 ? (
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
