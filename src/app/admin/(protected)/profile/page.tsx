'use client';

import { AdminPageContainer } from '@core/components';
import { ProfileDetails } from '@features/users/components';
import { useAuth } from '@supa/providers';

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <AdminPageContainer title="My Profile">
      <ProfileDetails id={user?.id} />
    </AdminPageContainer>
  );
}
