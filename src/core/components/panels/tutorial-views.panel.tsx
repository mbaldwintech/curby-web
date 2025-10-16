'use client';

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@common/components';
import { PanelRef } from '@common/types';
import { createClientService } from '@supa/utils/client';
import { InfoIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { TutorialService } from '../../services';
import { Tutorial } from '../../types';
import { TutorialViewTable } from '../tables';

export type TutorialViewsPanelRef = PanelRef<string>;

export interface TutorialViewsPanelProps {
  onClose?: () => void;
}

export const TutorialViewsPanel = forwardRef<TutorialViewsPanelRef, TutorialViewsPanelProps>(
  function TutorialViewsPanel({ onClose }: TutorialViewsPanelProps, ref) {
    const router = useRouter();
    const tutorialService = useRef(createClientService(TutorialService)).current;
    const [open, setOpen] = useState(false);
    const [tutorialId, setTutorialId] = useState<string | null>(null);
    const [tutorial, setTutorial] = useState<Tutorial | null>(null);

    useEffect(() => {
      if (tutorialId) {
        tutorialService
          .getById(tutorialId)
          .then((data) => {
            setTutorial(data);
          })
          .catch((error) => {
            console.error('Failed to fetch tutorial details:', error);
            setTutorial(null);
          });
      } else {
        setTutorial(null);
      }
    }, [tutorialService, tutorialId]);

    const handleClose = useCallback(() => {
      onClose?.();
      setOpen(false);
      setTutorialId(null);
      setTutorial(null);
    }, [onClose]);

    useImperativeHandle<TutorialViewsPanelRef, TutorialViewsPanelRef>(ref, (): TutorialViewsPanelRef => {
      return {
        isOpen: open,
        open: (tutorialId: string) => {
          setTutorialId(tutorialId);
          setOpen(true);
        },
        close: handleClose
      };
    }, [handleClose, open]);

    return (
      <Sheet open={open} onOpenChange={handleClose}>
        <SheetContent className="min-w-[900px]">
          {tutorial && (
            <>
              <SheetHeader>
                <SheetTitle>Views for &quot;{tutorial.title}&quot;</SheetTitle>
                <SheetDescription>
                  Listing of all views for this tutorial, including user and device information.
                </SheetDescription>
              </SheetHeader>

              <div className="grid flex-1 auto-rows-min gap-6 px-4 overflow-auto">
                <TutorialViewTable
                  defaultFilters={[{ column: 'tutorialId', operator: 'eq', value: tutorialId || '' }]}
                  onRowClick={(view) => {
                    router.push(`/admin/tutorials/views/${view.id}`);
                  }}
                  rowActionSections={[
                    [
                      {
                        label: 'View Details',
                        icon: <InfoIcon size={14} />,
                        onClick: (view) => {
                          router.push(`/admin/tutorials/views/${view.id}`);
                        }
                      }
                    ]
                  ]}
                />
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    );
  }
);
