import { AdminPageContainer } from '@core/components';

interface NotificationDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default async function NotificationDetailsPage({ params }: NotificationDetailsPageProps) {
  const { id } = await params;

  return <AdminPageContainer title="Notification Details">Notification Details {id}</AdminPageContainer>;
}
