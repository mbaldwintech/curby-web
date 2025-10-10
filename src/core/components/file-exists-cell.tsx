import { ImageService } from '@core/services';
import { createClientService } from '@supa/utils/client';
import { useEffect, useRef, useState } from 'react';
import { Badge } from './badge';

export interface FileExistsCellProps {
  path?: string | null;
}

export const FileExistsCell = ({ path }: FileExistsCellProps) => {
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
    return <span>Checking...</span>;
  }

  return exists ? (
    <Badge className="bg-accent text-accent-foreground">Yes</Badge>
  ) : (
    <Badge className="bg-destructive text-foreground">No</Badge>
  );
};
