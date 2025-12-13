'use client';

import {
  AdminPageContainer,
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CopyableStringCell,
  LinkButton,
  Separator
} from '@core/components';
import { TutorialViewStatus } from '@core/enumerations';
import { useAsyncMemo } from '@core/hooks';
import { TutorialService, TutorialViewService } from '@core/services';
import { Tutorial, TutorialView } from '@core/types';
import { cn } from '@core/utils';
import { DeviceCell } from '@features/devices/components';
import { ProfileCell } from '@features/users/components';
import { createClientService } from '@supa/utils/client';
import { format } from 'date-fns';
import { BookOpen, CheckCircle2, Eye, GraduationCap, Layers, ShieldCheck, SkipForward, XCircle } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useRef, useState } from 'react';

export default function TutorialViewDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const tutorialViewService = useRef(createClientService(TutorialViewService)).current;
  const tutorialService = useRef(createClientService(TutorialService)).current;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tutorialView, setTutorialView] = useState<TutorialView | null>(null);
  const [tutorial, setTutorial] = useState<Tutorial | null>(null);

  useAsyncMemo(async () => {
    setLoading(true);
    setError(null);
    try {
      const view = await tutorialViewService.getById(id);
      setTutorialView(view);

      // Fetch tutorial if available
      if (view.tutorialId) {
        const tutorial = await tutorialService.getByIdOrNull(view.tutorialId);
        setTutorial(tutorial);
      }
    } catch (error) {
      console.error('Error fetching tutorial view details:', error);
      setError('Failed to load tutorial view details.');
    } finally {
      setLoading(false);
    }
  }, [id, tutorialViewService, tutorialService]);

  if (!tutorialView) {
    return <AdminPageContainer title="Tutorial View Details" loading={loading} error={error} />;
  }

  if (error) {
    return <AdminPageContainer title="Tutorial View Details" loading={loading} error={error} />;
  }

  const getStatusIcon = (status: TutorialViewStatus) => {
    switch (status) {
      case TutorialViewStatus.Completed:
        return <CheckCircle2 className="h-5 w-5" />;
      case TutorialViewStatus.Viewed:
        return <Eye className="h-5 w-5" />;
      case TutorialViewStatus.Skipped:
        return <SkipForward className="h-5 w-5" />;
      case TutorialViewStatus.NotStarted:
      default:
        return <XCircle className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status: TutorialViewStatus) => {
    switch (status) {
      case TutorialViewStatus.Completed:
        return 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800';
      case TutorialViewStatus.Viewed:
        return 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800';
      case TutorialViewStatus.Skipped:
        return 'bg-gray-100 dark:bg-gray-900/20 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-800';
      case TutorialViewStatus.NotStarted:
      default:
        return 'bg-amber-100 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800';
    }
  };

  const getStatusBadgeVariant = (status: TutorialViewStatus): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (status) {
      case TutorialViewStatus.Completed:
        return 'default';
      case TutorialViewStatus.Viewed:
        return 'secondary';
      case TutorialViewStatus.Skipped:
        return 'outline';
      case TutorialViewStatus.NotStarted:
      default:
        return 'secondary';
    }
  };

  const formatStatusLabel = (status: TutorialViewStatus) => {
    switch (status) {
      case TutorialViewStatus.NotStarted:
        return 'Not Started';
      case TutorialViewStatus.Viewed:
        return 'Viewed';
      case TutorialViewStatus.Skipped:
        return 'Skipped';
      case TutorialViewStatus.Completed:
        return 'Completed';
      default:
        return status;
    }
  };

  return (
    <AdminPageContainer title="Tutorial View Details" loading={loading} error={error}>
      {/* Status Overview */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'flex items-center justify-center w-12 h-12 rounded-full',
                getStatusColor(tutorialView.status)
              )}
            >
              {getStatusIcon(tutorialView.status)}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <CardTitle>Tutorial View Status</CardTitle>
                <Badge variant={getStatusBadgeVariant(tutorialView.status)} className="h-6">
                  {formatStatusLabel(tutorialView.status)}
                </Badge>
              </div>
              <CardDescription>
                {tutorialView.status === TutorialViewStatus.Completed
                  ? 'User completed this tutorial'
                  : tutorialView.status === TutorialViewStatus.Viewed
                    ? 'User viewed this tutorial'
                    : tutorialView.status === TutorialViewStatus.Skipped
                      ? 'User skipped this tutorial'
                      : 'Tutorial not yet started'}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Tutorial Information */}
      {tutorial && (
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <CardTitle>Tutorial Information</CardTitle>
                <CardDescription>Details about the tutorial being viewed</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Tutorial Key</p>
                  <CopyableStringCell value={tutorial.key} />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Status</p>
                  <Badge variant={tutorial.active ? 'default' : 'secondary'}>
                    {tutorial.active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>

              <Separator />

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Title</p>
                <p className="text-sm font-semibold">{tutorial.title}</p>
              </div>

              {tutorial.description && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Description</p>
                    <div className="bg-muted/50 rounded-lg p-3 border">
                      <p className="text-sm leading-relaxed">{tutorial.description}</p>
                    </div>
                  </div>
                </>
              )}

              {tutorial.roles && tutorial.roles.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Target Roles</p>
                    <div className="flex flex-wrap gap-2">
                      {tutorial.roles.map((role) => (
                        <Badge key={role} variant="outline" className="font-normal">
                          <ShieldCheck className="h-3 w-3 mr-1" />
                          {role}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <Separator />

              <div>
                <LinkButton variant="outline" size="sm" href={`/admin/tutorials/${tutorial.id}`}>
                  <Layers className="h-4 w-4 mr-2" />
                  View Tutorial Details
                </LinkButton>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tutorial View Details */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
              <GraduationCap className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>View Details</CardTitle>
              <CardDescription>Information about this tutorial view session</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">View ID</p>
                <CopyableStringCell value={tutorialView.id} />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Tutorial ID</p>
                <CopyableStringCell value={tutorialView.tutorialId} />
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">User</p>
                {tutorialView.userId ? (
                  <ProfileCell userId={tutorialView.userId} />
                ) : (
                  <p className="text-sm text-muted-foreground">Anonymous User</p>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Device</p>
                {tutorialView.deviceId ? (
                  <DeviceCell deviceId={tutorialView.deviceId} />
                ) : (
                  <p className="text-sm text-muted-foreground">No device specified</p>
                )}
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">View Status</p>
                <div className="flex items-center gap-2">
                  {getStatusIcon(tutorialView.status)}
                  <span className="text-sm font-medium">{formatStatusLabel(tutorialView.status)}</span>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Status Badge</p>
                <Badge variant={getStatusBadgeVariant(tutorialView.status)}>
                  {formatStatusLabel(tutorialView.status)}
                </Badge>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">First Viewed</p>
                <p className="text-sm">{format(new Date(tutorialView.createdAt), 'PPpp')}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Last Updated</p>
                <p className="text-sm">{format(new Date(tutorialView.updatedAt), 'PPpp')}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Missing Tutorial Warning */}
      {!tutorial && (
        <Card className="mt-6 border-amber-200 dark:border-amber-800">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/20">
                <XCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <CardTitle className="text-amber-600 dark:text-amber-400">Tutorial Not Found</CardTitle>
                <CardDescription>The tutorial referenced by this view could not be loaded</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Tutorial ID: <span className="font-mono text-xs">{tutorialView.tutorialId}</span>
            </p>
          </CardContent>
        </Card>
      )}
    </AdminPageContainer>
  );
}
