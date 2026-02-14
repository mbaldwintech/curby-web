'use client';

import { Button } from '@core/components';
import { AlertTriangle } from 'lucide-react';
import { useEffect } from 'react';

export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('Admin error:', error);
  }, [error]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 p-8">
      <div className="flex items-center gap-3 text-destructive">
        <AlertTriangle className="h-8 w-8" />
        <h1 className="text-2xl font-bold">Something went wrong</h1>
      </div>
      <p className="text-muted-foreground text-center max-w-md">
        An error occurred while loading this page. Please try again or contact support if the problem persists.
      </p>
      {error.digest && <p className="text-xs text-muted-foreground font-mono">Error ID: {error.digest}</p>}
      <div className="flex gap-3">
        <Button onClick={reset}>Try again</Button>
        <Button variant="outline" onClick={() => (window.location.href = '/admin')}>
          Go to Dashboard
        </Button>
      </div>
    </div>
  );
}
