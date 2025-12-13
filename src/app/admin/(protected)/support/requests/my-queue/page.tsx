'use client';

import { AdminPageContainer, Button } from '@core/components';
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemHeader,
  ItemMedia,
  ItemSeparator,
  ItemTitle
} from '@core/components/base/item';
import { Skeleton } from '@core/components/base/skeleton';
import { SupportRequestStatus } from '@core/enumerations';
import { DeviceService, ProfileService, SupportRequestService } from '@core/services';
import { Device, Profile, SupportRequest } from '@core/types';
import { formatDateTime } from '@core/utils';
import {
  SupportRequestCategoryBadge,
  SupportRequestPriorityBadge,
  SupportRequestStatusBadge
} from '@features/support/components';
import { useAuth } from '@supa/providers';
import { createClientService } from '@supa/utils/client';
import { AlertCircle, ChevronRight, Eye, FileText, MapPin, RefreshCw, Shield } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

export default function MySupportRequestQueuePage() {
  const { user } = useAuth();
  const router = useRouter();
  const supportRequestService = useRef(createClientService(SupportRequestService)).current;
  const profileService = useRef(createClientService(ProfileService)).current;
  const deviceService = useRef(createClientService(DeviceService)).current;
  const [supportRequests, setSupportRequests] = useState<SupportRequest[]>([]);
  const [profiles, setProfiles] = useState<Map<string, Profile>>(new Map());
  const [devices, setDevices] = useState<Map<string, Device>>(new Map());
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const loadSupportRequests = useCallback(
    async (reset: boolean = false) => {
      if (!user) return;

      try {
        if (reset) {
          setLoading(true);
        } else {
          setLoadingMore(true);
        }
        setError(null);

        const supportRequests = await supportRequestService.getAll(
          [
            { column: 'assignedTo', operator: 'eq', value: user.id },
            {
              column: 'status',
              operator: 'in',
              value: [SupportRequestStatus.Open, SupportRequestStatus.InProgress, SupportRequestStatus.WaitingForUser]
            }
          ],
          { column: 'createdAt', ascending: false },
          undefined,
          20
        );

        // Load associated items for the reviews
        const profileResults = await Promise.all(
          supportRequests
            .filter((r) => r.userId)
            .map(async (supportRequest) => {
              try {
                const profile = await profileService.findByUserId(supportRequest.userId!);
                return { userId: supportRequest.userId!, profile };
              } catch (error) {
                console.error(`Failed to load profile for user ${supportRequest.userId}`, error);
                return null;
              }
            })
        );
        const deviceResults = await Promise.all(
          supportRequests
            .filter((r) => r.deviceId)
            .map(async (supportRequest) => {
              try {
                const device = await deviceService.getById(supportRequest.deviceId!);
                return { deviceId: supportRequest.deviceId!, device };
              } catch (error) {
                console.error(`Failed to load device ${supportRequest.deviceId}`, error);
                return null;
              }
            })
        );

        const profilesMap = new Map<string, Profile>();
        profileResults.forEach((result) => {
          if (result) {
            profilesMap.set(result.userId, result.profile);
          }
        });

        const devicesMap = new Map<string, Device>();
        deviceResults.forEach((result) => {
          if (result) {
            devicesMap.set(result.deviceId, result.device);
          }
        });

        if (reset) {
          setSupportRequests(supportRequests);
          setProfiles(profilesMap);
          setDevices(devicesMap);
        } else {
          setSupportRequests((prev) => [...prev, ...supportRequests]);
          setProfiles((prev) => new Map([...prev, ...profilesMap]));
          setDevices((prev) => new Map([...prev, ...devicesMap]));
        }

        setHasMore(supportRequests.length === 20);
      } catch (error) {
        console.error('Failed to load support requests', error);
        setError('Failed to load support requests. Please try again later.');
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [supportRequestService, profileService, deviceService, user]
  );

  const handleStartRequest = useCallback(
    async (supportRequestId: string) => {
      setProcessingId(supportRequestId);
      try {
        await supportRequestService.update(supportRequestId, {
          status: SupportRequestStatus.InProgress
        });
        // Refresh the list
        await loadSupportRequests(true);
      } catch (error) {
        console.error('Failed to start support request', error);
      } finally {
        setProcessingId(null);
      }
    },
    [supportRequestService, loadSupportRequests]
  );

  useEffect(() => {
    loadSupportRequests(true);
  }, [loadSupportRequests]);

  if (loading && supportRequests.length === 0) {
    return (
      <AdminPageContainer title="My Support Request Queue">
        <div className="space-y-4">
          {[...Array(3)].map((_, idx) => (
            <div key={idx} className="border rounded-lg p-4 bg-background">
              <div className="flex items-center gap-3 mb-2">
                <Skeleton className="w-12 h-12 rounded-md" />
                <div className="flex-1">
                  <Skeleton className="h-5 w-1/2 mb-2" />
                  <Skeleton className="h-4 w-1/3" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-2">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-4 w-full" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </AdminPageContainer>
    );
  }

  if (error) {
    return (
      <AdminPageContainer title="My Support Request Queue">
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <AlertCircle className="h-12 w-12 text-destructive mb-4" />
          <h3 className="text-lg font-semibold mb-2">Error Loading Support Requests</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button
            onClick={() => loadSupportRequests(true)}
            variant="outline"
            aria-label="Retry loading support requests"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </AdminPageContainer>
    );
  }

  return (
    <AdminPageContainer title="My Support Request Queue">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold">My Support Request Queue</h2>
        <Button onClick={() => loadSupportRequests(true)} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {supportRequests.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <Shield className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Support Requests Pending</h3>
          <p className="text-muted-foreground mb-2">
            You don&apos;t have any support requests assigned to you at the moment.
          </p>
          <Button onClick={() => loadSupportRequests(true)} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Check Again
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <ItemGroup className="space-y-4">
            {supportRequests.map((supportRequest, index) => {
              const profile = supportRequest.userId ? profiles.get(supportRequest.userId) : null;
              const device = supportRequest.deviceId ? devices.get(supportRequest.deviceId) : null;

              return (
                <div key={supportRequest.id}>
                  <Item
                    variant="outline"
                    className="hover:bg-accent/50 transition-colors"
                    onClick={() => router.push(`/admin/support/requests/${supportRequest.id}`)}
                  >
                    <ItemHeader>
                      <div className="flex items-center gap-4">
                        {/* Item Image or Icon */}
                        {profile?.avatarUrl ? (
                          <ItemMedia variant="image">
                            <Image
                              src={profile.avatarUrl}
                              alt={profile.username || 'User Avatar'}
                              fill
                              className="object-cover"
                              sizes="56px"
                            />
                          </ItemMedia>
                        ) : profile ? (
                          <ItemMedia variant="icon">
                            {profile?.username ? profile.username.charAt(0).toUpperCase() : '?'}
                          </ItemMedia>
                        ) : device ? (
                          <ItemMedia variant="icon">{device.deviceName ?? '?'}</ItemMedia>
                        ) : (
                          <ItemMedia variant="icon">
                            <MapPin className="h-7 w-7" />
                          </ItemMedia>
                        )}
                        <ItemContent className="flex-1 min-w-0">
                          <ItemTitle className="flex items-center gap-2 min-w-0">
                            <button
                              className="text-left w-full focus:outline-none flex items-center gap-1 min-w-0"
                              style={{ background: 'none', border: 0, padding: 0, margin: 0 }}
                              onClick={() => router.push(`/admin/support/requests/${supportRequest.id}`)}
                              tabIndex={0}
                              aria-label={`View details for support request ${supportRequest.subject}`}
                            >
                              <span className="truncate block max-w-xs md:max-w-md" title={supportRequest.subject}>
                                {supportRequest.subject}
                              </span>
                              <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            </button>
                            <SupportRequestStatusBadge status={supportRequest.status} />
                          </ItemTitle>
                          {profile?.username && (
                            <div
                              className="text-xs text-muted-foreground truncate max-w-xs md:max-w-md"
                              title={profile.username}
                            >
                              {profile.username}
                            </div>
                          )}
                          <ItemDescription className="flex flex-wrap gap-2 mt-1">
                            <SupportRequestCategoryBadge category={supportRequest.category} />
                            <SupportRequestPriorityBadge priority={supportRequest.priority} />
                          </ItemDescription>
                        </ItemContent>
                      </div>
                      <ItemActions>
                        {supportRequest.status === SupportRequestStatus.Open && (
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStartRequest(supportRequest.id);
                            }}
                            size="sm"
                            className="ml-2"
                            disabled={processingId === supportRequest.id}
                            aria-label="Start Support"
                          >
                            {processingId === supportRequest.id ? (
                              <>
                                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                Starting...
                              </>
                            ) : (
                              <>
                                <Eye className="h-4 w-4 mr-2" />
                                Start Support
                              </>
                            )}
                          </Button>
                        )}
                        {supportRequest.status === SupportRequestStatus.InProgress && (
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/admin/support/requests/${supportRequest.id}`);
                            }}
                            size="sm"
                            variant="outline"
                            className="ml-2"
                            aria-label="Continue Support"
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            Continue Support
                          </Button>
                        )}
                      </ItemActions>
                    </ItemHeader>

                    {supportRequest.assignedAt && (
                      <div className="w-full text-sm text-muted-foreground">
                        <span className="font-medium">Review Started:</span> {formatDateTime(supportRequest.assignedAt)}
                      </div>
                    )}
                  </Item>
                  {index < supportRequests.length - 1 && <ItemSeparator />}
                </div>
              );
            })}
          </ItemGroup>

          {hasMore && (
            <div className="flex justify-center pt-4">
              <Button onClick={() => loadSupportRequests(false)} variant="outline" disabled={loadingMore}>
                {loadingMore ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Loading More...
                  </>
                ) : (
                  'Load More'
                )}
              </Button>
            </div>
          )}
        </div>
      )}
    </AdminPageContainer>
  );
}
