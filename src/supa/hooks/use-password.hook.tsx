import { useEffect, useState } from 'react';
import { useAuth } from '../providers';
import { AuthValidationStatus } from '../types';

export interface UsePasswordResponse {
  password: string;
  setPassword: (password: string) => void;
  isValid: boolean;
  message: string;
}

export const usePassword = (initialValue: string = ''): UsePasswordResponse => {
  const { validatePassword } = useAuth();
  const [password, setPassword] = useState<string>(initialValue);
  const [validationStatus, setValidationStatus] = useState<AuthValidationStatus>({
    isValid: true,
    message: ''
  });

  useEffect(() => {
    const result = validatePassword(password as string);
    setValidationStatus(result);
  }, [password, validatePassword]);

  return { password, setPassword, isValid: validationStatus.isValid, message: validationStatus.message };
};
