import { Button, Tooltip, TooltipContent, TooltipTrigger } from '@common/components';
import { cn } from '@common/utils';
import { CopyIcon } from 'lucide-react';

export interface CopyableStringCellProps {
  value?: string | null;
  className?: string;
}

export function CopyableStringCell({ value, className }: CopyableStringCellProps) {
  return (
    <div className={cn('flex items-center', className)}>
      <Tooltip>
        <TooltipTrigger className="truncate overflow-hidden whitespace-nowrap">{value}</TooltipTrigger>
        <TooltipContent>
          <p className="max-w-xs break-all">{value}</p>
        </TooltipContent>
      </Tooltip>

      <Button
        variant="ghost"
        size="sm"
        className="ml-2 shrink-0 opacity-50 hover:opacity-100"
        onClick={(e) => {
          e.stopPropagation();
          if (value) {
            navigator.clipboard.writeText(value);
          }
        }}
      >
        <CopyIcon size="xs" />
      </Button>
    </div>
  );
}
