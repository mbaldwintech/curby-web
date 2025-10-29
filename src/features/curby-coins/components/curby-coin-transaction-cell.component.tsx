'use client';

import { LinkButton } from '@core/components';
import { CurbyCoinTransactionService } from '@core/services';
import { CurbyCoinTransaction } from '@core/types';
import { createClientService } from '@supa/utils/client';
import { useEffect, useRef, useState } from 'react';

export const CurbyCoinTransactionCell = ({ curbyCoinTransactionId }: { curbyCoinTransactionId?: string | null }) => {
  const curbyCoinTransactionService = useRef(createClientService(CurbyCoinTransactionService)).current;
  const [curbyCoinTransaction, setCurbyCoinTransaction] = useState<CurbyCoinTransaction | null>(null);

  useEffect(() => {
    if (curbyCoinTransactionId) {
      curbyCoinTransactionService
        .getByIdOrNull(curbyCoinTransactionId)
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
  }, [curbyCoinTransactionId, curbyCoinTransactionService]);

  if (!curbyCoinTransactionId || !curbyCoinTransaction) {
    return null;
  }

  return (
    <LinkButton
      variant="link"
      href={`/admin/curby-coins/transactions/${curbyCoinTransaction.id}`}
      onClick={(e) => e.stopPropagation()}
      className="p-0"
    >
      {curbyCoinTransaction.id}
    </LinkButton>
  );
};
