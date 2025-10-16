'use client';

import { createClientService } from '@supa/utils/client';
import { useEffect, useRef, useState } from 'react';
import { CurbyCoinTransactionService } from '../../services';
import { CurbyCoinTransaction } from '../../types';

export const CurbyCoinBalanceCell = ({ userId }: { userId?: string | null }) => {
  const curbyCoinTransactionService = useRef(createClientService(CurbyCoinTransactionService)).current;
  const [curbyCoinTransaction, setCurbyCoinTransaction] = useState<CurbyCoinTransaction | null>(null);

  useEffect(() => {
    if (userId) {
      curbyCoinTransactionService
        .getOneOrNull({ column: 'userId', operator: 'eq', value: userId }, 'createdAt', false)
        .then((curbyCoinTransaction) => {
          if (curbyCoinTransaction !== null) {
            setCurbyCoinTransaction(curbyCoinTransaction);
          }
        })
        .catch(() => {
          setCurbyCoinTransaction(null);
        });
    } else {
      setCurbyCoinTransaction(null);
    }
  }, [userId, curbyCoinTransactionService]);

  if (!userId || !curbyCoinTransaction) {
    return 0;
  }

  return curbyCoinTransaction.balanceAfter;
};
