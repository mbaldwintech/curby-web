'use client';

import React from 'react';
import { useAuth } from '../providers';

interface WithAuthObfuscateOptions {
  intensity?: number; // blur intensity
  overlayColorClass?: string; // Tailwind bg class instead of raw color
  label?: string;
  hideLabel?: boolean;
  className?: string; // wrapper class
}

export const withAuthObfuscate = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options?: WithAuthObfuscateOptions
) => {
  const {
    intensity = 8,
    overlayColorClass = 'bg-black/35', // default semi-transparent
    label,
    hideLabel = false,
    className
  } = options ?? {};

  const AuthWrapper: React.FC<P> = (props) => {
    const { isAuthenticated } = useAuth();

    return (
      <div className={`relative ${className ?? ''}`}>
        <WrappedComponent {...props} />

        {!isAuthenticated && (
          <>
            {/* Blur overlay */}
            <div
              className="absolute inset-0 pointer-events-auto"
              style={{
                backdropFilter: `blur(${intensity}px)`,
                WebkitBackdropFilter: `blur(${intensity}px)` // Safari support
              }}
            />

            {/* Semi-transparent overlay with label */}
            <div
              className={`absolute inset-0 flex items-center justify-center pointer-events-auto ${overlayColorClass}`}
            >
              {!hideLabel && <span className="text-primaryText text-base">{label ?? 'Login to view'}</span>}
            </div>
          </>
        )}
      </div>
    );
  };

  return AuthWrapper;
};
