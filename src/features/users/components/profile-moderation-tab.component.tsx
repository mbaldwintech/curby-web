'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@core/components';
import { Item, Profile } from '@core/types';
import { FeedbackTable } from '@features/feedback/components';
import { PrivacyPolicyAcceptanceTable, TermsAndConditionsAcceptanceTable } from '@features/legal/components';
import { ItemReportTable } from '@features/moderation/item-reports/components';
import { ItemReviewTable } from '@features/moderation/item-reviews/components';
import { UserReviewTable } from '@features/moderation/user-reviews/components';
import { TutorialViewTable } from '@features/tutorials/components';
import { InfoIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';

export interface ProfileModerationTabProps {
  profile: Profile;
  usersItems: Item[];
}

export function ProfileModerationTab({ profile, usersItems }: ProfileModerationTabProps) {
  const router = useRouter();

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Reported Items</CardTitle>
          <div className="text-sm text-muted-foreground mb-2">
            Reports made against this user&apos;s items (click a row to view report details)
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2">
            <ItemReportTable
              restrictiveFilters={[{ column: 'itemId', operator: 'in', value: usersItems.map((ui) => ui.id) }]}
              onRowClick={(row) => {
                router.push(`/admin/moderation/item-reviews/${row.id}`);
              }}
              getRowActionMenuItems={() => [
                {
                  label: 'View details',
                  icon: InfoIcon,
                  onClick: (row) => {
                    router.push(`/admin/moderation/item-reviews/${row.id}`);
                  }
                }
              ]}
              maxHeight={300}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Item Reviews</CardTitle>
          <div className="text-sm text-muted-foreground mb-2">
            Item reviews for this user&apos;s items (click a row to view review details)
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2">
            <ItemReviewTable
              restrictiveFilters={[{ column: 'itemId', operator: 'in', value: usersItems.map((ui) => ui.id) }]}
              onRowClick={(row) => {
                router.push(`/admin/moderation/item-reviews/${row.id}`);
              }}
              getRowActionMenuItems={() => [
                {
                  label: 'View details',
                  icon: InfoIcon,
                  onClick: (row) => {
                    router.push(`/admin/moderation/item-reviews/${row.id}`);
                  }
                }
              ]}
              maxHeight={300}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">User Reviews</CardTitle>
          <div className="text-sm text-muted-foreground mb-2">
            User reviews for this user (click a row to view review details)
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2">
            <UserReviewTable
              restrictiveFilters={[{ column: 'userId', operator: 'eq', value: profile.userId }]}
              onRowClick={(row) => {
                router.push(`/admin/moderation/user-reviews/${row.id}`);
              }}
              getRowActionMenuItems={() => [
                {
                  label: 'View details',
                  icon: InfoIcon,
                  onClick: (row) => {
                    router.push(`/admin/moderation/user-reviews/${row.id}`);
                  }
                }
              ]}
              maxHeight={300}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tutorial Views</CardTitle>
          <div className="text-sm text-muted-foreground mb-2">
            Tutorial views for this user (click a row to view tutorial view details)
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2">
            <TutorialViewTable
              restrictiveFilters={[{ column: 'userId', operator: 'eq', value: profile.userId }]}
              onRowClick={(row) => {
                router.push(`/admin/tutorials/views/${row.id}`);
              }}
              getRowActionMenuItems={() => [
                {
                  label: 'View details',
                  icon: InfoIcon,
                  onClick: (row) => {
                    router.push(`/admin/tutorials/views/${row.id}`);
                  }
                }
              ]}
              maxHeight={300}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Terms & Conditions Acceptances</CardTitle>
          <div className="text-sm text-muted-foreground mb-2">
            Terms & Conditions acceptances for this user (click a row to view acceptance details)
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2">
            <TermsAndConditionsAcceptanceTable
              restrictiveFilters={[{ column: 'userId', operator: 'eq', value: profile.userId }]}
              onRowClick={(row) => {
                router.push(`/admin/legal/terms/acceptances/${row.id}`);
              }}
              getRowActionMenuItems={() => [
                {
                  label: 'View details',
                  icon: InfoIcon,
                  onClick: (row) => {
                    router.push(`/admin/legal/terms/acceptances/${row.id}`);
                  }
                }
              ]}
              maxHeight={300}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Privacy Policy Acceptances</CardTitle>
          <div className="text-sm text-muted-foreground mb-2">
            Privacy Policy acceptances for this user (click a row to view acceptance details)
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2">
            <PrivacyPolicyAcceptanceTable
              restrictiveFilters={[{ column: 'userId', operator: 'eq', value: profile.userId }]}
              onRowClick={(row) => {
                router.push(`/admin/legal/privacy/acceptances/${row.id}`);
              }}
              getRowActionMenuItems={() => [
                {
                  label: 'View details',
                  icon: InfoIcon,
                  onClick: (row) => {
                    router.push(`/admin/legal/privacy/acceptances/${row.id}`);
                  }
                }
              ]}
              maxHeight={300}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Feedback</CardTitle>
          <div className="text-sm text-muted-foreground mb-2">
            Feedback submitted by this user (click a row to view feedback details)
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2">
            <FeedbackTable
              restrictiveFilters={[{ column: 'userId', operator: 'eq', value: profile.userId }]}
              onRowClick={(row) => {
                router.push(`/admin/feedback/${row.id}`);
              }}
              getRowActionMenuItems={() => [
                {
                  label: 'View details',
                  icon: InfoIcon,
                  onClick: (row) => {
                    router.push(`/admin/feedback/${row.id}`);
                  }
                }
              ]}
              maxHeight={300}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
