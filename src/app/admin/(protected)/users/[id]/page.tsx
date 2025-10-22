import { AdminPageContainer } from '@core/components';
import { ProfileDetails } from '@features/users/components';

type UserDetailsPageParams = {
  id: string;
};

export default async function UserDetailsPage({ params }: { params: Promise<UserDetailsPageParams> }) {
  const { id } = await params;

  return (
    <AdminPageContainer title="User Details">
      <ProfileDetails id={id} />
    </AdminPageContainer>
  );
}
