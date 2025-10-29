import { AdminPageContainer } from '@core/components';
import { ItemDetails } from '@features/items/components';

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
