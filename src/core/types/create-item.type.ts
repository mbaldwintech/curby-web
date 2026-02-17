import { FileAssetCreate } from '@supa/services';
import { Coordinates } from '@mbaldwintech/curby-core/types';

export interface CreateItem {
  title: string;
  media: FileAssetCreate;
  coordinates: Coordinates;
}
