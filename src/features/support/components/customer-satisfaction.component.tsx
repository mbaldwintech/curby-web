import { Star } from 'lucide-react';
import { ReactNode } from 'react';

export const CustomerSatisfaction: React.FC<{
  rating?: 1 | 2 | 3 | 4 | 5 | null;
}> = ({ rating }) => {
  if (rating === null || rating === undefined) {
    return null;
  }

  const stars: ReactNode[] = [];
  for (let i = 1; i <= 5; i++) {
    if (i <= rating) {
      stars.push(<Star key={i} className="text-highlight" fill="var(--highlight)" />);
    } else {
      stars.push(<Star key={i} className="text-muted" />);
    }
  }

  return <div className="flex gap-1">{stars}</div>;
};
