'use client';

import { Card, CardContent, CardHeader, CardTitle, CopyableStringCell } from '@core/components';
import { ExtendedItem, FalseTaking } from '@core/types';
import { formatDateTime } from '@core/utils';
import { ProfileCell } from '@features/users/components';
import { FlagIcon, ShieldCheckIcon } from 'lucide-react';

interface ItemAdminDataCardProps {
  item: ExtendedItem;
  falseTakings: FalseTaking[];
}

export function ItemAdminDataCard({ item, falseTakings }: ItemAdminDataCardProps) {
  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <ShieldCheckIcon className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          Admin Data
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Information only visible to admins for moderation and support purposes
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">System Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <div className="text-xs text-muted-foreground">Created</div>
              <div className="text-sm">{formatDateTime(new Date(item.createdAt))}</div>
              <div className="text-xs text-muted-foreground">System generated</div>
            </div>

            <div>
              <div className="text-xs text-muted-foreground">Last Updated</div>
              <div className="text-sm">{item.updatedAt ? formatDateTime(new Date(item.updatedAt)) : 'Never'}</div>
            </div>

            <div>
              <div className="text-xs text-muted-foreground">GeoLocation (Raw)</div>
              <CopyableStringCell value={item.geoLocation || 'Not set'} className="text-xs break-all" />
            </div>

            <div>
              <div className="text-xs text-muted-foreground">Feed Score</div>
              <div className="text-sm">{item.feedScore || 'Not calculated'}</div>
            </div>
          </CardContent>
        </Card>

        {falseTakings.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">False Takings</CardTitle>
              <div className="text-sm text-muted-foreground mb-2">False takings reported for this item</div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {falseTakings.map((ft) => (
                  <div key={ft.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <FlagIcon className="w-4 h-4 text-red-500" />
                      <div>
                        <ProfileCell userId={ft.takerId} />
                        <div className="text-xs text-muted-foreground">{formatDateTime(new Date(ft.takenAt))}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}
