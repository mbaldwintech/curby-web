'use client';

import { AdminPageContainer } from '@core/components';
import { SupportRequestService } from '@core/services';
import { SupportRequest } from '@core/types';
import { DeviceCard } from '@features/devices/components';
import {
  SupportFormCard,
  SupportRequestAdditionalDetailsCard,
  SupportRequestDetailsCard,
  SupportRequestHeader,
  SupportRequestMessagesCard,
  SupportRequestSlaIndicator,
  SupportRequestTimelineCard
} from '@features/support/components';
import { ProfileCard } from '@features/users/components';
import { createClientService } from '@supa/utils/client';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createLogger } from '@core/utils';

const logger = createLogger('SupportRequestDetailPage');

export default function SupportRequestPage() {
  const { id } = useParams<{ id: string }>();
  const supportRequestService = useRef(createClientService(SupportRequestService)).current;

  const [supportRequest, setSupportRequest] = useState<SupportRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSupportRequest = useCallback(() => {
    if (!id) {
      setError('No support request ID provided.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const unsubscribe = supportRequestService.subscribeToRowById(id, (supportRequest) => {
        setSupportRequest(supportRequest);
        setLoading(false);
      });
      return unsubscribe;
    } catch (err) {
      logger.error('Failed to load support request:', err);
      setError('Failed to load support request.');
      setLoading(false);
    }
  }, [id, supportRequestService]);

  useEffect(() => {
    return loadSupportRequest();
  }, [loadSupportRequest]);

  return (
    <AdminPageContainer title="Support Request" loading={loading} error={error} retry={loadSupportRequest}>
      {supportRequest && (
        <div className="space-y-6">
          {/* Header */}
          <SupportRequestHeader supportRequest={supportRequest} />

          {error && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="text-destructive text-sm">{error}</p>
            </div>
          )}

          <div
            className={`grid grid-cols-1 md:grid-cols-${2 + (supportRequest.userId ? 1 : 0) + (supportRequest.deviceId ? 1 : 0)} gap-6`}
          >
            <SupportRequestDetailsCard supportRequest={supportRequest} />

            <SupportRequestAdditionalDetailsCard supportRequest={supportRequest} />

            {supportRequest.userId && <ProfileCard userId={supportRequest.userId} />}

            {supportRequest.deviceId && <DeviceCard deviceId={supportRequest.deviceId} />}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start md:auto-rows-min">
            {/* Left column */}
            <div className="space-y-6">
              <SupportRequestSlaIndicator supportRequest={supportRequest} />
              <SupportRequestTimelineCard supportRequest={supportRequest} />
              <SupportFormCard supportRequest={supportRequest} />
            </div>

            {/* Right column: Messages card fills the row height, scrolls for overflow */}
            <div className="col-span-2 h-full min-h-0 min-w-0">
              <SupportRequestMessagesCard supportRequest={supportRequest} />
            </div>
          </div>
        </div>
      )}
    </AdminPageContainer>
  );
}
