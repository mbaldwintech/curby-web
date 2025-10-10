import { AdminHeader } from '@core/components/admin-header';

interface CurbyCoinTransactionTypeDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default async function CurbyCoinTransactionTypeDetailsPage({
  params
}: CurbyCoinTransactionTypeDetailsPageProps) {
  const { id } = await params;

  return (
    <>
      <AdminHeader title="Curby Coin Transaction Type Details" />
      <div className="@container/main flex flex-1 flex-col p-4 md:gap-6 md:p-6">
        Curby Coin Transaction Type Details {id}
      </div>
    </>
  );
}
