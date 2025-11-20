import { SupportRequestCategory, SupportRequestPriority, SupportRequestStatus } from '@core/enumerations';
import { GenericRecord, GenericRecordMetadata, GenericRecordMetadataBase } from '@supa/types';

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
  customerSatisfaction?: 1 | 2 | 3 | 4 | 5 | null; // 1-5 rating
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

export const SupportRequestMetadata: GenericRecordMetadata<SupportRequest> = {
  userId: {
    isArray: false,
    isNullable: false,
    type: 'string',
    searchable: false,
    sortable: true,
    filterable: true
  },
  deviceId: {
    isArray: false,
    isNullable: false,
    type: 'string',
    searchable: false,
    sortable: true,
    filterable: true
  },
  subject: {
    isArray: false,
    isNullable: false,
    type: 'string',
    searchable: true,
    sortable: false,
    filterable: false
  },
  message: {
    isArray: false,
    isNullable: false,
    type: 'string',
    searchable: true,
    sortable: false,
    filterable: false
  },
  category: {
    isArray: false,
    isNullable: false,
    type: 'string',
    searchable: true,
    sortable: true,
    filterable: true
  },
  priority: {
    isArray: false,
    isNullable: false,
    type: 'string',
    searchable: true,
    sortable: true,
    filterable: true
  },
  status: {
    isArray: false,
    isNullable: false,
    type: 'string',
    searchable: true,
    sortable: true,
    filterable: true
  },
  assignedTo: {
    isArray: false,
    isNullable: true,
    type: 'string',
    searchable: false,
    sortable: true,
    filterable: true
  },
  assignedAt: {
    isArray: false,
    isNullable: true,
    type: 'timestamp',
    searchable: false,
    sortable: true,
    filterable: true
  },
  resolvedAt: {
    isArray: false,
    isNullable: true,
    type: 'timestamp',
    searchable: false,
    sortable: true,
    filterable: true
  },
  resolvedBy: {
    isArray: false,
    isNullable: true,
    type: 'string',
    searchable: false,
    sortable: true,
    filterable: true
  },
  resolutionNotes: {
    isArray: false,
    isNullable: true,
    type: 'string',
    searchable: false,
    sortable: false,
    filterable: false
  },
  customerSatisfaction: {
    isArray: false,
    isNullable: true,
    type: 'number',
    searchable: false,
    sortable: true,
    filterable: true
  },
  customerFeedback: {
    isArray: false,
    isNullable: true,
    type: 'string',
    searchable: false,
    sortable: false,
    filterable: false
  },
  appVersion: {
    isArray: false,
    isNullable: true,
    type: 'string',
    searchable: false,
    sortable: true,
    filterable: true
  },
  deviceInfo: {
    isArray: false,
    isNullable: true,
    type: 'json',
    searchable: false,
    sortable: false,
    filterable: false
  },
  userAgent: {
    isArray: false,
    isNullable: true,
    type: 'string',
    searchable: false,
    sortable: false,
    filterable: false
  },
  errorLogs: {
    isArray: false,
    isNullable: true,
    type: 'string',
    searchable: false,
    sortable: false,
    filterable: false
  },
  reproductionSteps: {
    isArray: false,
    isNullable: true,
    type: 'string',
    searchable: false,
    sortable: false,
    filterable: false
  },
  expectedBehavior: {
    isArray: false,
    isNullable: true,
    type: 'string',
    searchable: false,
    sortable: false,
    filterable: false
  },
  actualBehavior: {
    isArray: false,
    isNullable: true,
    type: 'string',
    searchable: false,
    sortable: false,
    filterable: false
  },
  escalatedAt: {
    isArray: false,
    isNullable: true,
    type: 'timestamp',
    searchable: false,
    sortable: true,
    filterable: true
  },
  escalationReason: {
    isArray: false,
    isNullable: true,
    type: 'string',
    searchable: false,
    sortable: false,
    filterable: false
  },
  slaBreached: {
    isArray: false,
    isNullable: false,
    type: 'boolean',
    searchable: false,
    sortable: true,
    filterable: true
  },
  dueDate: {
    isArray: false,
    isNullable: true,
    type: 'timestamp',
    searchable: false,
    sortable: true,
    filterable: true
  },
  internalNotes: {
    isArray: false,
    isNullable: true,
    type: 'string',
    searchable: false,
    sortable: false,
    filterable: false
  },
  tags: {
    isArray: true,
    isNullable: false,
    type: 'string',
    searchable: true,
    sortable: false,
    filterable: true
  },
  relatedSupportRequestIds: {
    isArray: true,
    isNullable: false,
    type: 'string',
    searchable: false,
    sortable: false,
    filterable: false
  },
  ...GenericRecordMetadataBase
};
