import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  LinkButton,
  Separator,
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@core/components';
import { Broadcast } from '@core/types';
import { cn } from '@core/utils';
import { ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';

export const CTAEditor = ({
  broadcast,
  onCTAChange,
  onClose
}: {
  broadcast: Broadcast;
  onCTAChange: (updates: Partial<Broadcast>) => Promise<void>;
  onClose: () => void;
}) => {
  const [ctaLabel, setCtaLabel] = useState(broadcast.ctaLabel || '');
  const [actionType, setActionType] = useState<'url' | 'path'>(
    broadcast.ctaUrl && broadcast.ctaUrl.length > 0 ? 'url' : 'path'
  );
  const [ctaUrl, setCtaUrl] = useState(broadcast.ctaUrl || '');
  const [ctaPath, setCtaPath] = useState(broadcast.ctaPath || '');

  useEffect(() => {
    setCtaLabel(broadcast.ctaLabel || '');
    setCtaUrl(broadcast.ctaUrl || '');
    setCtaPath(broadcast.ctaPath || '');
  }, [broadcast.ctaLabel, broadcast.ctaUrl, broadcast.ctaPath]);

  const handleSave = async () => {
    await onCTAChange({ ctaLabel, ctaUrl, ctaPath });
    onClose();
  };

  return (
    <Card className="border-0 shadow-none">
      <CardHeader className="pb-4">
        <CardTitle className="text-base">Call To Action</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="cta-label" className="font-medium">
            Button Label
          </Label>
          <Input
            id="cta-label"
            value={ctaLabel}
            onChange={(e) => setCtaLabel(e.target.value)}
            placeholder="e.g., Learn More"
          />
        </div>

        <div className="space-y-2">
          <Label className="font-medium">Action Type</Label>
          <div className="flex flex-row bg-muted text-muted-foreground rounded-md overflow-hidden border-1 border-border w-fit">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => {
                    setActionType('url');
                    setCtaPath('');
                  }}
                  className={cn(
                    'flex items-center justify-center p-1 px-2 transition-colors text-sm font-medium hover:bg-background/50 hover:text-foreground border-r-1 border-border',
                    actionType === 'url' &&
                      'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground'
                  )}
                >
                  Link
                </button>
              </TooltipTrigger>
              <TooltipContent>Use external link</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => {
                    setActionType('path');
                    setCtaUrl('');
                  }}
                  className={cn(
                    'flex items-center justify-center p-1 px-2 transition-colors text-sm font-medium hover:bg-background/50 hover:text-foreground',
                    actionType === 'path' &&
                      'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground'
                  )}
                >
                  In-App Path
                </button>
              </TooltipTrigger>
              <TooltipContent>Use in-app path</TooltipContent>
            </Tooltip>
          </div>
        </div>

        {actionType === 'url' && (
          <div className="space-y-2">
            <Label htmlFor="cta-url" className="font-medium">
              External Link URL
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="cta-url"
                value={ctaUrl}
                onChange={(e) => setCtaUrl(e.target.value)}
                placeholder="https://example.com"
              />
              <LinkButton variant="outline" size="icon-sm" href={ctaUrl} target="_blank" rel="noopener noreferrer">
                <ArrowRight className="h-4 w-4" />
              </LinkButton>
            </div>
          </div>
        )}

        {actionType === 'path' && (
          <div className="space-y-2">
            <Label htmlFor="cta-path" className="font-medium">
              In-App Path
            </Label>
            <Input id="cta-path" value={ctaPath} onChange={(e) => setCtaPath(e.target.value)} placeholder="/app/home" />
          </div>
        )}

        <Separator />
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </div>
      </CardContent>
    </Card>
  );
};
