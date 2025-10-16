import { AdminPageContainer } from '@core/components';

interface TutorialDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default async function TutorialDetailsPage({ params }: TutorialDetailsPageProps) {
  const { id } = await params;

  return <AdminPageContainer title="Tutorial Details">Tutorial Details {id}</AdminPageContainer>;
}
