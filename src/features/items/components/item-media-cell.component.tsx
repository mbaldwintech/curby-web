'use client';

import { ItemMediaService } from '@core/services';
import { ItemMedia } from '@core/types';
import { MediaCell } from '@features/media/components';
import { createClientService } from '@supa/utils/client';
import { useEffect, useRef, useState } from 'react';

export const ItemMediaCell = ({ itemId }: { itemId?: string | null }) => {
  const itemMediaService = useRef(createClientService(ItemMediaService)).current;
  const [itemMedia, setItemMedia] = useState<ItemMedia | null>(null);

  useEffect(() => {
    if (itemId) {
      itemMediaService
        .getOneOrNull([{ column: 'itemId', operator: 'eq', value: itemId }])
        .then((itemMedia) => {
          setItemMedia(itemMedia);
        })
        .catch(() => {
          setItemMedia(null);
        });
    } else {
      setItemMedia(null);
    }
  }, [itemId, itemMediaService]);

  return <MediaCell mediaId={itemMedia?.mediaId} />;
};
