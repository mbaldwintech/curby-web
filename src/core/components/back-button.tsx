'use client';

import { ArrowLeftIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from './base';

export function BackButton() {
  const router = useRouter();

  return (
    <Button variant="ghost" size="icon" className="size-7" onClick={() => router.back()} aria-label="Go back">
      <ArrowLeftIcon />
    </Button>
  );
}
