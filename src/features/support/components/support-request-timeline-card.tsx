'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@core/components';
import { SupportRequest } from '@core/types';
import { formatDateTime } from '@core/utils';
import { CheckCircle2, Clock, UserCheck, UserX } from 'lucide-react';

interface SupportRequestTimelineCardProps {
  supportRequest: SupportRequest;
}

interface TimelineEvent {
  label: string;
  timestamp?: string | null;
  icon: React.ReactNode;
  color: string;
}

export function SupportRequestTimelineCard({ supportRequest }: SupportRequestTimelineCardProps) {
  const events: TimelineEvent[] = [
    {
      label: 'Request Created',
      timestamp: supportRequest.createdAt,
      icon: <Clock className="h-4 w-4" />,
      color: 'text-muted-foreground'
    },
    supportRequest.assignedAt
      ? {
          label: 'Assigned',
          timestamp: supportRequest.assignedAt,
          icon: <UserCheck className="h-4 w-4" />,
          color: 'text-blue-500'
        }
      : null,
    supportRequest.escalatedAt
      ? {
          label: 'Escalated',
          timestamp: supportRequest.escalatedAt,
          icon: <UserX className="h-4 w-4" />,
          color: 'text-orange-500'
        }
      : null,
    supportRequest.resolvedAt
      ? {
          label: 'Resolved',
          timestamp: supportRequest.resolvedAt,
          icon: <CheckCircle2 className="h-4 w-4" />,
          color: 'text-green-500'
        }
      : null
  ].filter((event): event is TimelineEvent => event !== null);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Timeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {events.map((event, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className={`mt-0.5 ${event.color}`}>{event.icon}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{event.label}</p>
                {event.timestamp && <p className="text-xs text-muted-foreground">{formatDateTime(event.timestamp)}</p>}
              </div>
            </div>
          ))}

          {supportRequest.dueDate && (
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">Due Date</p>
                  <p className="text-xs text-muted-foreground">{formatDateTime(supportRequest.dueDate)}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
