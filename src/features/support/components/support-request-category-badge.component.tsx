import { Badge } from '@core/components';
import { SupportRequestCategory } from '@core/enumerations';
import { Bug, CircleQuestionMark, CircleUserRound, CreditCard, MessageCircleQuestion, ShieldAlert } from 'lucide-react';

export const SupportRequestCategoryBadge = ({ category }: { category?: SupportRequestCategory | null }) => {
  if (!category) {
    return null;
  }
  switch (category) {
    case SupportRequestCategory.Bug:
      return (
        <Badge variant="outline">
          <Bug />
          Bug
        </Badge>
      );
    case SupportRequestCategory.Account:
      return (
        <Badge variant="outline">
          <CircleUserRound />
          Account
        </Badge>
      );
    case SupportRequestCategory.Billing:
      return (
        <Badge variant="outline">
          <CreditCard />
          Billing
        </Badge>
      );
    case SupportRequestCategory.ContentModeration:
      return (
        <Badge variant="outline">
          <ShieldAlert />
          Content Moderation
        </Badge>
      );
    case SupportRequestCategory.General:
      return (
        <Badge variant="outline">
          <MessageCircleQuestion />
          General
        </Badge>
      );
    case SupportRequestCategory.Other:
      return (
        <Badge variant="outline">
          <CircleQuestionMark />
          Other
        </Badge>
      );
    default:
      return <>{category}</>;
  }
};
