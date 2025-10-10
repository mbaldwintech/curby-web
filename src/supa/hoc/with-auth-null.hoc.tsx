import React from 'react';
import { useAuth } from '../providers';

export const withAuthNull = <P extends object>(WrappedComponent: React.ComponentType<P>) => {
  const AuthGate: React.FC<P> = (props) => {
    const { isAuthenticated } = useAuth();

    if (!isAuthenticated) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };

  return AuthGate;
};
