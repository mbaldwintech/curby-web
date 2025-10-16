import { AdminPageContainer } from '@core/components';

interface EventDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default async function EventDetailsPage({ params }: EventDetailsPageProps) {
  const { id } = await params;

  return <AdminPageContainer title="Event Details">Event Details {id}</AdminPageContainer>;
}
