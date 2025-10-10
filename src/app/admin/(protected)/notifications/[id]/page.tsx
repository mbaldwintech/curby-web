import { AdminHeader } from '@core/components/admin-header';

interface NotificationDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default async function NotificationDetailsPage({ params }: NotificationDetailsPageProps) {
  const { id } = await params;

  return (
    <>
      <AdminHeader title="Notification Details" />
      <div className="@container/main flex flex-1 flex-col p-4 md:gap-6 md:p-6">Notification Details {id}</div>
    </>
  );
}
