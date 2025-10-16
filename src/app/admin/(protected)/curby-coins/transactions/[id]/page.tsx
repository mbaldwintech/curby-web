import { AdminPageContainer } from '@core/components';

interface CurbyCoinTransactionDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default async function CurbyCoinTransactionDetailsPage({ params }: CurbyCoinTransactionDetailsPageProps) {
  const { id } = await params;

  return (
    <AdminPageContainer title="Curby Coin Transaction Details">Curby Coin Transaction Details {id}</AdminPageContainer>
  );
}
