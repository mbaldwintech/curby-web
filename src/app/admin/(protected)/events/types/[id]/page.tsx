import { AdminPageContainer } from '@core/components';

interface EventTypeDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default async function EventTypeDetailsPage({ params }: EventTypeDetailsPageProps) {
  const { id } = await params;

  return <AdminPageContainer title="Event Type Details">Event Type Details {id}</AdminPageContainer>;
}
