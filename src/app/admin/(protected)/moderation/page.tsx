'use client';

import {
  AdminPageContainer,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Progress,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@core/components';
import { UserStatus } from '@core/enumerations';
import {
  FrequentFalseTaker,
  ModerationOverview,
  ModerationQueueItem,
  ModerationTrend,
  ModeratorPerformance,
  MostReportedContent,
  TopReporter
} from '@core/types';
import { createClient } from '@supa/utils/client';
import { AlertTriangle, CheckCircle, Clock, Eye, RefreshCcw, Shield, Users, XCircle } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createLogger } from '@core/utils';

const logger = createLogger('Moderation');

const ModerationTrendsChart = dynamic(
  () => import('./moderation-trends-chart').then((mod) => ({ default: mod.ModerationTrendsChart })),
  {
    loading: () => (
      <Card>
        <CardHeader>
          <CardTitle>Moderation Trends (30 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <p className="text-muted-foreground">Loading chart...</p>
          </div>
        </CardContent>
      </Card>
    ),
    ssr: false
  }
);

export default function ModerationDashboard() {
  const supabase = useRef(createClient()).current;
  const [overview, setOverview] = useState<ModerationOverview | null>(null);
  const [topReporters, setTopReporters] = useState<TopReporter[]>([]);
  const [mostReported, setMostReported] = useState<MostReportedContent[]>([]);
  const [falseTakers, setFalseTakers] = useState<FrequentFalseTaker[]>([]);
  const [moderationQueue, setModerationQueue] = useState<ModerationQueueItem[]>([]);
  const [trends, setTrends] = useState<ModerationTrend[]>([]);
  const [moderatorPerformance, setModeratorPerformance] = useState<ModeratorPerformance[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchModerationData = useCallback(async () => {
    try {
      setLoading(true);

      const [
        overviewResult,
        reportersResult,
        reportedResult,
        falseTakersResult,
        queueResult,
        trendsResult,
        performanceResult
      ] = await Promise.all([
        supabase.from('moderation_overview').select('*').single(),
        supabase.from('top_reporters').select('*').limit(10),
        supabase.from('most_reported_content').select('*').limit(10),
        supabase.from('frequent_false_takers').select('*').limit(10),
        supabase.from('moderation_queue').select('*').limit(50),
        supabase.from('moderation_trends').select('*').order('trendDate', { ascending: false }).limit(30),
        supabase.from('moderator_performance').select('*').limit(10)
      ]);

      setOverview(overviewResult.data);
      setTopReporters(reportersResult.data || []);
      setMostReported(reportedResult.data || []);
      setFalseTakers(falseTakersResult.data || []);
      setModerationQueue(queueResult.data || []);
      setTrends(trendsResult.data || []);
      setModeratorPerformance(performanceResult.data || []);
    } catch (error) {
      logger.error('Error fetching moderation data:', error);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchModerationData();
  }, [fetchModerationData]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const formatTimeAgo = (hours: number) => {
    if (hours < 1) return `${Math.round(hours * 60)}m ago`;
    if (hours < 24) return `${Math.round(hours)}h ago`;
    return `${Math.round(hours / 24)}d ago`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
          <p className="mt-4 text-lg">Loading moderation dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <AdminPageContainer
      title="Moderation Dashboard"
      headerProps={{
        rightContent: (
          <Button onClick={fetchModerationData} className="size-7" variant="outline" size="icon">
            <RefreshCcw className="h-[1.2rem] w-[1.2rem]" />
          </Button>
        )
      }}
    >
      {/* Overview Cards */}
      {overview && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Reports</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{overview.pendingReports}</div>
              <p className="text-xs text-muted-foreground">{overview.reportsInReview} in review</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Suspended Users</CardTitle>
              <Users className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{overview.currentlySuspendedUsers}</div>
              <p className="text-xs text-muted-foreground">{overview.bannedUsers} banned</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">False Takings (7d)</CardTitle>
              <Shield className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{overview.falseTakingsLast7Days}</div>
              <p className="text-xs text-muted-foreground">{overview.falseTakingsLast30Days} in 30 days</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="queue" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="queue">Queue</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="reporters">Top Reporters</TabsTrigger>
          <TabsTrigger value="reported">Most Reported</TabsTrigger>
          <TabsTrigger value="false-takers">False Takers</TabsTrigger>
          <TabsTrigger value="moderators">Moderators</TabsTrigger>
        </TabsList>

        {/* Moderation Queue */}
        <TabsContent value="queue">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Moderation Queue
              </CardTitle>
              <CardDescription>Items requiring moderator attention, sorted by priority</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Priority</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Age</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {moderationQueue.map((item) => (
                    <TableRow key={item.queueItemId}>
                      <TableCell>
                        <Badge variant={getPriorityColor(item.priority)}>{item.priority.toUpperCase()}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {item.queueType
                            .split('_')
                            .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                            .join(' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{item.description}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{item.status}</Badge>
                      </TableCell>
                      <TableCell>{formatTimeAgo(item.hoursSinceCreated)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trends */}
        <TabsContent value="trends">
          <ModerationTrendsChart trends={trends} />
        </TabsContent>

        {/* Top Reporters */}
        <TabsContent value="reporters">
          <Card>
            <CardHeader>
              <CardTitle>Top Reporters</CardTitle>
              <CardDescription>Users who report the most content</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Total Reports</TableHead>
                    <TableHead>Accuracy</TableHead>
                    <TableHead>Last 7 Days</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topReporters.map((reporter) => (
                    <TableRow key={reporter.userId}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={reporter.avatarUrl || undefined} />
                            <AvatarFallback>{reporter.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{reporter.username}</div>
                            <div className="text-sm text-muted-foreground">{reporter.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{reporter.totalReports}</TableCell>
                      <TableCell>
                        {reporter.accuracyPercentage ? (
                          <div className="flex items-center gap-2">
                            <Progress value={reporter.accuracyPercentage} className="w-16" />
                            <span className="text-sm">{reporter.accuracyPercentage}%</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">N/A</span>
                        )}
                      </TableCell>
                      <TableCell>{reporter.reportsLast7Days}</TableCell>
                      <TableCell>
                        <Badge variant={reporter.status === UserStatus.Active ? 'default' : 'destructive'}>
                          {reporter.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Most Reported Content */}
        <TabsContent value="reported">
          <Card>
            <CardHeader>
              <CardTitle>Most Reported Content</CardTitle>
              <CardDescription>Items receiving the most reports</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Content</TableHead>
                    <TableHead>Posted By</TableHead>
                    <TableHead>Total Reports</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mostReported.map((content) => (
                    <TableRow key={content.contentId}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{content.contentTitle}</div>
                          <Badge variant="outline">{content.itemType}</Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{content.posterUsername}</div>
                          <div className="text-sm text-muted-foreground">{content.posterEmail}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-center">
                          <div className="font-bold text-red-600">{content.totalReports}</div>
                          <div className="text-xs text-muted-foreground">{content.pendingReports} pending</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Badge variant="secondary">{content.resolvedReports} resolved</Badge>
                          <Badge variant="outline">{content.dismissedReports} dismissed</Badge>
                        </div>
                      </TableCell>
                      <TableCell>{new Date(content.contentCreatedDate).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* False Takers */}
        <TabsContent value="false-takers">
          <Card>
            <CardHeader>
              <CardTitle>Frequent False Takers</CardTitle>
              <CardDescription>Users with the most false takings</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Total False Takings</TableHead>
                    <TableHead>Last 7 Days</TableHead>
                    <TableHead>Avg Days Between</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {falseTakers.map((taker) => (
                    <TableRow key={taker.userId}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={taker.avatarUrl || undefined} />
                            <AvatarFallback>{taker.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{taker.username}</div>
                            <div className="text-sm text-muted-foreground">{taker.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-bold text-red-600">{taker.totalFalseTakings}</TableCell>
                      <TableCell>{taker.falseTakingsLast7Days}</TableCell>
                      <TableCell>
                        {taker.avgDaysBetweenFalseTakings
                          ? `${Math.round(taker.avgDaysBetweenFalseTakings)} days`
                          : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={taker.status === UserStatus.Active ? 'default' : 'destructive'}>
                          {taker.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Moderator Performance */}
        <TabsContent value="moderators">
          <Card>
            <CardHeader>
              <CardTitle>Moderator Performance</CardTitle>
              <CardDescription>Performance metrics for moderation team</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Moderator</TableHead>
                    <TableHead>Items Handled</TableHead>
                    <TableHead>Resolution Rate</TableHead>
                    <TableHead>Avg Time (hrs)</TableHead>
                    <TableHead>Last Activity</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {moderatorPerformance.map((mod) => (
                    <TableRow key={mod.userId}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{mod.moderatorUsername}</div>
                          <div className="text-sm text-muted-foreground">{mod.moderatorEmail}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {mod.lastActionDate ? new Date(mod.lastActionDate).toLocaleDateString() : 'Never'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AdminPageContainer>
  );
}
