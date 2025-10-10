import { BoundingBox } from './bounding-box.type';
import { ExtendedItem } from './extended-item.type';

export interface ItemCluster {
  key: string;
  count: number;
  boundingBox: BoundingBox;
  itemIds: string[];
  items: ExtendedItem[];
}
