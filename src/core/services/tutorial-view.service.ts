import { BaseService } from '@supa/services';
import type { SupabaseClient } from '@supabase/supabase-js';
import { TutorialView, TutorialViewMetadata } from '../types';
import { DeviceService } from './device.service';

export class TutorialViewService extends BaseService<TutorialView> {
  protected deviceService: DeviceService;

  constructor(protected supabase: SupabaseClient) {
    super('tutorial_view', supabase, TutorialViewMetadata);
    this.deviceService = new DeviceService(supabase);
  }

  async getByTutorialId(tutorialId: string) {
    const user = await this.getUserOrNull();
    const device = await this.deviceService.getMyDevice();
    if (!user && !device) return null;

    return this.getOneOrNull([
      { column: 'tutorialId', operator: 'eq', value: tutorialId },
      { column: user ? 'userId' : 'deviceId', operator: 'eq', value: user ? user.id : device.id }
    ]);
  }

  async startTutorial(tutorialId: string): Promise<TutorialView | null> {
    const user = await this.getUserOrNull();
    const device = await this.deviceService.getMyDevice();
    if (!user && !device) return null;

    const existing = await this.getOneOrNull([
      { column: 'tutorialId', operator: 'eq', value: tutorialId },
      { column: user ? 'userId' : 'deviceId', operator: 'eq', value: user ? user.id : device.id }
    ]);
    if (existing) return existing;

    return this.create({
      tutorialId: tutorialId,
      userId: user?.id,
      deviceId: device.id,
      status: 'viewed'
    });
  }

  async updateStatus(tutorialId: string, status: 'skipped' | 'completed'): Promise<TutorialView | null> {
    const user = await this.getUserOrNull();
    const device = await this.deviceService.getMyDevice();
    if (!user && !device) return null;

    const existing = await this.getOneOrNull([
      { column: 'tutorialId', operator: 'eq', value: tutorialId },
      { column: user ? 'userId' : 'deviceId', operator: 'eq', value: user ? user.id : device.id }
    ]);
    if (!existing) return null;

    if (existing.status === status) return existing;

    return this.update(existing.id, { status });
  }
}
