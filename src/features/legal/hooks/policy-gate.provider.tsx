'use client';

import { PrivacyPolicyService, TermsAndConditionsService } from '@core/services';
import { PrivacyPolicy, TermsAndConditions } from '@core/types';
import { useAuth } from '@supa/providers';
import { createClientService } from '@supa/utils/client';
import { usePathname, useRouter } from 'next/navigation';
import { createContext, ReactNode, useCallback, useContext, useEffect, useRef, useState } from 'react';

export interface PolicyContextProps {
  termsAndConditions: TermsAndConditions | null;
  needsTerms: boolean;
  privacyPolicy: PrivacyPolicy | null;
  needsPolicy: boolean;
  checkPolicies: () => Promise<void>;
}

export const PolicyContext = createContext<PolicyContextProps>({
  termsAndConditions: null,
  needsTerms: false,
  privacyPolicy: null,
  needsPolicy: false,
  checkPolicies: async () => {}
});

export const usePolicies = () => useContext(PolicyContext);

export interface PolicyGateProviderProps {
  children: ReactNode;
}

export const PolicyGateProvider: React.FC<PolicyGateProviderProps> = ({ children }) => {
  const termsAndConditionsService = useRef(createClientService(TermsAndConditionsService)).current;
  const privacyPolicyService = useRef(createClientService(PrivacyPolicyService)).current;
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [termsAndConditions, setTermsAndConditions] = useState<TermsAndConditions | null>(null);
  const [needsTerms, setNeedsTerms] = useState<boolean>(false);
  const [privacyPolicy, setPrivacyPolicy] = useState<PrivacyPolicy | null>(null);
  const [needsPolicy, setNeedsPolicy] = useState<boolean>(false);

  const checkPolicies = useCallback(async () => {
    if (!isAuthenticated) return;

    const termsRes = await termsAndConditionsService.hasUserAcceptedCurrent();
    setTermsAndConditions(termsRes.termsAndConditions);
    setNeedsTerms(!termsRes.hasAccepted);

    const policyRes = await privacyPolicyService.hasUserAcceptedCurrent();
    setPrivacyPolicy(policyRes.privacyPolicy);
    setNeedsPolicy(!policyRes.hasAccepted);

    // Redirect if user hasn't accepted policies
    if ((!termsRes.hasAccepted || !policyRes.hasAccepted) && pathname !== '/legal/accept-policies') {
      const params = new URLSearchParams({
        redirect: pathname
      });
      router.replace(`/legal/accept-policies?${params.toString() ? `?${params.toString()}` : ''}`);
    }
  }, [isAuthenticated, router, pathname, termsAndConditionsService, privacyPolicyService]);

  useEffect(() => {
    checkPolicies();
  }, [checkPolicies]);

  return (
    <PolicyContext.Provider
      value={{
        termsAndConditions,
        needsTerms,
        privacyPolicy,
        needsPolicy,
        checkPolicies
      }}
    >
      {children}
    </PolicyContext.Provider>
  );
};
