import { Profile } from './profile.type';

export type CreateProfile = Omit<
  Profile,
  | 'id'
  | 'role'
  | 'status'
  | 'pushNotifications'
  | 'emailNotifications'
  | 'emailMarketing'
  | 'radius'
  | 'theme'
  | 'createdAt'
  | 'updatedAt'
  | 'createdBy'
  | 'updatedBy'
  | 'avatarUrl'
>;
