import { BaseService, FileAssetCreate } from '@supa/services';
import { SupabaseClient } from '@supabase/supabase-js';
import { SupportRequestMessageMedia, SupportRequestMessageMediaMetadata } from '../types';
import { MediaService } from './media.service';

export class SupportRequestMessageMediaService extends BaseService<SupportRequestMessageMedia> {
  mediaService: MediaService;
  constructor(protected supabase: SupabaseClient) {
    super('support_request_message_media', supabase, SupportRequestMessageMediaMetadata);
    this.mediaService = new MediaService(supabase);
  }

  async uploadMany(supportRequestMessageId: string, media: FileAssetCreate[]): Promise<SupportRequestMessageMedia[]> {
    const uploadedMedia = await this.mediaService.uploadMany(media, false);
    return Promise.all(
      uploadedMedia.map(([item]) =>
        this.create({
          supportRequestMessageId,
          mediaId: item.id
        })
      )
    );
  }
}
