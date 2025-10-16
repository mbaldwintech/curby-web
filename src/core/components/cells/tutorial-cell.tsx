'use client';

import { LinkButton } from '@common/components';
import { createClientService } from '@supa/utils/client';
import { useEffect, useRef, useState } from 'react';
import { TutorialService } from '../../services';
import { Tutorial } from '../../types';

export const TutorialCell = ({ tutorialId }: { tutorialId?: string | null }) => {
  const tutorialService = useRef(createClientService(TutorialService)).current;
  const [tutorial, setTutorial] = useState<Tutorial | null>(null);

  useEffect(() => {
    if (tutorialId) {
      tutorialService
        .getByIdOrNull(tutorialId)
        .then((tutorial) => {
          if (tutorial !== null) {
            setTutorial(tutorial);
          }
        })
        .catch(() => {
          setTutorial(null);
        });
    } else {
      setTutorial(null);
    }
  }, [tutorialId, tutorialService]);

  if (!tutorialId || !tutorial) {
    return null;
  }

  return (
    <LinkButton
      variant="link"
      href={`/admin/tutorial/${tutorial.id}`}
      onClick={(e) => e.stopPropagation()}
      className="p-0"
    >
      {tutorial.title}
    </LinkButton>
  );
};
