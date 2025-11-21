import { SupportRequestMessageType } from '@core/enumerations';
import { BaseService } from '@supa/services';
import { SupabaseClient } from '@supabase/supabase-js';
import { SupportRequest, SupportRequestMetadata } from '../types';
import { ProfileService } from './profile.service';
import { SupportRequestMessageService } from './support-request-message.service';

export class SupportRequestService extends BaseService<SupportRequest> {
  profileService: ProfileService;
  supportRequestMessageService: SupportRequestMessageService;

  constructor(protected supabase: SupabaseClient) {
    super('support_request', supabase, SupportRequestMetadata);
    this.profileService = new ProfileService(supabase);
    this.supportRequestMessageService = new SupportRequestMessageService(supabase);
  }

  async update(id: string, updates: Partial<SupportRequest>): Promise<SupportRequest> {
    const byUser = await this.getUser();
    const profile = await this.profileService.findByUserId(byUser.id);
    const existing = await this.getById(id);
    const updated = await super.update(id, updates);

    // If status changed, add to messages
    if (updates.status && updates.status !== existing.status) {
      await this.supportRequestMessageService.sendMessage({
        supportRequestId: id,
        message: `Status changed from ${existing.status} to ${updates.status} by ${profile.username}.`,
        messageType: SupportRequestMessageType.StatusChange
      });
    }

    // If assignee changed, add to messages
    if (updates.assignedTo && updates.assignedTo !== existing.assignedTo) {
      const newAssigneeProfile = await this.profileService.findByUserId(updates.assignedTo);
      const newAssigneeName = newAssigneeProfile ? newAssigneeProfile.username : 'Unassigned';
      await this.supportRequestMessageService.sendMessage({
        supportRequestId: id,
        message: `Assignee changed from ${
          existing.assignedTo ? (await this.profileService.findByUserId(existing.assignedTo)).username : 'Unassigned'
        } to ${newAssigneeName} by ${profile.username}.`,
        messageType: SupportRequestMessageType.AssignmentChange
      });
    }

    return updated;
  }
}
