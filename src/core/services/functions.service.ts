import type { SupabaseClient } from '@supabase/supabase-js';
import { PostgrestResponse } from '@supabase/supabase-js';
import { EventTypeKey, ItemType } from '../enumerations';
import { BoundingBox, ExtendedItem, ItemCluster } from '../types';
import { createLogger } from '@core/utils';

const logger = createLogger('FunctionsService');

export interface FreeItemFeedCursor {
  score: number;
  createdAt: Date;
  id: string;
}

export interface FreeItemFeedResponse {
  rows: ExtendedItem[];
  next: FreeItemFeedCursor | null;
}

export class FunctionsService {
  constructor(protected supabase: SupabaseClient) {}

  async trackEvent(
    eventKey: (typeof EventTypeKey)[keyof typeof EventTypeKey],
    { userId, deviceId, metadata = {} }: { userId?: string; deviceId?: string; metadata: Record<string, unknown> }
  ) {
    try {
      logger.debug('Logging event', eventKey);
      const { error } = await this.supabase.functions.invoke('process-event', {
        body: {
          eventKey,
          deviceId,
          userId,
          metadata
        }
      });

      if (error) {
        logger.error(`Supabase returned an error for event ${eventKey}:`, error);
      }
    } catch (error) {
      logger.error(`Supabase threw an error for event ${eventKey}:`, error);
    }
  }

  async getFreeItemFeed(
    lon: number,
    lat: number,
    radiusKm: number | null,
    cursor: FreeItemFeedCursor | null,
    limit = 30
  ): Promise<FreeItemFeedResponse> {
    const { data: rows, error }: PostgrestResponse<ExtendedItem> = await this.supabase.rpc('fetch_item_feed', {
      p_item_type: ItemType.Free,
      p_lon: lon,
      p_lat: lat,
      p_radius_km: radiusKm,
      p_cursor_score: cursor?.score ?? null,
      p_cursor_date: cursor?.createdAt ?? null,
      p_cursor_id: cursor?.id ?? null,
      p_limit: limit
    });

    if (error) {
      throw error;
    }

    if (!rows || rows.length === 0) {
      return { rows: [], next: null };
    }

    const last = rows[rows.length - 1];
    const next: FreeItemFeedCursor | null =
      rows.length < limit
        ? null
        : {
            score: last.feedScore!,
            createdAt: last.createdAt,
            id: last.id
          };

    return {
      rows,
      next
    };
  }

  async getFreeItemMapClusters({
    centerLon,
    centerLat,
    minLon,
    minLat,
    maxLon,
    maxLat,
    gridSizeKm = 1
  }: BoundingBox & { gridSizeKm?: number }): Promise<ItemCluster[]> {
    const { data, error }: PostgrestResponse<ItemCluster> = await this.supabase.rpc('fetch_items_with_clusters', {
      p_item_type: ItemType.Free,
      p_lon: centerLon,
      p_lat: centerLat,
      p_min_lon: minLon,
      p_min_lat: minLat,
      p_max_lon: maxLon,
      p_max_lat: maxLat,
      p_limit: 2000,
      p_grid_size_km: gridSizeKm
    });

    if (error) {
      logger.error('Error fetching item clusters:', error);
      throw error;
    }

    return data;
  }

  async generateBroadcastDeliveries(
    broadcastId: string,
    scheduleId?: string,
    scheduledFor?: Date
  ): Promise<{ success: boolean; deliveriesCreated: number }> {
    const { data, error } = await this.supabase.functions.invoke('generate-broadcast-deliveries', {
      body: {
        broadcastId,
        scheduleId,
        scheduledFor: scheduledFor ? scheduledFor.toISOString() : undefined
      }
    });

    if (error) {
      throw error;
    }

    return data as { success: boolean; deliveriesCreated: number };
  }
}
