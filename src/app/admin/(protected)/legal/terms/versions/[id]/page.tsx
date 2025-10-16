import { AdminPageContainer } from '@core/components';

interface TermsAndConditionsVersionDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default async function TermsAndConditionsVersionDetailsPage({
  params
}: TermsAndConditionsVersionDetailsPageProps) {
  const { id } = await params;

  return (
    <AdminPageContainer title="Terms & Conditions Version Details">
      Terms & Conditions Version Details {id}
    </AdminPageContainer>
  );
}
