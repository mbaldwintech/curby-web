import { SupportRequestCategory, SupportRequestPriority, SupportRequestStatus } from '@core/enumerations';
import { GenericRecord } from '@supa/types';

export interface SupportRequest extends GenericRecord {
  userId?: string | null;
  deviceId?: string | null;
  subject: string;
  message: string;
  category: SupportRequestCategory;
  priority: SupportRequestPriority;
  status: SupportRequestStatus;
  assignedTo?: string | null;
  assignedAt?: string | null;
  resolvedAt?: string | null;
  resolvedBy?: string | null;
  resolutionNotes?: string | null;
  customerSatisfaction?: number | null; // 1-5 rating
  customerFeedback?: string | null;
  appVersion?: string | null;
  deviceInfo?: Record<string, unknown> | null; // e.g., {"os": "iOS", "osVersion": "14.4", "deviceModel": "iPhone 12"}
  userAgent?: string | null;
  errorLogs?: string | null;
  reproductionSteps?: string | null;
  expectedBehavior?: string | null;
  actualBehavior?: string | null;
  escalatedAt?: string | null;
  escalationReason?: string | null;
  slaBreached: boolean;
  dueDate?: string | null;
  internalNotes?: string | null;
  tags: string[];
  relatedSupportRequestIds: string[];
}
