'use client';

import { Card, CardContent, CardHeader, CardTitle, CopyableStringCell } from '@core/components';
import { ExtendedItem, SavedItem } from '@core/types';
import { formatDateTime } from '@core/utils';
import { ProfileCell } from '@features/users/components';
import { CheckCircleIcon, CircleAlertIcon, InfoIcon } from 'lucide-react';

interface ItemInformationCardProps {
  item: ExtendedItem;
  savedByUsers: SavedItem[];
}

export function ItemInformationCard({ item, savedByUsers }: ItemInformationCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <InfoIcon className="w-4 h-4" />
          Item Information
        </CardTitle>
        <p className="text-sm text-muted-foreground">Detailed information about this item</p>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <div className="text-xs text-muted-foreground">Posted By</div>
          <ProfileCell userId={item.postedBy} className="text-sm py-0 h-auto text-card-foreground" />
          <div className="text-xs text-muted-foreground">
            {item.createdAt ? formatDateTime(new Date(item.createdAt)) : '-'}
          </div>
        </div>

        <div>
          <div className="text-xs text-muted-foreground">Location</div>
          <div className="text-sm">{item.geoLocation || 'Not specified'}</div>
          <div className="text-xs text-muted-foreground">GeoLocation (WKT format)</div>
        </div>

        <div>
          <div className="text-xs text-muted-foreground">Taken Status</div>
          <div className="text-sm">
            {item.taken ? (
              <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                <CheckCircleIcon className="w-3 h-3" />
                Taken
                {item.takenBy && (
                  <>
                    {' by '}
                    <ProfileCell userId={item.takenBy} className="text-sm py-0 h-auto" />
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                <CircleAlertIcon className="w-3 h-3" />
                Available
              </div>
            )}
          </div>
          <div className="text-xs text-muted-foreground">
            {item.taken && item.takenAt ? formatDateTime(new Date(item.takenAt)) : 'Available for taking'}
          </div>
        </div>

        <div>
          <div className="text-xs text-muted-foreground">Expiration</div>
          <div className="text-sm">{formatDateTime(new Date(item.expiresAt))}</div>
          <div className="text-xs text-muted-foreground">
            Extended {item.extendedCount} time{item.extendedCount !== 1 ? 's' : ''}
          </div>
        </div>

        <div>
          <div className="text-xs text-muted-foreground">Item ID</div>
          <CopyableStringCell value={item.id} className="text-sm break-all" />
        </div>

        <div>
          <div className="text-xs text-muted-foreground">Reports</div>
          <div className="text-sm">
            {item.reportedCount || 0} report{item.reportedCount !== 1 ? 's' : ''}
          </div>
        </div>

        {item.taken && item.confirmedTakenAt && (
          <div>
            <div className="text-xs text-muted-foreground">Confirmed Taken</div>
            <div className="text-sm">{formatDateTime(new Date(item.confirmedTakenAt))}</div>
          </div>
        )}

        {savedByUsers.length > 0 && (
          <div>
            <div className="text-xs text-muted-foreground">Saved by Users</div>
            <div className="text-sm">
              {savedByUsers.length} user{savedByUsers.length !== 1 ? 's' : ''}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
