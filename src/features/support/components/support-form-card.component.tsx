import {
  Button,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  Label,
  TagInput,
  Textarea
} from '@core/components';
import { SupportRequestStatus, UserRole } from '@core/enumerations';
import { SupportRequestService } from '@core/services';
import { SupportRequest } from '@core/types';
import { useProfile } from '@features/users/hooks';
import { createClientService } from '@supa/utils/client';
import { BookHeart } from 'lucide-react';
import { useCallback, useMemo, useRef, useState } from 'react';

export interface SupportFormCardProps {
  supportRequest: SupportRequest;
  onSave?: (supportRequest: SupportRequest) => void;
  className?: string;
}

export const SupportFormCard: React.FC<SupportFormCardProps> = ({ supportRequest, onSave, className }) => {
  const supportRequestService = useRef(createClientService(SupportRequestService)).current;
  const [supportForm, setSupportForm] = useState<Partial<SupportRequest>>({
    reproductionSteps: supportRequest.reproductionSteps || '',
    expectedBehavior: supportRequest.expectedBehavior || '',
    actualBehavior: supportRequest.actualBehavior || '',
    internalNotes: supportRequest.internalNotes || '',
    tags: supportRequest.tags || [],
    relatedSupportRequestIds: supportRequest.relatedSupportRequestIds || []
  });
  const hasChanges = useMemo(() => {
    if (supportForm.reproductionSteps !== (supportRequest.reproductionSteps || '')) {
      return true;
    }
    if (supportForm.expectedBehavior !== (supportRequest.expectedBehavior || '')) {
      return true;
    }
    if (supportForm.actualBehavior !== (supportRequest.actualBehavior || '')) {
      return true;
    }
    if (supportForm.internalNotes !== (supportRequest.internalNotes || '')) {
      return true;
    }
    if (JSON.stringify(supportForm.tags) !== JSON.stringify(supportRequest.tags || [])) {
      return true;
    }
    if (
      JSON.stringify(supportForm.relatedSupportRequestIds) !==
      JSON.stringify(supportRequest.relatedSupportRequestIds || [])
    ) {
      return true;
    }
    return false;
  }, [supportForm, supportRequest]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const isInProgress = useMemo(
    () => [SupportRequestStatus.InProgress, SupportRequestStatus.WaitingForUser].includes(supportRequest?.status),
    [supportRequest]
  );

  const { profile } = useProfile();

  const isSupport = useMemo(() => {
    if (!supportRequest || !profile) return false;
    return supportRequest.assignedTo === profile.userId;
  }, [supportRequest, profile]);

  const isAdmin = useMemo(() => {
    if (!profile) return false;
    return profile.role === UserRole.Admin;
  }, [profile]);

  const disabled = useMemo(
    () => submitting || !supportRequest || !isInProgress || (!isSupport && !isAdmin),
    [submitting, supportRequest, isInProgress, isSupport, isAdmin]
  );

  const handleSave = useCallback(async () => {
    if (disabled) return;

    try {
      setSubmitting(true);
      const updatedSupportRequest = await supportRequestService.update(supportRequest.id, supportForm);
      if (onSave) {
        onSave(updatedSupportRequest);
      }
    } catch (err) {
      console.error('Error saving support request:', err);
      setError('Failed to save support request.');
    } finally {
      setSubmitting(false);
    }
  }, [supportRequest, supportForm, supportRequestService, onSave, disabled]);

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookHeart className="h-5 w-5" />
            Support Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookHeart className="h-5 w-5" />
          Support Details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="reproductionSteps" className="mb-1">
            Reproduction Steps
          </Label>
          <Textarea
            id="reproductionSteps"
            placeholder="Enter your detailed reproduction steps..."
            value={supportForm.reproductionSteps || ''}
            onChange={(e) => setSupportForm((prev) => ({ ...prev, reproductionSteps: e.target.value }))}
            rows={4}
            disabled={disabled}
          />
        </div>

        <div>
          <Label htmlFor="expectedBehavior" className="mb-1">
            Expected Behavior
          </Label>
          <Textarea
            id="expectedBehavior"
            placeholder="Enter your detailed expected behavior..."
            value={supportForm.expectedBehavior || ''}
            onChange={(e) => setSupportForm((prev) => ({ ...prev, expectedBehavior: e.target.value }))}
            rows={4}
            disabled={disabled}
          />
        </div>

        <div>
          <Label htmlFor="actualBehavior" className="mb-1">
            Actual Behavior
          </Label>
          <Textarea
            id="actualBehavior"
            placeholder="Enter your detailed actual behavior..."
            value={supportForm.actualBehavior || ''}
            onChange={(e) => setSupportForm((prev) => ({ ...prev, actualBehavior: e.target.value }))}
            rows={4}
            disabled={disabled}
          />
        </div>

        <div>
          <Label htmlFor="internalNotes" className="mb-1">
            Internal Notes
          </Label>
          <Textarea
            id="internalNotes"
            placeholder="Enter your internal notes..."
            value={supportForm.internalNotes || ''}
            onChange={(e) => setSupportForm((prev) => ({ ...prev, internalNotes: e.target.value }))}
            rows={4}
            disabled={disabled}
          />
        </div>

        <div>
          <Label htmlFor="internalNotes" className="mb-1">
            Internal Notes
          </Label>
          <TagInput value={supportForm.tags} onChange={(e) => setSupportForm((prev) => ({ ...prev, tags: e }))} />
        </div>
      </CardContent>
      <CardFooter className="flex-1 justify-end">
        <Button onClick={handleSave} disabled={disabled || !hasChanges}>
          {submitting ? 'Saving...' : 'Save'}
        </Button>
      </CardFooter>
    </Card>
  );
};
