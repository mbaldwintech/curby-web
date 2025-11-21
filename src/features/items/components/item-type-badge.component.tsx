import { ItemType } from '@core/enumerations';
import { GiftIcon, TagIcon } from 'lucide-react';

export const ItemTypeBadge = ({ type }: { type?: ItemType | null }) => {
  if (!type) {
    return null;
  }
  switch (type) {
    case ItemType.Free:
      return (
        <div className="flex items-center gap-2 text-accent2 dark:text-accent2">
          <GiftIcon className="w-4 h-4" />
          Free
        </div>
      );
    default:
      return (
        <div className="flex items-center gap-2">
          <TagIcon className="w-4 h-4" />
          <span>{type}</span>
        </div>
      );
  }
};
