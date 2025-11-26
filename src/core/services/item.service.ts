import { ItemStatus } from '@core/enumerations';
import { BaseService } from '@supa/services';
import type { PostgrestResponse, SupabaseClient } from '@supabase/supabase-js';
import { Item, ItemMetadata } from '../types';
import { SavedItemService } from './saved-item.service';

export class ItemService extends BaseService<Item> {
  protected savedItemService: SavedItemService;

  constructor(protected supabase: SupabaseClient) {
    super('item', supabase, ItemMetadata);
    this.savedItemService = new SavedItemService(supabase);
  }

  async getMySavedItems(): Promise<Item[]> {
    const user = await this.getUser();
    const savedItemAssocations = await this.savedItemService.getMySavedItems();
    if (savedItemAssocations.length === 0) {
      return [];
    }
    const { data, error }: PostgrestResponse<Item> = await this.supabase
      .from(this.table)
      .select('*')
      .in(
        'id',
        savedItemAssocations.map((s) => s.itemId)
      )
      // taken = false OR (taken = true AND takenBy = current_user_id)
      .or(`taken.eq.false,and(taken.eq.true,takenBy.eq.${user.id})`)
      // expiresAt > now OR expiresAt IS NULL
      .or(`expiresAt.gt.${new Date().toISOString()},expiresAt.is.null`)
      .order('createdAt', { ascending: false });

    if (error && error.code !== 'PGRST116') {
      console.error(`Error fetching from ${this.table}:`, error);
      throw error;
    }

    return data || [];
  }

  async getMyUrgentItemsCount(): Promise<number> {
    const user = await this.getUser();
    const { count, error } = await this.supabase
      .from(this.table)
      .select('id', { count: 'exact', head: true })
      .eq('postedBy', user.id)
      .or(
        `taken.eq.true, and(taken.eq.false, expiresAt.lte.${new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString()})`
      );

    if (error) {
      console.error(`Error counting from ${this.table}:`, error);
      throw error;
    }

    return count || 0;
  }

  /**
   * Get items posted by me that are either:
   * - taken but not yet confirmed taken
   * - expiring in the next 6 hours and not yet taken
   */
  async getMyUrgentItems(): Promise<Item[]> {
    const user = await this.getUser();
    const { data, error }: PostgrestResponse<Item> = await this.supabase
      .from(this.table)
      .select('*')
      .eq('postedBy', user.id)
      .or(
        `taken.eq.true, and(taken.eq.false, expiresAt.lte.${new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString()})`
      )
      .order('createdAt', { ascending: false });

    if (error && error.code !== 'PGRST116') {
      console.error(`Error fetching from ${this.table}:`, error);
      throw error;
    }

    return data || [];
  }

  async removeItem(itemId: string): Promise<Item> {
    return this.update(itemId, {
      status: ItemStatus.Removed
    });
  }

  async restoreItem(itemId: string): Promise<Item> {
    return this.update(itemId, {
      status: ItemStatus.Restored
    });
  }
}
