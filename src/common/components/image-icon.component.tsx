'use client';

import Image, { StaticImageData } from 'next/image';
import { CSSProperties } from 'react';

export interface ImageIconProps<K extends string | number | symbol> {
  name?: K;
  size?: number;
  style?: CSSProperties;
  options?: Record<K, string | StaticImageData>;
}

export const ImageIcon = <K extends string | number | symbol>({
  name,
  size = 40,
  style,
  options
}: ImageIconProps<K>) => {
  if (!name || !options || !options[name]) return null;

  return (
    <div style={{ width: size, height: size, position: 'relative', ...style }}>
      <Image
        src={options[name]}
        alt={String(name)}
        fill
        style={{ objectFit: 'contain' }}
        priority={true} // optional for faster loading
      />
    </div>
  );
};
