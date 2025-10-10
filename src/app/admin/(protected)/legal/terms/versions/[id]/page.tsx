import { AdminHeader } from '@core/components/admin-header';

interface TermsAndConditionsVersionDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default async function TermsAndConditionsVersionDetailsPage({
  params
}: TermsAndConditionsVersionDetailsPageProps) {
  const { id } = await params;

  return (
    <>
      <AdminHeader title="Terms & Conditions Version Details" />
      <div className="@container/main flex flex-1 flex-col p-4 md:gap-6 md:p-6">
        Terms & Conditions Version Details {id}
      </div>
    </>
  );
}
