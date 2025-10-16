import { AdminPageContainer } from '@core/components';

interface NotificationTemplateDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default async function NotificationTemplateDetailsPage({ params }: NotificationTemplateDetailsPageProps) {
  const { id } = await params;

  return (
    <AdminPageContainer title="Notification Template Details">Notification Template Details {id}</AdminPageContainer>
  );
}
