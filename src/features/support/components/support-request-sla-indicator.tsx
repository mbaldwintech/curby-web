'use client';

import { Badge, Card, CardContent, CardHeader, CardTitle } from '@core/components';
import { SupportSlaConfigService } from '@core/services';
import { SupportRequest } from '@core/types';
import { createClientService } from '@supa/utils/client';
import { AlertTriangle, Clock } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { createLogger } from '@core/utils';

const logger = createLogger('SupportRequestSlaIndicator');

interface SupportRequestSlaIndicatorProps {
  supportRequest: SupportRequest;
}

export function SupportRequestSlaIndicator({ supportRequest }: SupportRequestSlaIndicatorProps) {
  const slaService = useRef(createClientService(SupportSlaConfigService)).current;
  const [slaStatus, setSlaStatus] = useState<{
    responseBreached: boolean;
    resolutionBreached: boolean;
    responseTimeRemaining?: number;
    resolutionTimeRemaining?: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkSla() {
      try {
        const status = await slaService.checkSlaStatus(
          supportRequest.id,
          typeof supportRequest.createdAt === 'string'
            ? supportRequest.createdAt
            : supportRequest.createdAt.toISOString(),
          supportRequest.category,
          supportRequest.priority
        );
        setSlaStatus(status);
      } catch (error) {
        logger.error('Failed to check SLA status:', error);
      } finally {
        setLoading(false);
      }
    }

    checkSla();
    // Check SLA every minute
    const interval = setInterval(checkSla, 60000);

    return () => clearInterval(interval);
  }, [supportRequest, slaService]);

  if (loading || !slaStatus) {
    return null;
  }

  const formatTimeRemaining = (hours?: number) => {
    if (hours === undefined) return 'N/A';
    if (hours < 1) return `${Math.floor(hours * 60)}m`;
    if (hours < 24) return `${Math.floor(hours)}h`;
    return `${Math.floor(hours / 24)}d`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          SLA Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-foreground/70">Response SLA</span>
          {slaStatus.responseBreached ? (
            <Badge variant="destructive" className="gap-1">
              <AlertTriangle className="h-3 w-3" />
              Breached
            </Badge>
          ) : (
            <Badge variant="default" className="gap-1">
              <Clock className="h-3 w-3" />
              {formatTimeRemaining(slaStatus.responseTimeRemaining)} remaining
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-foreground/70">Resolution SLA</span>
          {slaStatus.resolutionBreached ? (
            <Badge variant="destructive" className="gap-1">
              <AlertTriangle className="h-3 w-3" />
              Breached
            </Badge>
          ) : (
            <Badge variant="default" className="gap-1">
              <Clock className="h-3 w-3" />
              {formatTimeRemaining(slaStatus.resolutionTimeRemaining)} remaining
            </Badge>
          )}
        </div>

        {supportRequest.slaBreached && (
          <div className="mt-2 p-2 bg-destructive/10 border border-destructive/20 rounded-md">
            <p className="text-xs text-destructive">⚠ SLA has been breached for this request</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
