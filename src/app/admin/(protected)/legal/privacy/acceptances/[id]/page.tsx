import { AdminHeader } from '@core/components/admin-header';

interface PrivacyPolicyAcceptanceDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default async function PrivacyPolicyAcceptanceDetailsPage({ params }: PrivacyPolicyAcceptanceDetailsPageProps) {
  const { id } = await params;

  return (
    <>
      <AdminHeader title="Privacy Policy Acceptance Details" />
      <div className="@container/main flex flex-1 flex-col p-4 md:gap-6 md:p-6">
        Privacy Policy Acceptance Details {id}
      </div>
    </>
  );
}
