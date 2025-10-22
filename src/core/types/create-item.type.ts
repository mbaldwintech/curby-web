import { FileAssetCreate } from '@supa/services';
import { Coordinates } from './coordinates.type';

export interface CreateItem {
  title: string;
  media: FileAssetCreate;
  coordinates: Coordinates;
}
