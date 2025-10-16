'use client';

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@common/components';
import React, { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';

export interface ConfirmDialogOptions<T> {
  title: string;
  message?: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
  onConfirm: (data: T) => void;
  onCancel?: () => void;
  variant?: 'default' | 'destructive';
  initialData?: T;
  Body?: React.ComponentType<{
    formState: T;
    setFormState: React.Dispatch<React.SetStateAction<T>>;
  }>;
  hideCloseButton?: boolean;
  closeOnEsc?: boolean; // whether the dialog can be closed with ESC key
  closeOnOutsideClick?: boolean; // whether clicking outside closes the dialog
}

interface ConfirmDialogContextType {
  open: <T>(options: ConfirmDialogOptions<T>) => void;
  close: () => void;
}

const ConfirmDialogContext = createContext<ConfirmDialogContextType | undefined>(undefined);

export const useConfirmDialog = (): ConfirmDialogContextType => {
  const context = useContext(ConfirmDialogContext);
  if (!context) {
    throw new Error('useConfirmDialog must be used within a ConfirmDialogProvider');
  }
  return context;
};

export const ConfirmDialogProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmDialogOptions<unknown> | null>(null);
  const [formState, setFormState] = useState<unknown>({});

  const open = useCallback(<T,>(opts: ConfirmDialogOptions<T>) => {
    setOptions(opts as ConfirmDialogOptions<unknown>);
    setFormState(opts.initialData ?? {});
    setDialogOpen(true);
  }, []);

  const close = useCallback(() => {
    setDialogOpen(false);
    setOptions(null);
    setFormState({});
  }, []);

  const preventEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && options?.closeOnEsc === false) {
        e.preventDefault();
      }
    },
    [options]
  );

  useEffect(() => {
    document.addEventListener('keydown', preventEscape);

    return () => {
      document.removeEventListener('keydown', preventEscape);
    };
  }, [preventEscape]);

  return (
    <ConfirmDialogContext.Provider value={{ open, close }}>
      {children}

      {options && (
        <Dialog
          open={dialogOpen}
          onOpenChange={(open) => {
            if (!open) {
              options.onCancel?.();
              close();
            }
          }}
        >
          <DialogContent
            showCloseButton={!options.hideCloseButton}
            onInteractOutside={(e) => {
              if (options.closeOnOutsideClick === false) {
                e.preventDefault();
              }
            }}
            onEscapeKeyDown={(e) => {
              if (options.closeOnEsc === false) {
                e.preventDefault();
              }
            }}
          >
            <DialogHeader>
              <DialogTitle>{options.title}</DialogTitle>
              {options.message && <DialogDescription>{options.message}</DialogDescription>}
            </DialogHeader>

            {options.Body && (
              <options.Body
                formState={formState}
                setFormState={setFormState as React.Dispatch<React.SetStateAction<unknown>>}
              />
            )}

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  options.onCancel?.();
                  close();
                }}
              >
                {options.cancelButtonText || 'Cancel'}
              </Button>
              <Button
                className={options.variant === 'destructive' ? 'bg-destructive' : 'bg-primary'}
                onClick={() => {
                  options.onConfirm(formState);
                  close();
                }}
              >
                {options.confirmButtonText || 'Confirm'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </ConfirmDialogContext.Provider>
  );
};
