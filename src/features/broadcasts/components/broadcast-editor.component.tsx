import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  EditableField,
  Label,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Separator,
  Switch,
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@core/components';
import { BroadcastMediaType } from '@core/enumerations';
import { BroadcastService, MediaService } from '@core/services';
import { Broadcast } from '@core/types';
import { createClientService } from '@supa/utils/client';
import { Settings as SettingsIcon, Upload, X } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import { IoDesktopOutline, IoPhonePortraitOutline, IoTabletPortraitOutline } from 'react-icons/io5';
import { BroadcastMedia } from './broadcast-media.component';
import { CTAEditor } from './broadcast-cta-editor.component';
import { MediaEditor } from './broadcast-media-editor.component';
import { cn, createLogger } from '@core/utils';

const logger = createLogger('BroadcastEditor');

export interface BroadcastEditorProps {
  broadcast: Broadcast;
  refresh?: () => void;
}

export const BroadcastEditor = ({ broadcast, refresh }: BroadcastEditorProps) => {
  const broadcastService = useRef(createClientService(BroadcastService)).current;
  const mediaService = useRef(createClientService(MediaService)).current;

  const [includeMedia, setIncludeMedia] = useState(broadcast.mediaType !== null);
  const [mediaPopoverOpen, setMediaPopoverOpen] = useState(false);
  const [ctaPopoverOpen, setCtaPopoverOpen] = useState(false);

  const [deviceType, setDeviceType] = useState<'mobile' | 'tablet' | 'desktop'>('mobile');

  const update = useCallback(
    async (updates: Partial<Broadcast>) => {
      try {
        await broadcastService.update(broadcast.id, updates);
        refresh?.();
      } catch (error) {
        logger.error('Failed to update broadcast:', error);
      }
    },
    [broadcast.id, broadcastService, refresh]
  );

  const handleRemoveMedia = useCallback(async () => {
    // Delete the media file from storage (only if there's a mediaId, icons don't have one)
    if (broadcast.mediaId) {
      try {
        await mediaService.remove(broadcast.mediaId);
      } catch (error) {
        logger.error('Failed to delete media file:', error);
      }
    }

    await update({ mediaId: null, mediaType: null, mediaProps: {}, useMediaInNotification: false });
  }, [broadcast.mediaId, mediaService, update]);

  return (
    <Card className="flex flex-1 flex-col gap-0 py-0">
      <CardHeader className="border-b py-6 flex items-center gap-2">
        <div className="p-1.5 rounded-md bg-primary/10">
          <SettingsIcon className="h-4 w-4 text-primary" />
        </div>
        <CardTitle className="text-base">Content Editor</CardTitle>
      </CardHeader>
      <div className="flex-1 flex flex-row">
        <div className="p-4 flex flex-col justify-start gap-4 border-r-1 border-border min-w-[240px] bg-muted/20">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="dismissible" className="font-medium">
                Dismissible
              </Label>
              <Switch
                id="dismissible"
                checked={broadcast.isDismissible}
                onCheckedChange={(val) => {
                  update({ isDismissible: val });
                }}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <Label htmlFor="include-media" className="font-medium">
                Include Media
              </Label>
              <Switch
                id="include-media"
                checked={includeMedia}
                onCheckedChange={async (val) => {
                  setIncludeMedia(val);
                  if (!val) {
                    await handleRemoveMedia();
                  }
                }}
              />
            </div>
            {includeMedia && (
              <>
                <Separator />
                <div className="flex items-center justify-between">
                  <Label htmlFor="media-in-notification" className="font-medium text-sm">
                    Show in Notification
                  </Label>
                  <Switch
                    id="media-in-notification"
                    checked={broadcast.useMediaInNotification || false}
                    onCheckedChange={(val) => update({ useMediaInNotification: val })}
                  />
                </div>
              </>
            )}
          </div>
        </div>

        <div className="relative flex flex-1 items-center justify-center p-6">
          <div className="absolute top-4 right-4 z-10">
            <div className="w-full flex justify-center mb-4">
              <div className="flex bg-muted text-muted-foreground rounded-md overflow-hidden border-1 border-border">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => setDeviceType('mobile')}
                      className={cn(
                        'flex items-center justify-center p-1.5 px-2 transition-colors text-sm font-medium hover:bg-background/50 hover:text-foreground border-r-1 border-border',
                        deviceType === 'mobile' &&
                          'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground'
                      )}
                    >
                      <IoPhonePortraitOutline className="inline h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Mobile View</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => setDeviceType('tablet')}
                      className={cn(
                        'flex items-center justify-center p-1.5 px-2 transition-colors text-sm font-medium hover:bg-background/50 hover:text-foreground border-r-1 border-border',
                        deviceType === 'tablet' &&
                          'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground'
                      )}
                    >
                      <IoTabletPortraitOutline className="inline h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Tablet View</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => setDeviceType('desktop')}
                      className={cn(
                        'flex items-center justify-center p-1.5 px-2 transition-colors text-sm font-medium hover:bg-background/50 hover:text-foreground',
                        deviceType === 'desktop' &&
                          'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground'
                      )}
                    >
                      <IoDesktopOutline className="inline h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Desktop View</TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>
          <div className="relative bg-background rounded-lg overflow-hidden shadow-xl">
            {/* Close Button */}
            {broadcast.isDismissible && (
              <button
                className="absolute top-2 right-2 z-10 w-8 h-8 rounded-full bg-background/60 flex items-center justify-center hover:bg-background/80 transition-colors"
                aria-label="Close"
              >
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            )}

            {/* Content */}
            <div
              className={cn(
                'p-2.75 flex flex-col items-center gap-1.5',
                deviceType === 'mobile' && 'max-w-[350px] max-h-[667px]',
                deviceType === 'tablet' && 'max-w-[768px] max-h-[1024px]',
                deviceType === 'desktop' && 'max-w-[1024px] max-h-[768px]'
              )}
            >
              {/* Media */}
              {includeMedia && (
                <Popover open={mediaPopoverOpen} onOpenChange={setMediaPopoverOpen}>
                  <PopoverTrigger asChild>
                    <button
                      className={cn(
                        'rounded-md border-1 border-transparent hover:border-highlight hover:shadow-sm transition-all cursor-pointer overflow-hidden',
                        !broadcast.mediaId &&
                          broadcast.mediaType !== BroadcastMediaType.Icon &&
                          'border-dotted border-2 p-10 border-border text-muted-foreground'
                      )}
                    >
                      {(broadcast.mediaType === BroadcastMediaType.Icon || broadcast.mediaId) && (
                        <BroadcastMedia broadcast={broadcast} />
                      )}
                      {!broadcast.mediaId && broadcast.mediaType !== BroadcastMediaType.Icon && (
                        <div className="flex flex-col items-center gap-2 p-8 text-muted-foreground">
                          <Upload className="h-8 w-8" />
                          <span className="text-sm">Click to add media</span>
                        </div>
                      )}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent side="bottom" align="center" className="w-[450px] p-0">
                    <MediaEditor
                      broadcast={broadcast}
                      onMediaChange={update}
                      onClose={() => setMediaPopoverOpen(false)}
                    />
                  </PopoverContent>
                </Popover>
              )}

              {/* Title */}
              <div className="w-full">
                <EditableField
                  value={broadcast.title}
                  onChange={(newValue) => update({ title: newValue })}
                  className="text-[22px] font-bold text-center leading-tight"
                />
              </div>

              {/* Body */}
              <div className="w-full">
                <EditableField
                  value={broadcast.body}
                  onChange={(newValue) => update({ body: newValue })}
                  className="text-base leading-6 text-muted-foreground text-center"
                />
              </div>

              {/* Actions */}
              <div className="w-full flex flex-row justify-end gap-2 mt-2">
                {broadcast.isDismissible && (
                  <Button variant="ghost" className="text-primary">
                    Got it
                  </Button>
                )}
                {broadcast.ctaLabel && (
                  <Popover open={ctaPopoverOpen} onOpenChange={setCtaPopoverOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="default"
                        className="border-1 border-transparent hover:border-highlight hover:shadow-sm transition-all cursor-pointer"
                      >
                        {broadcast.ctaLabel}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent side="top" align="end" className="w-[400px] p-0">
                      <CTAEditor broadcast={broadcast} onCTAChange={update} onClose={() => setCtaPopoverOpen(false)} />
                    </PopoverContent>
                  </Popover>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
