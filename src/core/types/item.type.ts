import { GenericRecord } from '@supa/types';

export interface Item extends GenericRecord {
  title: string;
  type: string;
  status: 'active' | 'extended' | 'expired' | 'removed' | 'under_review' | 'restored';
  geoLocation: string; // WKT format
  posterCurbyCoinCount: number;
  postedBy: string;
  taken: boolean;
  takenBy?: string | null;
  takenAt?: Date | string | null;
  confirmedTakenAt?: Date | string | null;
  expiresAt: Date | string;
  extendedCount: number;
}
