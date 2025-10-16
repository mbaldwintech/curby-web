import { AdminPageContainer } from '@core/components';

interface TermsAndConditionsAcceptanceDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default async function TermsAndConditionsAcceptanceDetailsPage({
  params
}: TermsAndConditionsAcceptanceDetailsPageProps) {
  const { id } = await params;

  return (
    <AdminPageContainer title="Terms & Conditions Acceptance Details">
      Terms & Conditions Acceptance Details {id}
    </AdminPageContainer>
  );
}
