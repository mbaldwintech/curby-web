import { BaseService, Cursor } from '@supa/services';
import type { SupabaseClient } from '@supabase/supabase-js';
import { CurbyCoinTransaction } from '../types';

export class CurbyCoinTransactionService extends BaseService<CurbyCoinTransaction> {
  constructor(protected supabase: SupabaseClient) {
    super('curby_coin_transaction', supabase);
  }

  async getMyBalance(): Promise<number> {
    const isAuthenticated = await this.isAuthenticated();
    if (!isAuthenticated) {
      console.warn('User is not authenticated. Cannot fetch curbyCoin balance.');
      return 0;
    }

    const user = await this.getUser();
    if (!user) {
      console.warn('No user found. Cannot fetch curbyCoin balance.');
      return 0;
    }

    const latestTransaction = await this.getOneOrNull(
      { column: 'userId', operator: 'eq', value: user.id },
      'occurredAt',
      false
    );

    return latestTransaction?.balanceAfter || 0;
  }

  async getAllMyTransactions(cursor?: Cursor<CurbyCoinTransaction>, limit = 20): Promise<CurbyCoinTransaction[]> {
    const isAuthenticated = await this.isAuthenticated();
    if (!isAuthenticated) {
      console.warn('User is not authenticated. Cannot fetch curbyCoin transactions.');
      return [];
    }

    const user = await this.getUser();
    if (!user) {
      console.warn('No user found. Cannot fetch curbyCoin transactions.');
      return [];
    }

    return this.getAll(
      { column: 'userId', operator: 'eq', value: user.id },
      { column: 'occurredAt', ascending: false },
      cursor,
      limit
    );
  }
}
