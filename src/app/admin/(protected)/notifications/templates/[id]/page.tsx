import { AdminHeader } from '@core/components/admin-header';

interface NotificationTemplateDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default async function NotificationTemplateDetailsPage({ params }: NotificationTemplateDetailsPageProps) {
  const { id } = await params;

  return (
    <>
      <AdminHeader title="Notification Template Details" />
      <div className="@container/main flex flex-1 flex-col p-4 md:gap-6 md:p-6">Notification Template Details {id}</div>
    </>
  );
}
