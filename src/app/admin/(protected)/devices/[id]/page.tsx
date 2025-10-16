import { AdminPageContainer } from '@core/components';

interface DeviceDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default async function DeviceDetailsPage({ params }: DeviceDetailsPageProps) {
  const { id } = await params;

  return <AdminPageContainer title="Device Details">Device Details {id}</AdminPageContainer>;
}
