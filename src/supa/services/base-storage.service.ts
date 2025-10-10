import { Camelize, FileObject, FileObjectV2 } from '@supabase/storage-js';
import type { SupabaseClient } from '@supabase/supabase-js';
import { User } from '@supabase/supabase-js';

export interface FileAssetCreate {
  file: File; // browser File object
  path: string; // destination path in the bucket
  extension: string; // file extension, e.g., 'jpg', 'png'
}

export interface FileAsset {
  id: string;
  path: string;
  fullPath: string;
  url: string;
  mimeType: string;
  fileName: string;
  extension: string;
}

export interface ListOptions {
  limit?: number;
  offset?: number;
  sortBy?: { column: string; order: 'asc' | 'desc' };
  search?: string;
}

export abstract class BaseStorageService {
  constructor(
    protected bucket: string,
    protected supabase: SupabaseClient
  ) {}

  async getUser(): Promise<User> {
    const {
      data: { user },
      error
    } = await this.supabase.auth.getUser();

    if (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
    if (!user) {
      throw new Error('No active user found');
    }

    return user;
  }

  async upload(fileAsset: FileAssetCreate, upsert = false): Promise<FileAsset> {
    const { file, path } = fileAsset;
    const byUser = await this.getUser();

    const { data, error } = await this.supabase.storage.from(this.bucket).upload(path, file, {
      upsert,
      cacheControl: '3600',
      contentType: file.type,
      metadata: {
        createdBy: byUser.id,
        updatedBy: byUser.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    });

    if (error) {
      console.error(`Error uploading to ${this.bucket} at ${path}:`, error);
      throw error;
    }

    if (!data) {
      throw new Error(`Failed to upload file to ${this.bucket} at ${path}`);
    }

    const {
      data: { publicUrl }
    } = this.supabase.storage.from(this.bucket).getPublicUrl(data.path);

    return {
      id: crypto.randomUUID(),
      path: data.path,
      fullPath: `${this.bucket}/${data.path}`,
      url: publicUrl,
      mimeType: file.type,
      fileName: file.name,
      extension: fileAsset.extension
    };
  }

  async download(path: string): Promise<Blob> {
    const { data, error } = await this.supabase.storage.from(this.bucket).download(path);

    if (error) {
      console.error(`Error downloading from ${this.bucket} at ${path}:`, error);
      throw error;
    }
    if (!data) {
      throw new Error(`No file found in ${this.bucket} at ${path}`);
    }

    return data;
  }

  async list(options?: ListOptions): Promise<FileObject[]> {
    const { data, error } = await this.supabase.storage.from(this.bucket).list('', {
      limit: options?.limit ?? 100,
      offset: options?.offset ?? 0,
      sortBy: options?.sortBy ?? { column: 'name', order: 'asc' },
      search: options?.search
    });

    if (error) {
      console.error(`Error listing files in ${this.bucket}:`, error);
      throw error;
    }

    return data ?? [];
  }

  async exists(path: string): Promise<boolean> {
    try {
      const { data, error } = await this.supabase.storage.from(this.bucket).info(path);

      if (error) {
        if (error.message.toLowerCase().includes('not found')) {
          return false;
        }
        console.error(`Error checking existence of ${path} in ${this.bucket}:`, error);
        throw error;
      }

      return !!data; // file exists if info returns data
    } catch (err: unknown) {
      // Defensive fallback — some SDK versions may throw instead of returning error
      if (err instanceof Error && err?.message?.toLowerCase().includes('not found')) {
        return false;
      }
      throw err;
    }
  }

  async getInfo(path: string): Promise<Camelize<FileObjectV2>> {
    const { data, error } = await this.supabase.storage.from(this.bucket).info(path);

    if (error) {
      console.error(`Error getting info from ${this.bucket} at ${path}:`, error);
      throw error;
    }

    if (!data) {
      throw new Error(`No file found in ${this.bucket} at ${path}`);
    }

    return data;
  }

  async getPublicUrl(path: string): Promise<string> {
    const { data } = this.supabase.storage.from(this.bucket).getPublicUrl(path);
    if (!data.publicUrl) {
      throw new Error(`Failed to get public URL for ${this.bucket} at ${path}`);
    }
    return data.publicUrl;
  }

  async remove(paths: string | string[]): Promise<void> {
    const _paths = Array.isArray(paths) ? paths : [paths];

    const { error } = await this.supabase.storage.from(this.bucket).remove(_paths);
    if (error) {
      console.error(`Error removing files from ${this.bucket}:`, error);
      throw error;
    }
  }

  async update(fileAsset: FileAssetCreate): Promise<FileAsset> {
    const { file, path } = fileAsset;
    const byUser = await this.getUser();

    const { data, error } = await this.supabase.storage.from(this.bucket).update(path, file, {
      contentType: file.type,
      cacheControl: '3600',
      metadata: {
        createdBy: byUser.id,
        updatedBy: byUser.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    });

    if (error) {
      console.error(`Error updating file in ${this.bucket} at ${path}:`, error);
      throw error;
    }

    if (!data) {
      throw new Error(`Failed to update file in ${this.bucket} at ${path}`);
    }

    const {
      data: { publicUrl }
    } = this.supabase.storage.from(this.bucket).getPublicUrl(data.path);

    return {
      id: crypto.randomUUID(),
      path: data.path,
      fullPath: `${this.bucket}/${data.path}`,
      url: publicUrl,
      mimeType: file.type,
      fileName: file.name,
      extension: fileAsset.extension
    };
  }

  async move(fromPath: string, toPath: string): Promise<void> {
    const { error } = await this.supabase.storage.from(this.bucket).move(fromPath, toPath);
    if (error) {
      console.error(`Error moving file from ${fromPath} to ${toPath} in ${this.bucket}:`, error);
      throw error;
    }
  }

  async copy(fromPath: string, toPath: string): Promise<void> {
    const { error } = await this.supabase.storage.from(this.bucket).copy(fromPath, toPath);
    if (error) {
      console.error(`Error copying file from ${fromPath} to ${toPath} in ${this.bucket}:`, error);
      throw error;
    }
  }
}
