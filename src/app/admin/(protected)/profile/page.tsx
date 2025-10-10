import { AdminHeader } from '@core/components/admin-header';
import { ProfileDetails } from '@core/components/profile-details';
import { updateEmail, updateUsername, validateUsername } from './actions';

export default async function ProfilePage() {
  return (
    <>
      <AdminHeader title="My Profile" />
      <div className="@container/main flex flex-1 flex-col p-4 md:gap-6 md:p-6">
        <ProfileDetails validateUsername={validateUsername} updateEmail={updateEmail} updateUsername={updateUsername} />
      </div>
    </>
  );
}
