import { useEffect, useState } from 'react';
import { useAuth } from '../providers';
import { AuthValidationStatus } from '../types';

export interface UseEmailResponse {
  email: string;
  setEmail: (email: string) => void;
  isValid: boolean;
  message: string;
}

export const useEmail = (initialValue: string = ''): UseEmailResponse => {
  const { validateEmail } = useAuth();
  const [email, setEmail] = useState<string>(initialValue);
  const [validationStatus, setValidationStatus] = useState<AuthValidationStatus>({
    isValid: true,
    message: ''
  });

  useEffect(() => {
    const status = validateEmail(email);
    setValidationStatus(status);
  }, [email, validateEmail]);

  return { email, setEmail, isValid: validationStatus.isValid, message: validationStatus.message };
};
