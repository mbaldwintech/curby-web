'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@core/components';
import { ModerationTrend } from '@core/types';
import { TrendingUp } from 'lucide-react';
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export function ModerationTrendsChart({ trends }: { trends: ModerationTrend[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Moderation Trends (30 Days)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="trendDate" tickFormatter={(date) => new Date(date).toLocaleDateString()} />
              <YAxis />
              <Tooltip
                labelFormatter={(date) => new Date(date).toLocaleDateString()}
                labelClassName="text-background font-bold"
              />
              <Legend />
              <Line type="monotone" dataKey="dailyReports" stroke="#ef4444" name="Reports" />
              <Line type="monotone" dataKey="dailyUserFlags" stroke="#f97316" name="User Flags" />
              <Line type="monotone" dataKey="dailyFalseTakings" stroke="#3b82f6" name="False Takings" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
