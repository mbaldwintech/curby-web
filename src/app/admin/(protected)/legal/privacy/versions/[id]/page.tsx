import { AdminPageContainer } from '@core/components';

interface PrivacyPolicyVersionDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default async function PrivacyPolicyVersionDetailsPage({ params }: PrivacyPolicyVersionDetailsPageProps) {
  const { id } = await params;

  return (
    <AdminPageContainer title="Privacy Policy Version Details">Privacy Policy Version Details {id}</AdminPageContainer>
  );
}
