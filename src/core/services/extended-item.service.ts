import { Cursor, Filter, Filters, OrderBy } from '@supa/services';
import type { SupabaseClient } from '@supabase/supabase-js';
import { PostgrestResponse, PostgrestSingleResponse, User } from '@supabase/supabase-js';
import { EventTypeKey, ItemType } from '../enumerations';
import { CreateItem, ExtendedItem, Item } from '../types';
import { geoJsonPointToWkt } from '../utils';
import { CurbyCoinTransactionService } from './curby-coin-transaction.service';
import { EventLoggerService } from './event-logger.service';
import { FalseTakingService } from './false-taking.service';
import { ItemMediaService } from './item-media.service';
import { ItemReportService } from './item-report.service';
import { MediaService } from './media.service';
import { SavedItemService } from './saved-item.service';

const EXPIRATION_DAYS = 3;
const EXTENSION_LIMIT = 2;
const EXTENSION_DAYS = 3;

export class ExtendedItemService {
  table = 'item';
  view = 'item_with_coords';

  protected curbyCoinTransactionService: CurbyCoinTransactionService;
  protected eventLoggerService: EventLoggerService;
  protected falseTakingsService: FalseTakingService;
  protected mediaService: MediaService;
  protected savedItemService: SavedItemService;
  protected reportedItemService: ItemReportService;
  protected itemMediaService: ItemMediaService;

  constructor(protected supabase: SupabaseClient) {
    this.curbyCoinTransactionService = new CurbyCoinTransactionService(supabase);
    this.eventLoggerService = new EventLoggerService(supabase);
    this.falseTakingsService = new FalseTakingService(supabase);
    this.mediaService = new MediaService(supabase);
    this.savedItemService = new SavedItemService(supabase);
    this.reportedItemService = new ItemReportService(supabase);
    this.itemMediaService = new ItemMediaService(supabase);
  }

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
      console.warn('No user found');
      throw new Error('No user found');
    }
    return user;
  }

  async getAll(
    filters?: Filters<ExtendedItem> | Filter<ExtendedItem>,
    orderBy?: OrderBy<ExtendedItem> | OrderBy<ExtendedItem>[],
    cursor?: Cursor<ExtendedItem>,
    pageSize?: number
  ): Promise<ExtendedItem[]> {
    let query = this.supabase.from(this.view).select('*');

    if (filters) {
      for (const { column, operator, value } of filters instanceof Array ? filters : [filters]) {
        if (operator === 'in') {
          if (Array.isArray(value)) {
            // Convert array to PostgREST in syntax
            query = query.filter(column, 'in', `(${value.join(',')})`);
          } else {
            // Assume value is already in string format
            query = query.filter(column, 'in', value);
          }
        } else {
          query = query.filter(column, operator, value);
        }
      }
    }

    if (cursor && cursor.column && cursor.value !== undefined) {
      const sortAscending = Array.isArray(orderBy)
        ? (orderBy.find((o) => o.column === cursor.column)?.ascending ?? true)
        : orderBy?.column === cursor.column
          ? (orderBy.ascending ?? true)
          : true;

      const operator = sortAscending ? 'gt' : 'lt';
      query = query.filter(cursor.column as string, operator, cursor.value);
    }

    if (orderBy) {
      for (const { column, ascending } of orderBy instanceof Array ? orderBy : [orderBy]) {
        query = query.order(column as string, { ascending: ascending ?? true });
      }
    }

    if (pageSize) {
      query = query.limit(pageSize);
    }

    const { data, error }: PostgrestResponse<ExtendedItem> = await query;

    if (error && error.code !== 'PGRST116') {
      console.error(`Error fetching from ${this.view}:`, error);
      throw error;
    }

    return data || [];
  }

  async exists(filters: Filters<ExtendedItem> | Filter<ExtendedItem> | string): Promise<boolean> {
    let _filters: Filters<ExtendedItem> = [];
    if (typeof filters === 'string') {
      _filters.push({ column: 'id', operator: 'eq', value: filters } as Filter<ExtendedItem>);
    } else if (filters instanceof Array) {
      _filters = filters;
    } else if (filters) {
      _filters = [filters];
    }

    let query = this.supabase.from(this.view).select('id').limit(1);

    if (_filters.length > 0) {
      for (const { column, operator, value } of _filters) {
        query = query.filter(column, operator, value);
      }
    }

    const { data, error } = await query;

    if (error && error.code !== 'PGRST116') {
      console.error(`Error checking existence in ${this.view}:`, error);
      throw error;
    }

    return data !== null && data.length > 0;
  }

  async count(filters?: Filters<ExtendedItem> | Filter<ExtendedItem>): Promise<number> {
    let query = this.supabase.from(this.view).select('id', { count: 'exact' });

    if (filters) {
      for (const { column, operator, value } of filters instanceof Array ? filters : [filters]) {
        query = query.filter(column, operator, value);
      }
    }

    const res = await query;
    const { count, error } = res;

    if (error) {
      console.error(`Error counting from ${this.view}:`, error);
      throw error;
    }

    return count || 0;
  }

  async getOne(
    filters: Filters<ExtendedItem> | Filter<ExtendedItem>,
    orderBy?: string,
    ascending: boolean = true
  ): Promise<ExtendedItem> {
    let query = this.supabase.from(this.view).select('*').limit(1);

    if (filters) {
      for (const { column, operator, value } of filters instanceof Array ? filters : [filters]) {
        query = query.filter(column, operator, value);
      }
    }

    if (orderBy) {
      query = query.order(orderBy, { ascending });
    }

    const { data, error }: PostgrestSingleResponse<ExtendedItem> = await query.single();

    if (error) {
      // PGRST116 means no data found
      console.error(`Error fetching one from ${this.view}:`, error);
      throw error;
    }

    if (!data) {
      console.warn(`No data found for ${this.view} with filters:`, filters);
      throw new Error(`No data found for ${this.view} with filters: ${JSON.stringify(filters)}`);
    }

    return data;
  }

  async getById(id: string): Promise<ExtendedItem> {
    const query = this.supabase.from(this.view).select('*').eq('id', id);

    const { data, error }: PostgrestSingleResponse<ExtendedItem> = await query.single();

    if (error) {
      console.error(`Error fetching ${this.view} by id:`, error);
      throw error;
    }

    if (!data) {
      console.warn(`No data found for ${this.view} with id: ${id}`);
      throw new Error(`No data found for ${this.view} with id: ${id}`);
    }

    return data;
  }

  async create({ title, media, coordinates }: CreateItem): Promise<ExtendedItem> {
    const byUser = await this.getUser();

    const [storedImage, storedThumbnail] = await this.mediaService.upload(media, true);

    const newItem: Omit<Item, 'id'> = {
      title,
      type: ItemType.Free,
      status: 'active',
      geoLocation: geoJsonPointToWkt({ type: 'Point', coordinates }),
      postedBy: byUser.id,
      taken: false,
      takenAt: null,
      posterCurbyCoinCount: await this.curbyCoinTransactionService.getMyBalance(),
      expiresAt: new Date(Date.now() + EXPIRATION_DAYS * 24 * 60 * 60 * 1000),
      extendedCount: 0,
      createdAt: new Date(),
      createdBy: byUser.id,
      updatedAt: new Date(),
      updatedBy: byUser.id
    };

    const { data: createdRecord, error }: PostgrestSingleResponse<Item> = await this.supabase
      .from(this.table)
      .insert(newItem)
      .select()
      .single();

    if (error) {
      console.error(`Error creating ${this.table}:`, error);
      throw error;
    }

    if (!createdRecord) {
      throw new Error(`Failed to create record in ${this.table}`);
    }

    await this.itemMediaService.create({
      mediaId: storedImage.id,
      thumbnailId: storedThumbnail?.id,
      itemId: createdRecord.id
    });

    const createdItem = await this.getById(createdRecord.id);
    await this.eventLoggerService.log(EventTypeKey.FreeItemPosted, { itemId: createdItem.id });
    return createdItem;
  }

  async update(id: string, updates: Partial<ExtendedItem>): Promise<ExtendedItem> {
    const byUser = await this.getUser();

    const oldItem = await this.getById(id);

    const updatedItem: Partial<Item> = {
      id: oldItem.id,
      title: updates.title,
      taken: updates.taken,
      takenBy: updates.takenBy,
      takenAt: updates.takenAt,
      expiresAt: updates.expiresAt,
      extendedCount: updates.extendedCount,
      confirmedTakenAt: updates.confirmedTakenAt
    };

    if (
      updates.location &&
      updates.location.type === 'Point' &&
      updates.location.coordinates &&
      updates.location.coordinates.length === 2 &&
      updates.location.coordinates.every((coord) => typeof coord === 'number') &&
      (updates.location.coordinates[0] !== oldItem.location?.coordinates[0] ||
        updates.location.coordinates[1] !== oldItem.location?.coordinates[1])
    ) {
      updatedItem.geoLocation = geoJsonPointToWkt(updates.location);
    }

    const { data, error } = await this.supabase
      .from(this.table)
      .update({
        ...updatedItem,
        updatedAt: new Date(),
        updatedBy: byUser.id
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error(`Error updating ${this.table}:`, error);
      throw error;
    }

    if (!data) {
      console.warn(`No data found for ${this.table} with id: ${id}`);
      throw new Error(`No data found for ${this.table} with id: ${id}`);
    }

    await this.eventLoggerService.log(EventTypeKey.FreeItemEdited, { itemId: data.id });
    return this.getById(data.id);
  }

  async delete(id: string): Promise<void> {
    await this.savedItemService.deleteMany({ column: 'itemId', operator: 'eq', value: id });
    await this.reportedItemService.deleteMany({ column: 'itemId', operator: 'eq', value: id });

    const itemMedias = await this.itemMediaService.getAll({ column: 'itemId', operator: 'eq', value: id });
    for (const im of itemMedias) {
      if (im.mediaId) {
        await this.mediaService.remove(im.mediaId);
      }
      if (im.thumbnailId && im.thumbnailId !== im.mediaId) {
        await this.mediaService.remove(im.thumbnailId);
      }
      await this.itemMediaService.delete(im.id);
    }

    const { error } = await this.supabase.from(this.table).delete().eq('id', id);

    if (error) {
      console.error(`Error deleting from ${this.table}:`, error);
      throw error;
    }

    await this.eventLoggerService.log(EventTypeKey.FreeItemDeleted, { itemId: id });
  }

  async getMySavedItems(): Promise<ExtendedItem[]> {
    const user = await this.getUser();
    const savedItemAssocations = await this.savedItemService.getMySavedItems();
    if (savedItemAssocations.length === 0) {
      return [];
    }
    const { data, error }: PostgrestResponse<ExtendedItem> = await this.supabase
      .from(this.view)
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
      console.error(`Error fetching from ${this.view}:`, error);
      throw error;
    }

    return data || [];
  }

  async getMyUrgentItemsCount(): Promise<number> {
    const user = await this.getUser();
    const { count, error } = await this.supabase
      .from(this.view)
      .select('id', { count: 'exact', head: true })
      .eq('postedBy', user.id)
      .or(
        `taken.eq.true, and(taken.eq.false, expiresAt.lte.${new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString()})`
      );

    if (error) {
      console.error(`Error counting from ${this.view}:`, error);
      throw error;
    }

    return count || 0;
  }

  /**
   * Get items posted by me that are either:
   * - taken but not yet confirmed taken
   * - expiring in the next 6 hours and not yet taken
   */
  async getMyUrgentItems(): Promise<ExtendedItem[]> {
    const user = await this.getUser();
    const { data, error }: PostgrestResponse<ExtendedItem> = await this.supabase
      .from(this.view)
      .select('*')
      .eq('postedBy', user.id)
      .or(
        `taken.eq.true, and(taken.eq.false, expiresAt.lte.${new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString()})`
      )
      .order('createdAt', { ascending: false });

    if (error && error.code !== 'PGRST116') {
      console.error(`Error fetching from ${this.view}:`, error);
      throw error;
    }

    return data || [];
  }

  async saveItem(itemId: string): Promise<ExtendedItem[]> {
    await this.savedItemService.saveItem(itemId);
    await this.eventLoggerService.log(EventTypeKey.FreeItemSaved, { itemId });
    return this.getMySavedItems();
  }

  async unsaveItem(itemId: string): Promise<ExtendedItem[]> {
    await this.savedItemService.unsaveItem(itemId);
    await this.eventLoggerService.log(EventTypeKey.FreeItemUnsaved, { itemId });
    return this.getMySavedItems();
  }

  async reportItem(itemId: string, reason: string): Promise<void> {
    const user = await this.getUser();
    await this.reportedItemService.create({
      itemId: itemId,
      reason,
      reportedAt: new Date(),
      reporterId: user.id
    });
    await this.eventLoggerService.log(EventTypeKey.FreeItemReported, { itemId, reporterId: user.id });
  }

  async markTaken(itemId: string): Promise<ExtendedItem> {
    const user = await this.getUser();
    const existingItem = await this.getById(itemId);
    if (existingItem.taken) {
      throw new Error('Item is already marked as taken');
    }
    if (existingItem.expiresAt && new Date() > new Date(existingItem.expiresAt)) {
      throw new Error('Cannot take an item that has expired');
    }
    const updatedItem = await this.update(itemId, {
      taken: true,
      takenAt: new Date(),
      takenBy: user.id,
      confirmedTakenAt: existingItem.postedBy === user.id ? new Date() : null // Auto-confirm if poster is taking their own item
    });
    await this.eventLoggerService.log(EventTypeKey.FreeItemTaken, { itemId, takerId: user.id });
    return updatedItem;
  }

  async markStillAvailable(itemId: string): Promise<ExtendedItem> {
    const existingItem = await this.getById(itemId);
    if (!existingItem.taken) {
      throw new Error('Item is not marked as taken');
    }
    const user = await this.getUser();
    if (existingItem.takenBy === user.id) {
      await this.eventLoggerService.log(EventTypeKey.FreeItemNotTaken, { itemId, takerId: user.id });
      return this.update(itemId, {
        taken: false,
        takenAt: null,
        takenBy: null
      });
    } else if (existingItem.postedBy === user.id) {
      await this.eventLoggerService.log(EventTypeKey.FreeItemNotTaken, { itemId, takerId: existingItem.takenBy });
      await this.falseTakingsService.create({
        takerId: existingItem.takenBy!,
        itemId,
        restoredAt: new Date(),
        takenAt: existingItem.takenAt!
      });
      return this.update(itemId, {
        taken: false,
        takenAt: null,
        takenBy: null
      });
    } else {
      throw new Error('Only the user who took the item or the user who posted the item can mark it as still available');
    }
  }

  async confirmTaken(itemId: string): Promise<ExtendedItem> {
    console.log('Confirming item as taken:', itemId);
    const user = await this.getUser();
    const existingItem = await this.getById(itemId);
    if (!existingItem.taken) {
      throw new Error('Item is not marked as taken');
    }
    if (existingItem.postedBy !== user.id) {
      throw new Error('Only the user who posted the item can confirm it as taken');
    }
    console.log('Item taken by:', existingItem.takenBy, 'confirmed by:', user.id);
    await this.eventLoggerService.log(EventTypeKey.FreeItemConfirmedTaken, { itemId, takerId: existingItem.takenBy });
    console.log('Logging event completed, updating item now');
    const res = await this.update(itemId, {
      confirmedTakenAt: new Date()
    });
    console.log('Item update completed:', res);
    return res;
  }

  async extendItem(itemId: string): Promise<ExtendedItem> {
    const existingItem = await this.getById(itemId);
    if (existingItem.expiresAt && new Date() > new Date(existingItem.expiresAt)) {
      console.error('Item has already expired on', existingItem.expiresAt);
      throw new Error('Cannot extend an item that has expired');
    }
    const user = await this.getUser();
    if (existingItem.postedBy !== user.id) {
      console.error('User', user.id, 'is not the poster', existingItem.postedBy);
      throw new Error('Only the user who posted the item can extend it');
    }
    if ((existingItem.extendedCount ?? 0) >= EXTENSION_LIMIT) {
      console.error('Item has already been extended the maximum number of times:', existingItem.extendedCount);
      throw new Error('Item has already been extended the maximum number of times');
    }
    const newExpiry = existingItem.expiresAt
      ? new Date(new Date(existingItem.expiresAt).getTime() + EXTENSION_DAYS * 24 * 60 * 60 * 1000)
      : new Date(Date.now() + EXTENSION_DAYS * 24 * 60 * 60 * 1000);
    await this.eventLoggerService.log(EventTypeKey.FreeItemExtended, { itemId, newExpiry });
    return this.update(itemId, {
      expiresAt: newExpiry,
      extendedCount: (existingItem.extendedCount ?? 0) + 1
    });
  }
}
