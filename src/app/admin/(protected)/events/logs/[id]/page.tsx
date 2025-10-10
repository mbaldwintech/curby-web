import { AdminHeader } from '@core/components/admin-header';

interface EventDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default async function EventDetailsPage({ params }: EventDetailsPageProps) {
  const { id } = await params;

  return (
    <>
      <AdminHeader title="Event Details" />
      <div className="@container/main flex flex-1 flex-col p-4 md:gap-6 md:p-6">Event Details {id}</div>
    </>
  );
}
