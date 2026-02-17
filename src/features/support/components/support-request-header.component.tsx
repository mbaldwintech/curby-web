'use client';

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Label,
  Textarea
} from '@core/components';
import { SupportRequestStatus, UserRole } from '@core/enumerations';
import { useConfirmDialog } from '@core/providers';
import { SupportRequestService } from '@core/services';
import { SupportRequest } from '@core/types';
import { useProfile } from '@features/users/hooks';
import { createClientService } from '@supa/utils/client';
import { ChevronDown, Play } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useRef } from 'react';
import { toast } from 'sonner';
import { SupportRequestStatusBadge } from './support-request-status-badge.component';
import { createLogger, formatDateTime } from '@core/utils';

const logger = createLogger('SupportRequestHeader');

interface SupportRequestHeaderProps {
  supportRequest: SupportRequest;
  onUpdate?: () => void;
}

export function SupportRequestHeader({ supportRequest, onUpdate }: SupportRequestHeaderProps) {
  const { profile } = useProfile();
  const router = useRouter();
  const supportRequestService = useRef(createClientService(SupportRequestService)).current;
  const { open: openConfirmDialog } = useConfirmDialog();

  const isAdmin = useMemo(() => {
    if (!profile) return false;
    return profile.role === UserRole.Admin;
  }, [profile]);

  const isSupport = useMemo(() => {
    if (!profile) return false;
    return profile.role === UserRole.Support;
  }, [profile]);

  const assignToMe = useCallback(async () => {
    if (!supportRequest || !profile || (!isSupport && !isAdmin) || supportRequest.assignedTo === profile.userId) {
      return;
    }

    try {
      await supportRequestService.update(supportRequest.id, {
        assignedTo: profile.userId,
        assignedAt: new Date().toISOString()
      });
      onUpdate?.();
    } catch (error) {
      logger.error('Failed to assign support request to me', error);
      toast.error('Failed to assign support request to me. Please try again.');
    }
  }, [supportRequest, profile, isSupport, isAdmin, supportRequestService, onUpdate]);

  const startSupport = useCallback(async () => {
    if (
      !supportRequest ||
      !profile ||
      (!isSupport && !isAdmin) ||
      supportRequest.assignedTo !== profile.userId ||
      supportRequest.status !== SupportRequestStatus.Open
    ) {
      return;
    }

    try {
      await supportRequestService.update(supportRequest.id, {
        status: SupportRequestStatus.InProgress
      });
      onUpdate?.();
    } catch (error) {
      logger.error('Failed to start support', error);
      toast.error('Failed to start support. Please try again.');
    }
  }, [supportRequest, profile, isSupport, isAdmin, supportRequestService, onUpdate]);

  const markAsWaitingForUser = useCallback(async () => {
    if (
      !supportRequest ||
      !profile ||
      (!isSupport && !isAdmin) ||
      supportRequest.assignedTo !== profile.userId ||
      supportRequest.status !== SupportRequestStatus.InProgress
    ) {
      return;
    }

    try {
      await supportRequestService.update(supportRequest.id, {
        status: SupportRequestStatus.WaitingForUser
      });
      onUpdate?.();
    } catch (error) {
      logger.error('Failed to mark as waiting for user', error);
      toast.error('Failed to mark as waiting for user. Please try again.');
    }
  }, [supportRequest, profile, isSupport, isAdmin, supportRequestService, onUpdate]);

  const markAsResolved = useCallback(async () => {
    if (
      !supportRequest ||
      !profile ||
      (!isSupport && !isAdmin) ||
      supportRequest.assignedTo !== profile.userId ||
      supportRequest.status === SupportRequestStatus.Resolved ||
      supportRequest.status === SupportRequestStatus.Closed
    ) {
      return;
    }

    try {
      openConfirmDialog({
        title: 'Confirm Mark as Resolved',
        message: 'Are you sure you want to mark this support request as resolved?',
        initialData: '',
        Body: ({ formState, setFormState }) => {
          return (
            <div className="flex flex-col space-y-2">
              <Label htmlFor="resolutionNotes">Resolution Notes</Label>
              <Textarea
                id="resolutionNotes"
                value={formState || ''}
                onChange={(e) => setFormState(e.target.value)}
                placeholder="Enter resolution notes..."
                className="mt-1"
              />
            </div>
          );
        },
        confirmButtonText: 'Resolve',
        variant: 'default',
        onConfirm: async (data) => {
          await supportRequestService.update(supportRequest.id, {
            status: SupportRequestStatus.Resolved,
            resolvedBy: profile.userId,
            resolvedAt: new Date().toISOString(),
            resolutionNotes: data
          });
          onUpdate?.();
        }
      });
    } catch (error) {
      logger.error('Failed to mark as resolved', error);
      toast.error('Failed to mark as resolved. Please try again.');
    }
  }, [supportRequest, profile, isSupport, isAdmin, supportRequestService, openConfirmDialog, onUpdate]);

  const markAsClosed = useCallback(async () => {
    if (
      !supportRequest ||
      !profile ||
      (!isSupport && !isAdmin) ||
      supportRequest.assignedTo !== profile.userId ||
      supportRequest.status !== SupportRequestStatus.Resolved
    ) {
      return;
    }

    try {
      await supportRequestService.update(supportRequest.id, {
        status: SupportRequestStatus.Closed
      });
      onUpdate?.();
    } catch (error) {
      logger.error('Failed to mark as closed', error);
      toast.error('Failed to mark as closed. Please try again.');
    }
  }, [supportRequest, profile, isSupport, isAdmin, supportRequestService, onUpdate]);

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <SupportRequestStatusBadge status={supportRequest.status} />
        <span className="text-sm text-muted-foreground">Created {formatDateTime(supportRequest.createdAt)}</span>
      </div>
      <div className="flex gap-2">
        {supportRequest.status === SupportRequestStatus.Open && (
          <Button onClick={startSupport}>
            <Play className="h-4 w-4 mr-2" />
            Start Support
          </Button>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              Actions <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuGroup>
              {[
                SupportRequestStatus.Open,
                SupportRequestStatus.InProgress,
                SupportRequestStatus.WaitingForUser
              ].includes(supportRequest.status) &&
                profile &&
                supportRequest.assignedTo !== profile?.userId && (
                  <DropdownMenuItem onClick={assignToMe}>Assign to Me</DropdownMenuItem>
                )}
              {supportRequest.status === SupportRequestStatus.InProgress &&
                profile &&
                supportRequest.assignedTo === profile?.userId && (
                  <DropdownMenuItem onClick={markAsWaitingForUser}>Mark as Waiting for User</DropdownMenuItem>
                )}
              {supportRequest.status === SupportRequestStatus.InProgress &&
                supportRequest.assignedTo === profile?.userId && (
                  <DropdownMenuItem onClick={markAsResolved}>Mark as Resolved</DropdownMenuItem>
                )}
              {isAdmin && supportRequest.status !== SupportRequestStatus.Closed && (
                <DropdownMenuItem onClick={markAsClosed}>Mark as Closed</DropdownMenuItem>
              )}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button variant="outline" onClick={() => router.push('/admin/support/requests/my-queue')}>
          Back to Queue
        </Button>
      </div>
    </div>
  );
}
