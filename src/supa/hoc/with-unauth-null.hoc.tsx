import React from 'react';
import { useAuth } from '../providers';

export const withUnauthNull = <P extends object>(WrappedComponent: React.ComponentType<P>) => {
  const UnauthGate: React.FC<P> = (props) => {
    const { isAuthenticated } = useAuth();

    if (isAuthenticated) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };

  return UnauthGate;
};
