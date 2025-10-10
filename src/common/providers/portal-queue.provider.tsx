'use client';

import { createContext, useContext, useEffect, useRef, useState } from 'react';

export interface PortalComponentProps<T> {
  open: boolean;
  close: () => void;
  payload?: T;
}

export interface PortalQueueItem<T> {
  key: string;
  payload?: T;
}

export interface PortalQueueContextProps {
  open: <T>(key: string, payload: T) => void;
  getNext: <T>(key: string) => PortalQueueItem<T> | null;
  hasNewKeys: Record<string, boolean>;
  registerComponent: <T>(
    key: string,
    Component: React.ComponentType<PortalComponentProps<T>>
  ) => {
    open: (payload?: T) => void;
  };
  registeredComponents: Record<string, React.ComponentType<PortalComponentProps<unknown>>>;
}

export const PortalQueueContext = createContext<PortalQueueContextProps>({
  open: () => {},
  getNext: () => null,
  hasNewKeys: {},
  registerComponent: () => ({ open: () => {} }),
  registeredComponents: {}
});

export const usePortalQueue = () => useContext(PortalQueueContext);

export const Portal = () => {
  const { hasNewKeys, getNext, registeredComponents } = usePortalQueue();
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [props, setProps] = useState<unknown>(null);

  const close = () => {
    setOpenKey(null);
    setProps(null);
  };

  useEffect(() => {
    const key = Object.keys(hasNewKeys).find((k) => hasNewKeys[k]);
    if (key && hasNewKeys[key] && !openKey) {
      const next = getNext(key);
      if (next) {
        setOpenKey(key);
        setProps(next.payload);
      }
    }
  }, [hasNewKeys, openKey, getNext]);

  if (!openKey) return null;
  const Component = registeredComponents[openKey];
  return <Component open={true} close={close} payload={props as Record<string, unknown>} />;
};

export const PortalQueueProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const queues = useRef<Record<string, PortalQueueItem<unknown>[]>>({});
  const [hasNewKeys, setHasNewKeys] = useState<Record<string, boolean>>({});
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const registeredComponents = useRef<Record<string, React.ComponentType<PortalComponentProps<any>>>>({});

  const open = <T,>(key: string, payload?: T) => {
    if (!queues.current[key]) queues.current[key] = [];
    queues.current[key].push({ key, payload });
    setHasNewKeys((prev) => ({ ...prev, [key]: true }));
  };

  const getNext = <T,>(key: string): PortalQueueItem<T> | null => {
    const queue = queues.current[key] || [];
    if (queue.length > 0) {
      const [next, ...rest] = queue;
      queues.current[key] = rest;
      setHasNewKeys((prev) => ({ ...prev, [key]: rest.length > 0 }));
      return next as PortalQueueItem<T>;
    }
    return null;
  };

  const registerComponent = <T,>(
    key: string,
    Component: React.ComponentType<PortalComponentProps<T>>
  ): { open: (payload?: T) => void } => {
    registeredComponents.current[key] = Component;
    return {
      open: (payload?: T) => open<T>(key, payload)
    };
  };

  return (
    <PortalQueueContext.Provider
      value={{ open, getNext, hasNewKeys, registerComponent, registeredComponents: registeredComponents.current }}
    >
      {children}
      <Portal />
    </PortalQueueContext.Provider>
  );
};
