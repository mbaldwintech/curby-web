import { Coordinates } from '@common/types';
import { FileAssetCreate } from '@supa/services';

export interface CreateItem {
  title: string;
  media: FileAssetCreate;
  coordinates: Coordinates;
}
