import type { SupabaseClient } from '@supabase/supabase-js';
import {
  PostgrestResponse,
  PostgrestSingleResponse,
  RealtimePostgresChangesPayload,
  User
} from '@supabase/supabase-js';
import { GenericRecord } from '../types';

export type StringOperators = 'eq' | 'neq' | 'like' | 'ilike' | 'in';
export type NumberOperators = 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'in';
export type BooleanOperators = 'eq' | 'neq' | 'is';
export type DateOperators = 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'in';
export type NullOperators = 'is';
export type ArrayOperators = 'cs' | 'cd' | 'ov';

export type Operators<T> = T extends string
  ? StringOperators
  : T extends number
    ? NumberOperators
    : T extends boolean
      ? BooleanOperators
      : T extends Date
        ? DateOperators
        : T extends unknown[]
          ? ArrayOperators
          : T extends null
            ? NullOperators
            : never;

type OperatorValuePair<T> =
  Operators<T> extends infer Op
    ? Op extends string
      ? Op extends 'in'
        ? { operator: Op; value: T[] }
        : { operator: Op; value: T }
      : never
    : never;

export type Filter<T> = {
  [K in keyof Required<T>]: {
    column: K;
  } & OperatorValuePair<Required<T>[K]>;
}[keyof T];

export type Filters<T> = Filter<T>[];

export type Cursor<T> = {
  column: keyof T;
  value: T[keyof T];
};

export type Pagination = {
  pageIndex: number;
  pageSize: number;
};

export type OrderBy<T> = {
  column: keyof T;
  ascending?: boolean;
};

export abstract class BaseService<T extends GenericRecord> {
  constructor(
    protected table: string,
    protected supabase: SupabaseClient
  ) {}

  async isAuthenticated(): Promise<boolean> {
    const {
      data: { user },
      error
    } = await this.supabase.auth.getUser();
    if (error) {
      console.error('Error fetching user:', error);
      return false;
    }
    return !!user;
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

  async getUserOrNull(): Promise<User | null> {
    const {
      data: { user },
      error
    } = await this.supabase.auth.getUser();

    // PGRST116 means no data found
    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching user:', error);
      throw error;
    }

    if (!user) {
      return null;
    }

    return user;
  }

  async getAll(
    filters?: Filters<T> | Filter<T>,
    orderBy?: OrderBy<T> | OrderBy<T>[],
    cursor?: Cursor<T>,
    pageSize?: number
  ): Promise<T[]> {
    let query = this.supabase.from(this.table).select('*');

    if (filters) {
      for (const { column, operator, value } of filters instanceof Array ? filters : ([filters] as Filters<T>)) {
        if (operator === 'in') {
          if (Array.isArray(value)) {
            query = query.filter(column, 'in', `(${(value as unknown[]).join(',')})`);
          } else {
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

    const { data, error }: PostgrestResponse<T> = await query;

    if (error && error.code !== 'PGRST116') {
      console.error(`Error fetching from ${this.table}:`, error);
      throw error;
    }

    return data || [];
  }

  async getAllPaged(
    filters?: Filters<T> | Filter<T>,
    orderBy?: OrderBy<T> | OrderBy<T>[],
    pagination?: Pagination,
    search?: { text: string; columns: (keyof T)[] }
  ): Promise<T[]> {
    let query = this.supabase.from(this.table).select('*');

    if (filters) {
      for (const { column, operator, value } of filters instanceof Array ? filters : [filters]) {
        if (operator === 'in') {
          if (Array.isArray(value)) {
            query = query.filter(column, 'in', `(${(value as unknown[]).join(',')})`);
          } else {
            query = query.filter(column, 'in', value);
          }
        } else {
          query = query.filter(column, operator, value);
        }
      }
    }

    if (search && search.text.trim().length > 0) {
      const searchText = search.text.trim();

      const orConditions = search.columns.map((col) => `${String(col)}.ilike.%${searchText}%`).join(',');

      query = query.or(orConditions);
    }

    if (orderBy) {
      for (const { column, ascending } of orderBy instanceof Array ? orderBy : [orderBy]) {
        query = query.order(column as string, { ascending: ascending ?? true });
      }
    }

    if (pagination) {
      const from = pagination.pageIndex * pagination.pageSize;
      const to = from + pagination.pageSize - 1;
      query = query.range(from, to);
    }

    const { data, error }: PostgrestResponse<T> = await query;

    if (error && error.code !== 'PGRST116') {
      console.error(`Error fetching from ${this.table}:`, error);
      throw error;
    }

    return data || [];
  }

  /**
   * Inefficient for large tables. Use sparingly.
   */
  async getDistinctValuesForColumn<K extends keyof T>(column: K): Promise<T[K][]> {
    const { data, error }: PostgrestResponse<T> = await this.supabase.from(this.table).select(column as string);

    if (error) {
      console.error(`Error fetching values for column ${String(column)}:`, error);
      throw error;
    }

    if (!data) return [];

    const values = data.map((row) => row[column]);
    // Remove duplicates
    return Array.from(new Set(values));
  }

  async exists(filters: Filters<T> | Filter<T> | string): Promise<boolean> {
    let _filters: Filters<T> = [];
    if (typeof filters === 'string') {
      _filters.push({ column: 'id', operator: 'eq', value: filters } as Filter<T>);
    } else if (filters instanceof Array) {
      _filters = filters;
    } else if (filters) {
      _filters = [filters];
    }

    let query = this.supabase.from(this.table).select('id').limit(1);

    if (_filters.length > 0) {
      for (const { column, operator, value } of _filters) {
        if (operator === 'in') {
          if (Array.isArray(value)) {
            query = query.filter(column, 'in', `(${(value as unknown[]).join(',')})`);
          } else {
            query = query.filter(column, 'in', value);
          }
        } else {
          query = query.filter(column, operator, value);
        }
      }
    }

    const { data, error } = await query;

    if (error && error.code !== 'PGRST116') {
      console.error(`Error checking existence in ${this.table}:`, error);
      throw error;
    }

    return data !== null && data.length > 0;
  }

  async count(filters?: Filters<T> | Filter<T>, search?: { text: string; columns: (keyof T)[] }): Promise<number> {
    let query = this.supabase.from(this.table).select('id', { count: 'exact' });

    if (filters) {
      for (const { column, operator, value } of filters instanceof Array ? filters : [filters]) {
        if (operator === 'in') {
          if (Array.isArray(value)) {
            query = query.filter(column, 'in', `(${(value as unknown[]).join(',')})`);
          } else {
            query = query.filter(column, 'in', value);
          }
        } else {
          query = query.filter(column, operator, value);
        }
      }
    }

    if (search && search.text.trim().length > 0) {
      const searchText = search.text.trim();

      const orConditions = search.columns.map((col) => `${String(col)}.ilike.%${searchText}%`).join(',');

      query = query.or(orConditions);
    }

    const { count, error }: PostgrestSingleResponse<{ id: string }[]> = await query;

    if (error) {
      console.error(`Error counting from ${this.table}:`, error);
      throw error;
    }

    return count || 0;
  }

  async getOne(filters: Filters<T> | Filter<T>, orderBy?: string, ascending: boolean = true): Promise<T> {
    let query = this.supabase.from(this.table).select('*').limit(1);

    if (filters) {
      for (const { column, operator, value } of filters instanceof Array ? filters : [filters]) {
        if (operator === 'in') {
          if (Array.isArray(value)) {
            query = query.filter(column, 'in', `(${(value as unknown[]).join(',')})`);
          } else {
            query = query.filter(column, 'in', value);
          }
        } else {
          query = query.filter(column, operator, value);
        }
      }
    }

    if (orderBy) {
      query = query.order(orderBy, { ascending });
    }

    const { data, error }: PostgrestSingleResponse<T> = await query.single();

    // PGRST116 means no data found
    if (error && error.code !== 'PGRST116') {
      console.error(`Error fetching one from ${this.table}:`, error);
      throw error;
    }

    if (!data) {
      console.warn(`No data found for ${this.table} with filters:`, filters);
      throw new Error(`No data found for ${this.table} with filters: ${JSON.stringify(filters)}`);
    }

    return data;
  }

  async getOneOrNull(filters: Filters<T> | Filter<T>, orderBy?: string, ascending: boolean = true): Promise<T | null> {
    let query = this.supabase.from(this.table).select('*').limit(1);

    if (filters) {
      for (const { column, operator, value } of filters instanceof Array ? filters : [filters]) {
        if (operator === 'in') {
          if (Array.isArray(value)) {
            query = query.filter(column, 'in', `(${(value as unknown[]).join(',')})`);
          } else {
            query = query.filter(column, 'in', value);
          }
        } else {
          query = query.filter(column, operator, value);
        }
      }
    }

    if (orderBy) {
      query = query.order(orderBy, { ascending });
    }

    const { data, error }: PostgrestSingleResponse<T> = await query.single();

    // PGRST116 means no data found
    if (error && error.code !== 'PGRST116') {
      console.error(`Error fetching one from ${this.table}:`, error);
      throw error;
    }

    if (!data) {
      return null;
    }

    return data;
  }

  async getById(id: string): Promise<T> {
    const query = this.supabase.from(this.table).select('*').eq('id', id);

    const { data, error }: PostgrestSingleResponse<T> = await query.single();

    // PGRST116 means no data found
    if (error && error.code !== 'PGRST116') {
      console.error(`Error fetching ${this.table} by id:`, error);
      throw error;
    }

    if (!data) {
      console.warn(`No data found for ${this.table} with id: ${id}`);
      throw new Error(`No data found for ${this.table} with id: ${id}`);
    }

    return data;
  }

  async getByIdOrNull(id: string): Promise<T | null> {
    const query = this.supabase.from(this.table).select('*').eq('id', id);

    const { data, error }: PostgrestSingleResponse<T> = await query.single();

    // PGRST116 means no data found
    if (error && error.code !== 'PGRST116') {
      console.error(`Error fetching ${this.table} by id:`, error);
      throw error;
    }

    if (!data) {
      return null;
    }

    return data;
  }

  async create(data: Omit<T, keyof GenericRecord>): Promise<T> {
    const byUser = await this.getUserOrNull();

    const { data: createdRecord, error }: PostgrestSingleResponse<T> = await this.supabase
      .from(this.table)
      .insert({
        ...data,
        createdAt: new Date(),
        createdBy: byUser?.id,
        updatedAt: new Date(),
        updatedBy: byUser?.id
      })
      .select()
      .single();

    if (error) {
      console.error(`Error creating ${this.table}:`, error);
      throw error;
    }

    if (!createdRecord) {
      throw new Error(`Failed to create record in ${this.table}`);
    }

    return createdRecord;
  }

  async update(id: string, updates: Partial<T>): Promise<T> {
    const byUser = await this.getUserOrNull();

    const { data, error } = await this.supabase
      .from(this.table)
      .update({
        ...updates,
        updatedAt: new Date(),
        updatedBy: byUser?.id
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

    return data;
  }

  async updateMany(updates: Partial<T>, filters: Filters<T> | Filter<T>): Promise<T[]> {
    const byUser = await this.getUser();

    let query = this.supabase.from(this.table).update({
      ...updates,
      updatedAt: new Date(),
      updatedBy: byUser.id
    });

    if (filters) {
      for (const { column, operator, value } of filters instanceof Array ? filters : [filters]) {
        if (operator === 'in') {
          if (Array.isArray(value)) {
            query = query.filter(column, 'in', `(${(value as unknown[]).join(',')})`);
          } else {
            query = query.filter(column, 'in', value);
          }
        } else {
          query = query.filter(column, operator, value);
        }
      }
    }

    const { data, error } = await query.select();

    if (error) {
      console.error(`Error updating many in ${this.table}:`, error);
      throw error;
    }

    return data || [];
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase.from(this.table).delete().eq('id', id);

    if (error) {
      console.error(`Error deleting from ${this.table}:`, error);
      throw error;
    }
  }

  async deleteMany(filters: Filters<T> | Filter<T>): Promise<void> {
    let query = this.supabase.from(this.table).delete();

    if (filters) {
      for (const { column, operator, value } of filters instanceof Array ? filters : [filters]) {
        if (operator === 'in') {
          if (Array.isArray(value)) {
            query = query.filter(column, 'in', `(${(value as unknown[]).join(',')})`);
          } else {
            query = query.filter(column, 'in', value);
          }
        } else {
          query = query.filter(column, operator, value);
        }
      }
    }

    const { error } = await query;

    if (error) {
      console.error(`Error deleting many from ${this.table}:`, error);
      throw error;
    }
  }

  deleteByIds(ids: string[]): Promise<void> {
    return this.deleteMany({ column: 'id', operator: 'in', value: ids } as Filter<T>);
  }

  subscribeToRowById(id: string, callback: (data: T | null) => void): () => void {
    const channel = this.supabase
      .channel(`row:${this.table}:${id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: this.table,
          filter: `id=eq.${id}`
        },
        (payload: RealtimePostgresChangesPayload<T>) => {
          if (payload.new) {
            callback(payload.new as T);
          } else {
            callback(null);
          }
        }
      )
      .subscribe();

    return () => {
      this.supabase.removeChannel(channel);
    };
  }
}
