import { SupportRequestMessageSenderType, SupportRequestMessageType } from '@core/enumerations';
import { BaseService, FileAssetCreate } from '@supa/services';
import { PostgrestResponse, SupabaseClient } from '@supabase/supabase-js';
import { Media, SupportRequestMessage, SupportRequestMessageMedia, SupportRequestMessageMetadata } from '../types';
import { SupportRequestMessageMediaService } from './support-request-message-media.service';

export class SupportRequestMessageService extends BaseService<SupportRequestMessage> {
  supportRequestMessageMediaService: SupportRequestMessageMediaService;

  constructor(protected supabase: SupabaseClient) {
    super('support_request_message', supabase, SupportRequestMessageMetadata);
    this.supportRequestMessageMediaService = new SupportRequestMessageMediaService(supabase);
  }

  async getMessagesBySupportRequestId(
    supportRequestId: string
  ): Promise<(SupportRequestMessage & { media?: Media[] })[]> {
    const {
      data,
      error
    }: PostgrestResponse<
      SupportRequestMessage & {
        support_request_message_media?: SupportRequestMessageMedia & { media: Media }[];
      }
    > = await this.supabase
      .from('support_request_message')
      .select('*, support_request_message_media(media:"mediaId"(*))')
      .eq('supportRequestId', supportRequestId)
      .order('createdAt', { ascending: true });

    if (error) throw error;

    // Flatten media
    return (
      data?.map((m) => ({
        ...m,
        media: m.support_request_message_media?.map((mm) => mm.media) || []
      })) || []
    );
  }

  subscribeToMessages(supportRequestId: string, callback: (msg: SupportRequestMessage) => void) {
    const channel = this.supabase
      .channel(`support-request-${supportRequestId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'support_request_message',
          filter: `supportRequestId=eq.${supportRequestId}`
        },
        async (payload) => callback(payload.new as SupportRequestMessage)
      )
      .subscribe();

    return () => this.supabase.removeChannel(channel);
  }

  async sendMessage({
    supportRequestId,
    message,
    media,
    messageType
  }: {
    supportRequestId: string;
    message: string;
    media?: FileAssetCreate[];
    messageType?: SupportRequestMessageType;
  }) {
    const user = await this.getUser();
    const { data, error } = await this.supabase
      .from('support_request_message')
      .insert([
        {
          supportRequestId,
          senderId: user.id,
          senderType: SupportRequestMessageSenderType.User,
          message,
          messageType: messageType ?? SupportRequestMessageType.Reply,
          isInternal: [SupportRequestMessageType.InternalNote, SupportRequestMessageType.AssignmentChange].includes(
            messageType ?? SupportRequestMessageType.Reply
          )
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error sending support request message:', error);
      throw error;
    }

    if (!data) {
      console.error('No data returned after sending support request message');
      throw new Error('No data returned after sending support request message');
    }

    if (media && media.length > 0) {
      await this.supportRequestMessageMediaService.uploadMany(data.id, media);
    }

    return data;
  }
}
