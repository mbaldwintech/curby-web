import { AdminPageContainer, ItemDetails } from '@core/components';

interface ItemDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default async function ItemDetailsPage({ params }: ItemDetailsPageProps) {
  const { id } = await params;

  return (
    <AdminPageContainer title="Item Details">
      <ItemDetails id={id} />
    </AdminPageContainer>
  );
}
