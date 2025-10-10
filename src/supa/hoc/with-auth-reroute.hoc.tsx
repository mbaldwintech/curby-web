import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';
import { useAuth } from '../providers';

export const withAuthReroute = <P extends object>(WrappedComponent: React.ComponentType<P>, redirectTo: string) => {
  const AuthWrapper: React.FC<P> = (props) => {
    const router = useRouter();
    const { isAuthenticated } = useAuth();

    useEffect(() => {
      if (!isAuthenticated) {
        router.replace(redirectTo);
      }
    }, [isAuthenticated, router]);

    if (!isAuthenticated) {
      return null; // Optionally, render a loading indicator here
    }

    return <WrappedComponent {...props} />;
  };

  return AuthWrapper;
};
