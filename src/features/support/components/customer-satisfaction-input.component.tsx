import { Separator } from '@core/components';
import { Star, StarOff } from 'lucide-react';
import { ReactNode } from 'react';

import { useState } from 'react';

export const CustomerSatisfactionInput: React.FC<{
  rating: 1 | 2 | 3 | 4 | 5 | null;
  onChange: (rating: 1 | 2 | 3 | 4 | 5 | null) => void;
  showClearButton?: boolean;
}> = ({ rating, onChange, showClearButton = false }) => {
  const [hovered, setHovered] = useState<number | null>(null);
  const stars: ReactNode[] = [];
  for (let i = 1; i <= 5; i++) {
    const isFilled = hovered !== null ? i <= hovered : i <= (rating ?? 0);
    const isHovered = hovered !== null && i <= hovered && i > (rating ?? 0);
    stars.push(
      <Star
        key={i}
        className={
          isFilled
            ? isHovered
              ? 'text-highlight/80 cursor-pointer'
              : 'text-highlight cursor-pointer'
            : 'text-muted cursor-pointer hover:text-highlight/80'
        }
        fill={isFilled ? 'var(--highlight)' : 'none'}
        onClick={() => onChange(i as 1 | 2 | 3 | 4 | 5)}
        onMouseEnter={() => setHovered(i)}
        onMouseLeave={() => setHovered(null)}
      />
    );
  }

  return (
    <div className="flex gap-1 justify-center items-center">
      {stars}
      {showClearButton && (
        <>
          <Separator orientation="vertical" className="data-[orientation=vertical]:h-4 mx-2" />
          <StarOff
            className={showClearButton ? 'text-muted cursor-pointer hover:text-destructive' : 'hidden'}
            onClick={() => onChange(null)}
          />
        </>
      )}
    </div>
  );
};
