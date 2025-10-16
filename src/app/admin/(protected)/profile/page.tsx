'use client';

import { AdminPageContainer, ProfileDetails } from '@core/components';
import { useAuth } from '@supa/providers';

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <AdminPageContainer title="My Profile">
      <ProfileDetails id={user?.id} />
    </AdminPageContainer>
  );
}
