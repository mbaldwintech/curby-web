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
  Separator
} from '@core/components';
import { FeedbackType } from '@core/enumerations';
import { useDataQuery } from '@core/hooks';
import { FeedbackService } from '@core/services';
import { cn } from '@core/utils';
import { ProfileCell } from '@features/users/components';
import { createClientService } from '@supa/utils/client';
import { format } from 'date-fns';
import { AlertCircle, CheckCircle2, Clock, HelpCircle, Lightbulb, MessageSquare, User } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useRef } from 'react';

export default function FeedbackDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const feedbackService = useRef(createClientService(FeedbackService)).current;
  const {
    data: feedback,
    loading,
    error
  } = useDataQuery(async () => {
    return feedbackService.getById(id);
  }, [id]);

  if (loading) {
    return <AdminPageContainer title="Feedback Details" loading={loading} />;
  }

  if (error) {
    return <AdminPageContainer title="Feedback Details" error={error} />;
  }

  if (!feedback) {
    return <AdminPageContainer title="Feedback Details">Feedback not found.</AdminPageContainer>;
  }

  const getTypeIcon = (type?: FeedbackType) => {
    switch (type) {
      case FeedbackType.Bug:
        return <AlertCircle className="h-5 w-5" />;
      case FeedbackType.Feature:
        return <Lightbulb className="h-5 w-5" />;
      case FeedbackType.Question:
        return <HelpCircle className="h-5 w-5" />;
      case FeedbackType.General:
      default:
        return <MessageSquare className="h-5 w-5" />;
    }
  };

  const getTypeColor = (type?: FeedbackType) => {
    switch (type) {
      case FeedbackType.Bug:
        return 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800';
      case FeedbackType.Feature:
        return 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800';
      case FeedbackType.Question:
        return 'bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800';
      case FeedbackType.General:
      default:
        return 'bg-gray-100 dark:bg-gray-900/20 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-800';
    }
  };

  const getTypeBadgeVariant = (type?: FeedbackType): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (type) {
      case FeedbackType.Bug:
        return 'destructive';
      case FeedbackType.Feature:
        return 'default';
      case FeedbackType.Question:
        return 'secondary';
      case FeedbackType.General:
      default:
        return 'outline';
    }
  };

  return (
    <AdminPageContainer title="Feedback Details" loading={loading} error={error}>
      {/* Status Overview */}
      <Card className="mb-4">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className={cn('flex items-center justify-center w-12 h-12 rounded-full', getTypeColor(feedback.type))}>
              {getTypeIcon(feedback.type)}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <CardTitle>
                  {feedback.type ? feedback.type.charAt(0).toUpperCase() + feedback.type.slice(1) : 'General'} Feedback
                </CardTitle>
                <Badge variant={feedback.resolved ? 'default' : 'secondary'} className="h-6">
                  {feedback.resolved ? (
                    <>
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Resolved
                    </>
                  ) : (
                    <>
                      <Clock className="h-3 w-3 mr-1" />
                      Unresolved
                    </>
                  )}
                </Badge>
              </div>
              <CardDescription>Submitted {format(new Date(feedback.createdAt), 'PPpp')}</CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Feedback Message */}
      <Card className="mb-4">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
              <MessageSquare className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Message</CardTitle>
              <CardDescription>User feedback content</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/50 rounded-lg p-4 border">
            <p className="whitespace-pre-wrap text-sm leading-relaxed">{feedback.message}</p>
          </div>
        </CardContent>
      </Card>

      {/* Feedback Details */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Feedback Information</CardTitle>
              <CardDescription>Details about this feedback submission</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Feedback ID</p>
                <CopyableStringCell value={feedback.id} />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Type</p>
                <Badge variant={getTypeBadgeVariant(feedback.type)} className="text-sm">
                  {feedback.type ? feedback.type.charAt(0).toUpperCase() + feedback.type.slice(1) : 'General'}
                </Badge>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Submitted By</p>
                {feedback.userId ? (
                  <ProfileCell userId={feedback.userId} />
                ) : (
                  <p className="text-sm text-muted-foreground">Anonymous User</p>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Status</p>
                <div className="flex items-center gap-2">
                  {feedback.resolved ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                      <span className="text-sm font-medium text-green-600 dark:text-green-400">Resolved</span>
                    </>
                  ) : (
                    <>
                      <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                      <span className="text-sm font-medium text-amber-600 dark:text-amber-400">Awaiting Review</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Created At</p>
                <p className="text-sm">{format(new Date(feedback.createdAt), 'PPpp')}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Last Updated</p>
                <p className="text-sm">{format(new Date(feedback.updatedAt), 'PPpp')}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </AdminPageContainer>
  );
}
