import { AdminPageContainer } from '@core/components';

interface CurbyCoinTransactionTypeDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default async function CurbyCoinTransactionTypeDetailsPage({
  params
}: CurbyCoinTransactionTypeDetailsPageProps) {
  const { id } = await params;

  return (
    <AdminPageContainer title="Curby Coin Transaction Type Details">
      Curby Coin Transaction Type Details {id}
    </AdminPageContainer>
  );
}
