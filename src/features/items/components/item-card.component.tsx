'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@core/components/base/card';
import { Label } from '@core/components/base/label';
import { Skeleton } from '@core/components/base/skeleton';
import { AspectRatio } from '@core/constants';
import { ExtendedItemService } from '@core/services';
import { ExtendedItem } from '@core/types';
import { formatDateTime } from '@core/utils';
import { ProfileCell } from '@features/users/components';
import { createClientService } from '@supa/utils/client';
import { Package } from 'lucide-react';
import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ItemLocationMap } from './item-location-map.component';

export function ItemCard({ itemId }: { itemId: string }) {
  const extendedItemService = useRef(createClientService(ExtendedItemService)).current;
  const [item, setItem] = useState<ExtendedItem | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedItem = await extendedItemService.getById(itemId);
      setItem(fetchedItem);
    } catch (err) {
      console.error('Error fetching item details:', err);
      setError('Failed to load item details.');
    } finally {
      setLoading(false);
    }
  }, [extendedItemService, itemId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-6 w-40" />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-row items-stretch min-h-[200px]">
            <Skeleton
              className="rounded-lg bg-muted/20 flex-shrink-0"
              style={{ width: 240, height: AspectRatio.getHeightForWidth(240) }}
            />
            <div className="ml-4 flex-1 flex flex-col space-y-4">
              {[...Array(4)].map((_, i) => (
                <div className="grid grid-cols-2 gap-4" key={i}>
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-5 w-32" />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Error Loading Item
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center p-6 text-center">
            <div className="text-destructive font-semibold mb-2">{error}</div>
            <button
              className="px-4 py-2 rounded bg-muted text-foreground border border-input hover:bg-accent"
              onClick={refresh}
            >
              Retry
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!item) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          {`Item Details for '${item.title}'`}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-row items-stretch min-h-[200px]">
          <div
            className="rounded-lg overflow-hidden bg-muted/20 flex-shrink-0"
            style={{
              width: 240,
              height: AspectRatio.getHeightForWidth(240),
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {item.media?.[0]?.url ? (
              <Image
                src={item.media[0].url}
                alt={item.title}
                width={240}
                height={AspectRatio.getHeightForWidth(240)}
                className="object-cover h-full w-full"
                style={{ aspectRatio: '1/1', height: '100%', width: '100%' }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground min-h-[240px]">
                <Package className="w-12 h-12" />
              </div>
            )}
          </div>
          <div className="ml-4 flex-1 flex flex-col space-y-4">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Title</Label>
                  <p className="text-sm text-muted-foreground">{item.title}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Posted By</Label>
                  <ProfileCell userId={item.postedBy} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Type</Label>
                  <p className="text-sm text-muted-foreground">{item.type}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <p className="text-sm text-muted-foreground">{item.status}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Posted</Label>
                  <p className="text-sm text-muted-foreground">{formatDateTime(item.createdAt)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Expires</Label>
                  <p className="text-sm text-muted-foreground">{formatDateTime(item.expiresAt)}</p>
                </div>
              </div>
              {item.taken && (
                <div>
                  <Label className="text-sm font-medium">Taken Status</Label>
                  <p className="text-sm text-muted-foreground">
                    Taken by {item.takenBy} on {item.takenAt ? formatDateTime(item.takenAt) : 'N/A'}
                  </p>
                </div>
              )}
            </div>
            {item.location && (
              <>
                <Label className="text-sm font-medium">Location</Label>
                <ItemLocationMap location={item.location} containerClassName="h-full w-full min-h-[120px]" />
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
