import { Button } from '@core/components';
import Link from 'next/link';

export default function AdminNotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-6xl font-bold text-primary">404</h1>
      <h2 className="text-2xl font-semibold">Page not found</h2>
      <p className="text-muted-foreground text-center max-w-md">
        The admin page you&apos;re looking for doesn&apos;t exist or you may not have access to it.
      </p>
      <Link href="/admin">
        <Button>Go to Dashboard</Button>
      </Link>
    </div>
  );
}
