import { AdminHeader } from '@core/components/admin-header';

interface ItemDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default async function ItemDetailsPage({ params }: ItemDetailsPageProps) {
  const { id } = await params;

  return (
    <>
      <AdminHeader title="Item Details" />
      <div className="@container/main flex flex-1 flex-col p-4 md:gap-6 md:p-6">Item Details {id}</div>
    </>
  );
}
