import { AdminHeader } from '@core/components/admin-header';

interface DeviceDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default async function DeviceDetailsPage({ params }: DeviceDetailsPageProps) {
  const { id } = await params;

  return (
    <>
      <AdminHeader title="Device Details" />
      <div className="@container/main flex flex-1 flex-col p-4 md:gap-6 md:p-6">Device Details {id}</div>
    </>
  );
}
