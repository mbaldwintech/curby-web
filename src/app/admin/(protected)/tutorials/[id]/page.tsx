import { AdminHeader } from '@core/components/admin-header';

interface TutorialDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default async function TutorialDetailsPage({ params }: TutorialDetailsPageProps) {
  const { id } = await params;

  return (
    <>
      <AdminHeader title="Tutorial Details" />
      <div className="@container/main flex flex-1 flex-col p-4 md:gap-6 md:p-6">Tutorial Details {id}</div>
    </>
  );
}
