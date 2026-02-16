import { AspectRatio } from '@core/constants';
import {
  BatteryMedium,
  ChevronDown,
  CircleUserRound,
  Heart,
  Map,
  MapPin,
  Navigation,
  Plus,
  Signal,
  Wifi
} from 'lucide-react';
import Image from 'next/image';

export const AppPreview = () => {
  return (
    <div
      className="w-full max-w-350 rounded-4xl border border-border overflow-hidden bg-background"
      style={{ aspectRatio: AspectRatio.ratio - 0.07 }}
    >
      <div className="flex flex-1 flex-col items-start justify-start space-y-4 h-full py-4">
        <div className="w-full grid grid-cols-3 mb-2 px-4">
          <div className="flex items-center justify-center gap-2">
            <span className="text-xs">12:26</span>
            <Navigation className="h-3 w-3 text-foreground" />
          </div>
          <div className="flex items-center justify-center">
            <div className="w-full h-6 bg-black rounded-full" />
          </div>
          <div className="flex items-center justify-center gap-2">
            <Signal className="h-4 w-4 text-foreground" />
            <Wifi className="h-4 w-4 text-foreground" />
            <BatteryMedium className="h-4 w-4 text-foreground" />
          </div>
        </div>
        <div className="w-full flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Image src={'/Curby.png'} alt="Curby Logo" width={20} height={20} />
            <span className="font-semibold text-xl">Curby</span>
          </div>
          <div className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-foreground" />
            <Map className="h-5 w-5 text-foreground m-auto" />
            <CircleUserRound className="h-5 w-5 text-foreground m-auto" />
          </div>
        </div>
        <div className="flex-1 w-full flex flex-col items-center justify-center space-y-4">
          <div
            className="relative rounded-xl overflow-hidden shadow-lg w-[90%]"
            style={{ aspectRatio: AspectRatio.ratio }}
          >
            <Image src="/couch-on-curb.jpg" alt="Item Preview" fill className="object-cover" />
            <div className="absolute flex items-center gap-1 top-3 left-3 bg-black/60 text-foreground px-2 h-5.5 rounded-full z-10">
              <MapPin className="h-3 w-3" />
              <span className="text-xs">372 ft</span>
            </div>
            <div className="absolute flex items-center gap-1 top-3 right-3 bg-black/60 text-foreground px-2 h-5.5 rounded-full z-10">
              <Heart className="h-3 w-3" />
              <Navigation className="h-3 w-3" />
              <ChevronDown className="h-3 w-3" />
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 z-10">
              <div className="text-white font-semibold text-lg">Comfortable Couch</div>
            </div>
          </div>
          <div
            className="relative rounded-xl overflow-hidden shadow-lg w-[90%]"
            style={{ aspectRatio: AspectRatio.ratio }}
          >
            <div className="absolute top-0 right-0 bottom-0 left-0 bg-black/60 z-10" />
            <Image src="/bike-on-curb.jpg" alt="Item Preview" fill className="object-cover" />
          </div>
        </div>
      </div>
    </div>
  );
};
