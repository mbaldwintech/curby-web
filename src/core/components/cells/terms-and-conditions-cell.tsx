'use client';

import { LinkButton } from '@common/components';
import { createClientService } from '@supa/utils/client';
import { useEffect, useRef, useState } from 'react';
import { TermsAndConditionsService } from '../../services';
import { TermsAndConditions } from '../../types';

export const TermsAndConditionsCell = ({ termsAndConditionsId }: { termsAndConditionsId?: string | null }) => {
  const termsAndConditionsService = useRef(createClientService(TermsAndConditionsService)).current;
  const [termsAndConditions, setTermsAndConditions] = useState<TermsAndConditions | null>(null);

  useEffect(() => {
    if (termsAndConditionsId) {
      termsAndConditionsService
        .getByIdOrNull(termsAndConditionsId)
        .then((termsAndConditions) => {
          if (termsAndConditions !== null) {
            setTermsAndConditions(termsAndConditions);
          }
        })
        .catch(() => {
          setTermsAndConditions(null);
        });
    } else {
      setTermsAndConditions(null);
    }
  }, [termsAndConditionsId, termsAndConditionsService]);

  if (!termsAndConditionsId || !termsAndConditions) {
    return null;
  }

  return (
    <LinkButton
      variant="link"
      href={`/admin/legal/terms/versions/${termsAndConditions.id}`}
      onClick={(e) => e.stopPropagation()}
      className="p-0"
    >
      {termsAndConditions.version}
    </LinkButton>
  );
};
