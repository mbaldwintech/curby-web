import { BaseService, FileAssetCreate } from '@supa/services';
import type { SupabaseClient } from '@supabase/supabase-js';
import { Media } from '../types';
import { ImageService } from './image.service';

export class MediaService extends BaseService<Media> {
  protected imageService: ImageService;

  constructor(
    protected supabase: SupabaseClient,
    bucket: string = 'images'
  ) {
    super('media', supabase);
    this.imageService = new ImageService(supabase, bucket);
  }

  async upload(file: FileAssetCreate, makeThumbnail: true): Promise<[Media, Media]>;
  async upload(file: FileAssetCreate, makeThumbnail: false): Promise<[Media]>;
  async upload(file: FileAssetCreate, makeThumbnail: boolean = false): Promise<[Media, Media?]> {
    let thumbnailImage: Media | undefined;
    if (makeThumbnail) {
      const thumbnailFile = await this.imageService.createThumbnail(file);
      [thumbnailImage] = await this.upload(thumbnailFile, false);
    }

    const fileAsset = await this.imageService.upload(file);

    if (!fileAsset) {
      throw new Error('Image upload failed');
    }

    const media = await this.create({
      url: fileAsset.url,
      filename: fileAsset.fileName,
      fileExtension: fileAsset.extension,
      filePath: fileAsset.path,
      mimeType: fileAsset.mimeType
    });

    if (thumbnailImage) {
      return [media, thumbnailImage];
    }

    return [media];
  }

  async download(id: string): Promise<Blob> {
    const media = await this.getById(id);
    if (!media) {
      throw new Error('Media not found');
    }

    return this.imageService.download(media.filePath);
  }

  async remove(id: string): Promise<void> {
    const media = await this.getById(id);
    if (!media) {
      throw new Error('Media not found');
    }

    await this.imageService.remove(media.filePath);
    await this.delete(id);
  }
}
