import { LoadingSpinner } from '@core/components';

export default function AdminLoading() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <LoadingSpinner loading={true} size={50} />
    </div>
  );
}
