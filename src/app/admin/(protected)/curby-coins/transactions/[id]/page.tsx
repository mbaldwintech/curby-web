import { AdminHeader } from '@core/components/admin-header';

interface CurbyCoinTransactionDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default async function CurbyCoinTransactionDetailsPage({ params }: CurbyCoinTransactionDetailsPageProps) {
  const { id } = await params;

  return (
    <>
      <AdminHeader title="Curby Coin Transaction Details" />
      <div className="@container/main flex flex-1 flex-col p-4 md:gap-6 md:p-6">
        Curby Coin Transaction Details {id}
      </div>
    </>
  );
}
