'use client';

import { Badge } from '@core/components';
import { ImageService } from '@core/services';
import { createClientService } from '@supa/utils/client';
import { useEffect, useRef, useState } from 'react';

export interface FileExistsBadgeProps {
  path?: string | null;
}

export const FileExistsBadge = ({ path }: FileExistsBadgeProps) => {
  const fileService = useRef(createClientService(ImageService)).current;
  const [exists, setExists] = useState<boolean | null>(null);

  useEffect(() => {
    if (!path) {
      setExists(false);
      return;
    }

    fileService
      .exists(path)
      .then(setExists)
      .catch(() => setExists(false));
  }, [path, fileService]);

  if (exists === null) {
    return <Badge variant="outline">Checking...</Badge>;
  }

  if (exists) {
    return <Badge>Yes</Badge>;
  }

  return <Badge variant="destructive">No</Badge>;
};
