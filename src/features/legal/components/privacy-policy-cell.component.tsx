'use client';

import { LinkButton } from '@core/components';
import { PrivacyPolicyService } from '@core/services';
import { PrivacyPolicy } from '@core/types';
import { createClientService } from '@supa/utils/client';
import { useEffect, useRef, useState } from 'react';

export const PrivacyPolicyCell = ({ privacyPolicyId }: { privacyPolicyId?: string | null }) => {
  const privacyPolicyService = useRef(createClientService(PrivacyPolicyService)).current;
  const [privacyPolicy, setPrivacyPolicy] = useState<PrivacyPolicy | null>(null);

  useEffect(() => {
    if (privacyPolicyId) {
      privacyPolicyService
        .getByIdOrNull(privacyPolicyId)
        .then((privacyPolicy) => {
          if (privacyPolicy !== null) {
            setPrivacyPolicy(privacyPolicy);
          }
        })
        .catch(() => {
          setPrivacyPolicy(null);
        });
    } else {
      setPrivacyPolicy(null);
    }
  }, [privacyPolicyId, privacyPolicyService]);

  if (!privacyPolicyId || !privacyPolicy) {
    return null;
  }

  return (
    <LinkButton
      variant="link"
      href={`/admin/legal/privacy/versions/${privacyPolicy.id}`}
      onClick={(e) => e.stopPropagation()}
      className="p-0"
    >
      {privacyPolicy.version}
    </LinkButton>
  );
};
