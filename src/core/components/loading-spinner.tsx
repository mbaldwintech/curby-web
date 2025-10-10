'use client';

import clsx from 'clsx';
import Image from 'next/image';

export type LoadingSpinnerProps = {
  size?: number;
  loading?: boolean;
};

export function LoadingSpinner({ size = 24, loading = false }: LoadingSpinnerProps) {
  return (
    <div
      className={clsx(loading && 'animate-spin')}
      style={{
        display: 'inline-flex',
        width: size,
        height: size
      }}
    >
      <Image width={size} height={size} alt="Curby Logo" style={{ objectFit: 'contain' }} src="/Curby-Head.png" />
    </div>
  );
}
