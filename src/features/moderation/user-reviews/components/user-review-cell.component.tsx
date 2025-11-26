'use client';

import { LinkButton } from '@core/components';
import { UserReviewService } from '@core/services';
import { UserReview } from '@core/types';
import { createClientService } from '@supa/utils/client';
import { useEffect, useRef, useState } from 'react';

export const UserReviewCell = ({ userReviewId }: { userReviewId?: string | null }) => {
  const userReviewService = useRef(createClientService(UserReviewService)).current;
  const [userReview, setUserReview] = useState<UserReview | null>(null);

  useEffect(() => {
    if (userReviewId) {
      userReviewService
        .getByIdOrNull(userReviewId)
        .then((userReview) => {
          if (userReview !== null) {
            setUserReview(userReview);
          }
        })
        .catch(() => {
          setUserReview(null);
        });
    } else {
      setUserReview(null);
    }
  }, [userReviewId, userReviewService]);

  if (!userReviewId || !userReview) {
    return null;
  }

  return (
    <LinkButton
      variant="link"
      href={`/admin/moderation/user-reviews/${userReview.id}`}
      onClick={(e) => e.stopPropagation()}
      className="p-0"
    >
      {userReview.id}
    </LinkButton>
  );
};
