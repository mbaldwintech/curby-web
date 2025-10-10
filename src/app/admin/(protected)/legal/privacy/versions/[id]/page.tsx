import { AdminHeader } from '@core/components/admin-header';

interface PrivacyPolicyVersionDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default async function PrivacyPolicyVersionDetailsPage({ params }: PrivacyPolicyVersionDetailsPageProps) {
  const { id } = await params;

  return (
    <>
      <AdminHeader title="Privacy Policy Version Details" />
      <div className="@container/main flex flex-1 flex-col p-4 md:gap-6 md:p-6">
        Privacy Policy Version Details {id}
      </div>
    </>
  );
}
