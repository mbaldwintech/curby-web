import { AdminHeader } from '@core/components/admin-header';

interface EventTypeDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default async function EventTypeDetailsPage({ params }: EventTypeDetailsPageProps) {
  const { id } = await params;

  return (
    <>
      <AdminHeader title="Event Type Details" />
      <div className="@container/main flex flex-1 flex-col p-4 md:gap-6 md:p-6">Event Type Details {id}</div>
    </>
  );
}
