'use client';

import { LinkButton } from '@common/components';
import { createClientService } from '@supa/utils/client';
import { useEffect, useRef, useState } from 'react';
import { ItemReviewService } from '../../services';
import { ItemReview } from '../../types';

export const ItemReviewCell = ({ itemReviewId }: { itemReviewId?: string | null }) => {
  const itemReviewService = useRef(createClientService(ItemReviewService)).current;
  const [itemReview, setItemReview] = useState<ItemReview | null>(null);

  useEffect(() => {
    if (itemReviewId) {
      itemReviewService
        .getByIdOrNull(itemReviewId)
        .then((itemReview) => {
          if (itemReview !== null) {
            setItemReview(itemReview);
          }
        })
        .catch(() => {
          setItemReview(null);
        });
    } else {
      setItemReview(null);
    }
  }, [itemReviewId, itemReviewService]);

  if (!itemReviewId || !itemReview) {
    return null;
  }

  return (
    <LinkButton
      variant="link"
      href={`/admin/moderation/item-reviews/${itemReview.id}`}
      onClick={(e) => e.stopPropagation()}
      className="p-0"
    >
      {itemReview.id}
    </LinkButton>
  );
};
