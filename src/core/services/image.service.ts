import { BaseStorageService, FileAssetCreate } from '@supa/services';
import type { SupabaseClient } from '@supabase/supabase-js';
import { AspectRatio } from '../constants';

export class ImageService extends BaseStorageService {
  constructor(
    protected supabase: SupabaseClient,
    bucket: string = 'images'
  ) {
    super(bucket, supabase);
  }

  /**
   * Pick an image from the user's file system.
   */
  async pickImage(): Promise<FileAssetCreate | null> {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      input.onchange = async (event: any) => {
        const file: File = event.target.files?.[0];
        if (!file) return resolve(null);

        const user = await this.getUser();
        const fileName = `${crypto.randomUUID()}_${file.name}`;
        const path = `${user.id}/${fileName}`;
        const extension = file.name.split('.').pop() || 'jpg';

        resolve({ file, path, extension });
      };
      input.click();
    });
  }

  /**
   * Capture an image using the device camera (browser-supported).
   */
  async captureImage(): Promise<FileAssetCreate | null> {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.capture = 'environment'; // ask for back camera on mobile
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      input.onchange = async (event: any) => {
        const file: File = event.target.files?.[0];
        if (!file) return resolve(null);

        const user = await this.getUser();
        const fileName = `${crypto.randomUUID()}_${file.name}`;
        const path = `${user.id}/${fileName}`;
        const extension = file.name.split('.').pop() || 'jpg';

        resolve({ file, path, extension });
      };
      input.click();
    });
  }

  /**
   * Pick or capture an image, asking the user which they want to do.
   */
  async pickOrCaptureImage(): Promise<FileAssetCreate | null> {
    const action = window.confirm('Press OK to use camera, Cancel to pick from library');
    if (action) {
      return this.captureImage();
    } else {
      return this.pickImage();
    }
  }

  /**
   * Generate a thumbnail using canvas
   */
  async createThumbnail(fileAsset: FileAssetCreate): Promise<FileAssetCreate> {
    const img = new Image();
    img.src = URL.createObjectURL(fileAsset.file);
    await img.decode();

    const width = 200;
    const height = 200 / AspectRatio.ratio;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx?.drawImage(img, 0, 0, width, height);

    const blob: Blob | null = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.7));

    if (!blob) throw new Error('Failed to generate thumbnail');

    const user = await this.getUser();
    const thumbFile = new File([blob], `thumb_${crypto.randomUUID()}.jpg`, { type: 'image/jpeg' });
    const path = `${user.id}/${thumbFile.name}`;
    const extension = 'jpg';

    return { file: thumbFile, path, extension };
  }
}
