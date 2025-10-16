import { AdminPageContainer } from '@core/components';

interface TutorialViewDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default async function TutorialViewDetailsPage({ params }: TutorialViewDetailsPageProps) {
  const { id } = await params;

  return <AdminPageContainer title="Tutorial View Details">Tutorial View Details {id}</AdminPageContainer>;
}
