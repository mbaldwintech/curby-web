'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@core/components';
import { SupportRequest } from '@core/types';
import { Smartphone } from 'lucide-react';

interface SupportRequestAdditionalDetailsCardProps {
  supportRequest: SupportRequest;
}

export function SupportRequestAdditionalDetailsCard({ supportRequest }: SupportRequestAdditionalDetailsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="h-5 w-5" />
          Additional Request Details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div>
          <h3 className="text-sm text-foreground/70">App Version</h3>
          <p>{supportRequest.appVersion ?? 'Not available'}</p>
        </div>
        <div>
          <h3 className="text-sm text-foreground/70">Device Info</h3>
          <pre className="whitespace-pre-wrap break-words font-mono text-sm bg-muted/50 p-2 rounded-md">
            {JSON.stringify(supportRequest.deviceInfo, null, 2)}
          </pre>
        </div>
      </CardContent>
    </Card>
  );
}
