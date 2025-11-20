import { BaseService } from '@supa/services';
import { SupabaseClient } from '@supabase/supabase-js';
import { SupportRequestMessageRead, SupportRequestMessageReadMetadata } from '../types';

export class SupportRequestMessageReadService extends BaseService<SupportRequestMessageRead> {
  constructor(protected supabase: SupabaseClient) {
    super('support_request_message_read', supabase, SupportRequestMessageReadMetadata);
  }

  subscribeToReads(messageIds: string[], callback: (read: SupportRequestMessageRead) => void) {
    const channel = this.supabase
      .channel(`message-reads-${messageIds.join('-')}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'support_request_message_read',
          filter: `messageId=in.(${messageIds.join(',')})`
        },
        async (payload) => callback(payload.new as SupportRequestMessageRead)
      )
      .subscribe();

    return () => this.supabase.removeChannel(channel);
  }
}
