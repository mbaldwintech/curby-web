'use client';

import { MediaService } from '@core/services';
import { Media } from '@core/types';
import { createClientService } from '@supa/utils/client';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

export interface MediaCellProps {
  mediaId?: string | null;
}

export function MediaCell({ mediaId }: MediaCellProps) {
  const mediaService = useRef(createClientService(MediaService)).current;
  const [media, setMedia] = useState<Media | null>(null);

  useEffect(() => {
    if (mediaId) {
      mediaService
        .getById(mediaId)
        .then((data) => {
          setMedia(data);
        })
        .catch(() => setMedia(null));
    } else {
      setMedia(null);
    }
  }, [mediaId, mediaService]);

  if (!mediaId || !media) {
    return null;
  }

  return <Image src={media.url} alt={media.filename} width={50} height={50} className="rounded-md" />;
}
