'use client';

import { BroadcastMediaType } from '@core/enumerations';
import { useAsyncMemo } from '@core/hooks';
import { MediaService } from '@core/services';
import { Broadcast } from '@core/types';
import { createClientService } from '@supa/utils/client';
import Lottie from 'lottie-react';
import Image from 'next/image';
import { useRef } from 'react';
import * as Ionicons from 'react-icons/io5';
import * as MaterialCommunityIcons from 'react-icons/md';
import * as MaterialIcons from 'react-icons/md';
import { createLogger } from '@core/utils';

const logger = createLogger('BroadcastMedia');

export interface IconMediaProps {
  lib: 'MaterialIcons' | 'MaterialCommunityIcons' | 'Ionicons';
  name: string;
  size?: number;
  style?: Record<string, unknown>;
  color?: string;
}

export interface BroadcastMediaProps {
  broadcast: Broadcast;
}

export const BroadcastMedia = ({ broadcast }: BroadcastMediaProps) => {
  const mediaService = useRef(createClientService(MediaService)).current;

  const media = useAsyncMemo(async () => {
    if (broadcast.mediaType === BroadcastMediaType.Icon || !broadcast.mediaId) {
      return null;
    }

    try {
      return mediaService.getById(broadcast.mediaId);
    } catch (error) {
      logger.error('Error loading media:', error);
      return null;
    }
  }, [broadcast?.mediaId, broadcast?.mediaType]);

  const lottieJson = useAsyncMemo(async () => {
    // Icons don't need media loading
    if (broadcast.mediaType !== BroadcastMediaType.Lottie || !media) {
      return null;
    }

    try {
      return fetch(media.url).then((res) => res.json());
    } catch (error) {
      logger.error('Error loading Lottie JSON:', error);
      return null;
    }
  }, [broadcast?.mediaType, media]);

  if (!broadcast.mediaType || (broadcast.mediaType !== BroadcastMediaType.Icon && !media)) return null;

  switch (broadcast.mediaType) {
    case BroadcastMediaType.Image: {
      if (!media) return null;
      const imageProps = broadcast.mediaProps as Record<string, unknown> | undefined;
      const containerStyle = (imageProps?.containerStyle ?? {}) as Record<string, unknown>;
      const imageStyle = (imageProps?.style ?? {}) as Record<string, unknown>;
      if ((!imageProps?.width && !imageStyle.width) || (!imageProps?.height && !imageStyle.height)) {
        return <span className="text-destructive">Please set width and height for the image media.</span>;
      }
      logger.info('Rendering image with props:', { imageProps, imageStyle, containerStyle });
      return (
        <div className="w-full flex justify-center items-center">
          <div style={containerStyle}>
            <Image
              src={media.url}
              alt={broadcast.title}
              width={(imageProps?.width || imageStyle.width) as number}
              height={(imageProps?.height || imageStyle.height) as number}
              style={{
                width: (imageProps?.width || imageStyle.width) as number,
                height: (imageProps?.height || imageStyle.height) as number,
                objectFit:
                  ((imageProps?.contentFit || imageStyle.contentFit) as React.CSSProperties['objectFit']) || 'contain',
                ...imageStyle
              }}
            />
          </div>
        </div>
      );
    }

    case BroadcastMediaType.Icon: {
      const iconProps = broadcast.mediaProps as IconMediaProps | undefined;
      const containerStyle = (iconProps?.style ?? {}) as Record<string, unknown>;
      if (!iconProps?.lib || !iconProps?.name) {
        return (
          <div className="w-full flex justify-center items-center bg-background">
            <span className="text-destructive">Please set icon library and name.</span>
          </div>
        );
      }

      if (!iconProps?.size && !(iconProps.style && iconProps.style.width && iconProps.style.height)) {
        return (
          <div className="w-full flex justify-center items-center bg-background">
            <span className="text-destructive">Please set icon size or style dimensions.</span>
          </div>
        );
      }

      // Map library names to the imported icon libraries
      const iconLibraries = {
        MaterialIcons,
        MaterialCommunityIcons,
        Ionicons
      };

      const iconLibraryNameTransformer = {
        MaterialIcons: (name: string) =>
          `Md${name
            .split('-')
            .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
            .join('')}`,
        MaterialCommunityIcons: (name: string) =>
          `Md${name
            .split('-')
            .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
            .join('')}`,
        Ionicons: (name: string) =>
          `Io${name
            .split('-')
            .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
            .join('')}`
      };

      const iconLib = iconLibraries[iconProps.lib];

      const IconComponent = iconLib[
        iconLibraryNameTransformer[iconProps.lib](iconProps.name) as keyof typeof iconLib
      ] as React.ComponentType<{ size?: number; style?: React.CSSProperties }> | undefined;

      if (!IconComponent) {
        return (
          <div className="w-full flex justify-center items-center bg-background">
            <span className="text-destructive">
              Icon &quot;{iconProps.name}&quot; not found in library &quot;{iconProps.lib}&quot;.
            </span>
          </div>
        );
      }

      return (
        <div className="w-full flex justify-center items-center bg-background">
          <div style={containerStyle}>
            <IconComponent
              size={iconProps.size || 64}
              style={{
                ...((iconProps.style as React.CSSProperties) || {}),
                color: (iconProps.color as string) || (iconProps.style?.color as string) || 'var(--primary)'
              }}
            />
          </div>
        </div>
      );
    }

    case BroadcastMediaType.Lottie: {
      if (!lottieJson) {
        return null;
      }
      const lottieProps = (broadcast.mediaProps as Record<string, unknown> | undefined) || {};
      const containerStyle = (lottieProps?.containerStyle ?? {}) as Record<string, unknown>;
      const lottieStyle = (lottieProps?.style ?? {}) as Record<string, unknown>;
      return (
        <div className="w-full flex justify-center items-center bg-background">
          <div style={containerStyle}>
            <Lottie
              animationData={lottieJson}
              loop={true}
              style={{
                ...lottieStyle,
                width: (lottieProps.width as number) || (lottieStyle.width as number) || 150,
                height: (lottieProps.height as number) || (lottieStyle.height as number) || 150
              }}
            />
          </div>
        </div>
      );
    }

    default:
      return null;
  }
};
