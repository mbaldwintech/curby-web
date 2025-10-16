'use client';

import { createClientService } from '@supa/utils/client';
import { useEffect, useRef, useState } from 'react';
import { ItemMediaService } from '../../services/item-media.service';
import { ItemMedia } from '../../types';
import { MediaCell } from './media-cell';

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
