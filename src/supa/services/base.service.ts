import type { SupabaseClient } from '@supabase/supabase-js';
import {
  PostgrestResponse,
  PostgrestSingleResponse,
  RealtimePostgresChangesPayload,
  User
} from '@supabase/supabase-js';
import { GenericRecord, GenericRecordMetadata, GenericRecordMetadataField } from '../types';

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
    protected supabase: SupabaseClient,
    protected metadata: Partial<GenericRecordMetadata<T>>
  ) {}

  /**
   * Override this in child classes to specify which columns are arrays
   * and should use different search operators
   */
  protected getArrayColumns(): (keyof T)[] {
    if (!this.metadata) return [];

    return (Object.keys(this.metadata) as (keyof T)[]).filter((key) => {
      const field = (this.metadata as Record<string, unknown>)[key as string] as GenericRecordMetadataField<unknown>;
      return field?.isArray;
    });
  }

  /**
   * Override this in child classes to specify which columns are non-text types
   * (boolean, number, date, etc.) that shouldn't use text search operators
   */
  protected getNonTextColumns(): (keyof T)[] {
    if (!this.metadata) return [];

    return (Object.keys(this.metadata) as (keyof T)[]).filter((key) => {
      const field = (this.metadata as Record<string, unknown>)[key as string] as GenericRecordMetadataField<unknown>;
      return (
        field &&
        !field.searchable &&
        (field.type === 'boolean' ||
          field.type === 'number' ||
          field.type === 'date' ||
          field.type === 'uuid' ||
          field.isArray)
      );
    });
  }

  /**
   * Override this in child classes to specify which columns support text search.
   * If not overridden, will attempt to filter out known non-text types automatically.
   */
  protected getSearchableColumns(): (keyof T)[] {
    if (!this.metadata) return [];

    return (Object.keys(this.metadata) as (keyof T)[]).filter((key) => {
      const field = (this.metadata as Record<string, unknown>)[key as string] as GenericRecordMetadataField<unknown>;
      return field?.searchable === true;
    });
  }

  /**
   * Build safe search conditions that handle different column types
   * This method relies on GenericRecordMetadata to determine searchability
   */
  protected buildSearchConditions(searchText: string, columns: (keyof T)[] = []): string[] {
    const conditions: string[] = [];

    for (const col of columns) {
      const columnName = String(col);

      // Get metadata for this specific column
      const fieldMeta = this.metadata?.[col] as GenericRecordMetadataField<unknown> | undefined;

      if (!fieldMeta) {
        // No metadata available for this column - skip it to be safe
        console.warn(`No metadata found for column '${columnName}' - skipping in search`);
        continue;
      }

      if (!fieldMeta.searchable) {
        // Column is explicitly marked as non-searchable
        console.warn(`Skipping non-searchable column '${columnName}' as defined in metadata`);
        continue;
      }

      // Handle array columns based on their element type
      if (fieldMeta.isArray) {
        const arrayCondition = this.buildArraySearchCondition(columnName, fieldMeta.type, searchText);
        if (arrayCondition) {
          conditions.push(arrayCondition);
        } else {
          console.warn(`Skipping array column '${columnName}' - unsupported array type '${fieldMeta.type}' for search`);
        }
        continue;
      }

      // Handle regular (non-array) columns
      const regularCondition = this.buildRegularSearchCondition(columnName, fieldMeta.type, searchText);
      if (regularCondition) {
        conditions.push(regularCondition);
      } else {
        console.warn(`Skipping column '${columnName}' - unsupported type '${fieldMeta.type}' for search`);
      }
    }

    return conditions;
  }

  /**
   * Build search condition for array columns based on element type
   * Note: Array searching in PostgREST is limited - it can only do exact matches
   */
  private buildArraySearchCondition(columnName: string, elementType: string, searchText: string): string | null {
    switch (elementType) {
      case 'string':
      case 'text': {
        // For string arrays, we have limited options with PostgREST:
        // 1. Exact match: cs.{value} - checks if array contains exactly "value"
        // 2. Multiple values: cs.{value1,value2} - checks if array contains all values
        // We'll use exact match since partial matching isn't supported in arrays
        return `${columnName}.cs.{${searchText}}`;
      }

      case 'enum':
        // For enum arrays, search for exact enum value matches
        // This works well since enum values are typically short and distinct
        return `${columnName}.cs.{${searchText}}`;

      case 'uuid':
        // For UUID arrays, search for exact UUID matches
        // Only search if the input looks like a UUID
        if (searchText.match(/^[0-9a-f-]{8,}$/i)) {
          return `${columnName}.cs.{${searchText}}`;
        }
        return null;

      case 'number':
      case 'integer':
        // For number arrays, only search if the search text is a valid number
        if (!isNaN(Number(searchText))) {
          return `${columnName}.cs.{${Number(searchText)}}`;
        }
        return null;

      case 'boolean': {
        // For boolean arrays, only search if the search text is a valid boolean
        const boolValue = searchText.toLowerCase();
        if (boolValue === 'true') {
          return `${columnName}.cs.{true}`;
        } else if (boolValue === 'false') {
          return `${columnName}.cs.{false}`;
        }
        return null;
      }

      default:
        // Unsupported array element type - skip it
        console.warn(`Array search not supported for type '${elementType}' - skipping`);
        return null;
    }
  }

  /**
   * Build search condition for regular (non-array) columns based on type
   */
  private buildRegularSearchCondition(columnName: string, type: string, searchText: string): string | null {
    switch (type) {
      case 'string':
      case 'text':
      case 'enum':
        // For text-based types, use case-insensitive partial matching
        return `${columnName}.ilike.%${searchText}%`;

      case 'uuid':
        // For UUIDs, only search if it looks like a valid UUID
        // This allows partial UUID matching for admin/debug purposes
        if (searchText.match(/^[0-9a-f-]{8,}$/i)) {
          return `${columnName}.ilike.%${searchText}%`;
        }
        return null;

      case 'number':
      case 'integer':
        // For numbers, only search if the search text is a valid number
        if (!isNaN(Number(searchText))) {
          return `${columnName}.eq.${searchText}`;
        }
        return null;

      case 'boolean': {
        // For booleans, only search if the search text is a valid boolean
        const boolValue = searchText.toLowerCase();
        if (boolValue === 'true' || boolValue === 'false') {
          return `${columnName}.eq.${boolValue}`;
        }
        return null;
      }

      case 'date':
      case 'datetime':
      case 'timestamp': {
        // For dates, try to parse as date and use range search
        try {
          const date = new Date(searchText);
          if (!isNaN(date.getTime())) {
            return `${columnName}.gte.${date.toISOString().split('T')[0]}`;
          }
        } catch {
          // Invalid date format
        }
        return null;
      }

      default:
        // Unsupported type - default to text search
        return `${columnName}.ilike.%${searchText}%`;
    }
  }

  /**
   * Apply transformations to data if metadata transformers are provided
   */
  protected transformData(data: T[]): T[] {
    if (!this.metadata) return data;

    return data.map((item) => {
      const transformed = { ...item };

      for (const [key, fieldMeta] of Object.entries(this.metadata!)) {
        const field = fieldMeta as { transform?: (value: unknown) => unknown };
        if (field?.transform && key in transformed) {
          try {
            (transformed as Record<string, unknown>)[key] = field.transform(transformed[key as keyof T]);
          } catch (error) {
            console.warn(`Failed to transform ${key}:`, error);
          }
        }
      }

      return transformed;
    });
  }

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
    search?: { text: string; columns?: (keyof T)[] }
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

      // Use the helper method to build safe search conditions
      const searchConditions = this.buildSearchConditions(searchText, search.columns);

      if (searchConditions.length > 0) {
        query = query.or(searchConditions.join(','));
      }
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

      // Use the helper method to build safe search conditions
      const searchConditions = this.buildSearchConditions(searchText, search.columns);

      if (searchConditions.length > 0) {
        query = query.or(searchConditions.join(','));
      }
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
