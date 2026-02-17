import { BaseService } from '@supa/services';
import type { SupabaseClient } from '@supabase/supabase-js';
import { SavedItem, SavedItemMetadata } from '../types';
import { createLogger } from '@core/utils';

const logger = createLogger('SavedItemService');

export class SavedItemService extends BaseService<SavedItem> {
  constructor(protected supabase: SupabaseClient) {
    super('saved_item', supabase, SavedItemMetadata);
  }

  async getMySavedItems(): Promise<SavedItem[]> {
    const isAuthenticated = await this.isAuthenticated();
    if (!isAuthenticated) {
      logger.warn('User is not authenticated. Cannot fetch saved items.');
      return [];
    }

    const user = await this.getUser();
    if (!user) {
      logger.warn('No user found. Cannot fetch saved items.');
      return [];
    }

    return this.getAll({ column: 'userId', operator: 'eq', value: user.id });
  }

  async saveItem(itemId: string): Promise<SavedItem[]> {
    const isAuthenticated = await this.isAuthenticated();
    if (!isAuthenticated) {
      throw new Error('User is not authenticated. Cannot save item.');
    }

    const user = await this.getUser();
    if (!user) {
      throw new Error('No user found. Cannot save item.');
    }

    const existingSavedItems = await this.getMySavedItems();

    if (existingSavedItems.some((item) => item.itemId === itemId)) {
      logger.warn(`Item with ID ${itemId} is already saved by the user.`);
      return existingSavedItems;
    }

    await this.create({ userId: user.id, itemId, savedAt: new Date() });
    return this.getMySavedItems();
  }

  async unsaveItem(itemId: string): Promise<SavedItem[]> {
    const savedItems = await this.getMySavedItems();
    const savedItem = savedItems.find((item) => item.itemId === itemId);
    if (savedItem) {
      await this.delete(savedItem.id);
    } else {
      logger.warn(`Item with ID ${itemId} is not saved by the user.`);
    }
    return this.getMySavedItems();
  }
}
