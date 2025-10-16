import { AdminPageContainer } from '@core/components';

interface PrivacyPolicyAcceptanceDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default async function PrivacyPolicyAcceptanceDetailsPage({ params }: PrivacyPolicyAcceptanceDetailsPageProps) {
  const { id } = await params;

  return (
    <AdminPageContainer title="Privacy Policy Acceptance Details">
      Privacy Policy Acceptance Details {id}
    </AdminPageContainer>
  );
}
