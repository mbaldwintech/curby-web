import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle, LinkButton } from '@core/components';
import { CurbyCoinTransaction } from '@core/types';
import { ProfileCell } from '@features/users/components';
import { format } from 'date-fns';
import { Coins } from 'lucide-react';

interface EventTransactionsCardProps {
  transactions: CurbyCoinTransaction[];
}

export function EventTransactionsCard({ transactions }: EventTransactionsCardProps) {
  if (transactions.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/20">
            <Coins className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <CardTitle>Curby Coin Transactions ({transactions.length})</CardTitle>
            <CardDescription>Coin transactions created from this event</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {transactions.map((transaction) => (
            <Card key={transaction.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">{transaction.description}</CardTitle>
                    <CardDescription>{format(new Date(transaction.occurredAt), 'PPpp')}</CardDescription>
                  </div>
                  <Badge variant={transaction.amount > 0 ? 'default' : 'secondary'} className="text-base px-3">
                    {transaction.amount > 0 ? '+' : ''}
                    {transaction.amount}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">User</p>
                      <ProfileCell userId={transaction.userId} />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Balance After</p>
                      <p className="text-sm font-medium">{transaction.balanceAfter} coins</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    {transaction.curbyCoinTransactionTypeId && (
                      <LinkButton
                        variant="link"
                        size="sm"
                        href={`/admin/curby-coins/transactions/types/${transaction.curbyCoinTransactionTypeId}`}
                        className="p-0 h-auto"
                      >
                        View Transaction Type
                      </LinkButton>
                    )}
                    <LinkButton variant="outline" size="sm" href={`/admin/curby-coins/transactions/${transaction.id}`}>
                      View Details
                    </LinkButton>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
