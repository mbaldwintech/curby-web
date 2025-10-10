import { BaseService } from '@supa/services';
import { SupabaseClient } from '@supabase/supabase-js';
import { Tutorial, TutorialView } from '../types';
import { ProfileService } from './profile.service';
import { TutorialViewService } from './tutorial-view.service';

export class TutorialService extends BaseService<Tutorial> {
  protected profileService: ProfileService;
  protected tutorialViewService: TutorialViewService;

  constructor(protected supabase: SupabaseClient) {
    super('tutorial', supabase);
    this.profileService = new ProfileService(supabase);
    this.tutorialViewService = new TutorialViewService(supabase);
  }

  async getByKey(key: string): Promise<Tutorial | null> {
    const profile = await this.profileService.getMyProfileOrNull();
    return this.getOneOrNull([
      { column: 'key', operator: 'eq', value: key },
      { column: 'roles', operator: 'cs', value: profile ? [`{${profile.role}}`] : ['{unauthenticated}'] },
      { column: 'active', operator: 'eq', value: true }
    ]);
  }

  async checkIfUserHasCompletedTutorial(key: string): Promise<boolean> {
    const tutorial = await this.getByKey(key);
    if (!tutorial) return false;

    const tutorialView = await this.tutorialViewService.getByTutorialId(tutorial.id);
    if (!tutorialView) return false;

    return ['skipped', 'completed'].includes(tutorialView.status);
  }

  async startTutorial(id: string): Promise<TutorialView | null> {
    return this.tutorialViewService.startTutorial(id);
  }

  async skipTutorial(id: string): Promise<TutorialView | null> {
    return this.tutorialViewService.updateStatus(id, 'skipped');
  }

  async completeTutorial(id: string): Promise<TutorialView | null> {
    return this.tutorialViewService.updateStatus(id, 'completed');
  }
}
