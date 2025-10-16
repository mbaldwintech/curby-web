'use client';

import { LinkButton } from '@common/components';
import { createClientService } from '@supa/utils/client';
import { useEffect, useRef, useState } from 'react';
import { CurbyCoinTransactionTypeService } from '../../services';
import { CurbyCoinTransactionType } from '../../types';

export const CurbyCoinTransactionTypeCell = ({
  curbyCoinTransactionTypeId
}: {
  curbyCoinTransactionTypeId?: string | null;
}) => {
  const curbyCoinTransactionTypeService = useRef(createClientService(CurbyCoinTransactionTypeService)).current;
  const [curbyCoinTransactionType, setCurbyCoinTransactionType] = useState<CurbyCoinTransactionType | null>(null);

  useEffect(() => {
    if (curbyCoinTransactionTypeId) {
      curbyCoinTransactionTypeService
        .getByIdOrNull(curbyCoinTransactionTypeId)
        .then((curbyCoinTransactionType) => {
          if (curbyCoinTransactionType !== null) {
            setCurbyCoinTransactionType(curbyCoinTransactionType);
          }
        })
        .catch(() => {
          setCurbyCoinTransactionType(null);
        });
    } else {
      setCurbyCoinTransactionType(null);
    }
  }, [curbyCoinTransactionTypeId, curbyCoinTransactionTypeService]);

  if (!curbyCoinTransactionTypeId || !curbyCoinTransactionType) {
    return null;
  }

  return (
    <LinkButton
      variant="link"
      href={`/admin/curby-coins/transactions/types/${curbyCoinTransactionType.id}`}
      onClick={(e) => e.stopPropagation()}
      className="p-0"
    >
      {curbyCoinTransactionType.displayName}
    </LinkButton>
  );
};
