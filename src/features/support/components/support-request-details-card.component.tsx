'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@core/components';
import { SupportRequest } from '@core/types';
import { HeartHandshake } from 'lucide-react';
import { CustomerSatisfaction } from './customer-satisfaction.component';
import { SupportRequestCategoryBadge } from './support-request-category-badge.component';
import { SupportRequestPriorityBadge } from './support-request-priority-badge.component';

interface SupportRequestDetailsCardProps {
  supportRequest: SupportRequest;
}

export function SupportRequestDetailsCard({ supportRequest }: SupportRequestDetailsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HeartHandshake className="h-5 w-5" />
          Request Details
        </CardTitle>
        <CardDescription className="flex items-center gap-2">
          <SupportRequestCategoryBadge category={supportRequest.category} />
          <SupportRequestPriorityBadge priority={supportRequest.priority} />
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <div>
          <h3 className="text-sm text-foreground/70">Subject</h3>
          <p className="font-medium">{supportRequest.subject}</p>
        </div>
        <div>
          <h3 className="text-sm text-foreground/70">Message</h3>
          <p>{supportRequest.message}</p>
        </div>
        {supportRequest.customerSatisfaction !== null && supportRequest.customerSatisfaction !== undefined && (
          <div>
            <h3 className="text-sm text-foreground/70">Customer Satisfaction</h3>
            <CustomerSatisfaction rating={supportRequest.customerSatisfaction} />
          </div>
        )}
        {supportRequest.customerFeedback && (
          <div>
            <h3 className="text-sm text-foreground/70">Customer Feedback</h3>
            <p>{supportRequest.customerFeedback}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
