import { useEffect, useState } from 'react';
import { useAuth } from '../providers';
import { AuthValidationStatus } from '../types';

export interface UseUsernameResponse {
  username: string;
  setUsername: (username: string) => void;
  isValid: boolean;
  message: string;
}

export const useUsername = (initialValue: string = ''): UseUsernameResponse => {
  const { validateUsername } = useAuth();
  const [username, setUsername] = useState<string>(initialValue);
  const [validationStatus, setValidationStatus] = useState<AuthValidationStatus>({
    isValid: true,
    message: ''
  });

  useEffect(() => {
    validateUsername(username).then(setValidationStatus);
  }, [username, validateUsername]);

  return { username, setUsername, isValid: validationStatus.isValid, message: validationStatus.message };
};
