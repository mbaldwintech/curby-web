import { GenericRecord } from '@supa/types';

export interface TutorialView extends GenericRecord {
  tutorialId: string;
  userId?: string;
  deviceId?: string;
  status: 'not-started' | 'viewed' | 'skipped' | 'completed';
}
