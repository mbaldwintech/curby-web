'use client';

import { useEffect, useState } from 'react';

interface CurbyMarkerProps {
  position: [number, number];
  isSelected?: boolean;
  onSelect?: () => void;
  onDeselect?: () => void;
  size?: number;
  title?: string;
}

interface CurbyMarkerData {
  icon: unknown;
  position: [number, number];
  eventHandlers?: {
    click?: () => void;
    popupclose?: () => void;
  };
}

// Hook to use the marker in your Leaflet map
export function useCurbyMarker({ position, isSelected = false, onSelect, onDeselect, size = 50 }: CurbyMarkerProps) {
  const [markerData, setMarkerData] = useState<CurbyMarkerData | null>(null);

  useEffect(() => {
    const loadMarker = async () => {
      const leafletModule = await import('leaflet');
      const L = leafletModule.default;

      const scale = isSelected ? 1.4 : 1;

      const createMarkerHtml = () => `
        <div class="curby-marker-container" style="
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          transform: scale(${scale});
          transition: transform 0.2s ease-out;
          cursor: pointer;
        ">
          <div class="curby-marker-wrapper bg-background" style="
            height: ${size}px;
            width: ${size}px;
            border-radius: 25px;
            overflow: hidden;
            padding: 5px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <div class="bg-background" style="
              height: 100%;
              width: 100%;
              background-image: url('/Curby.png');
              background-size: contain;
              background-repeat: no-repeat;
              background-position: center;
              border-radius: 20px;
            "></div>
          </div>
          <div class="curby-marker-pointer" style="
            width: 0;
            height: 0;
            border-left: 8px solid transparent;
            border-right: 8px solid transparent;
            border-top: 12px solid var(--background);
            margin-top: -2px;
          "></div>
        </div>
      `;

      const customIcon = new L.DivIcon({
        html: createMarkerHtml(),
        className: 'curby-custom-marker',
        iconSize: [size, size + 12],
        iconAnchor: [size / 2, size + 12],
        popupAnchor: [0, -(size + 12)]
      });

      setMarkerData({
        icon: customIcon,
        position,
        eventHandlers: {
          click: () => {
            if (onSelect) onSelect();
          },
          popupclose: () => {
            if (onDeselect) onDeselect();
          }
        }
      });
    };

    loadMarker();
  }, [position, isSelected, onSelect, onDeselect, size]);

  return markerData;
}
