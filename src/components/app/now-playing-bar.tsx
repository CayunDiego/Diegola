
'use client';

import Image from 'next/image';
import type { Track } from '@/types';
import { cn, decodeHtmlEntities } from '@/lib/utils';
import { Volume2 } from 'lucide-react';

interface NowPlayingBarProps {
  track: Track | null;
}

// A new component for the animated equalizer icon
function EqualizerIcon() {
  return (
    <div className="flex items-end w-5 h-5 gap-0.5">
      <span
        className="w-1 h-full bg-primary animate-eq-bar"
        style={{ animationDelay: '0ms' }}
      />
      <span
        className="w-1 h-full bg-primary animate-eq-bar"
        style={{ animationDelay: '200ms' }}
      />
      <span
        className="w-1 h-full bg-primary animate-eq-bar"
        style={{ animationDelay: '400ms' }}
      />
    </div>
  );
}


export function NowPlayingBar({ track }: NowPlayingBarProps) {
  if (!track) {
    return null;
  }

  return (
    <div className="fixed bottom-[25px] left-0 right-0 z-20 w-full overflow-hidden bg-black/50 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center gap-4 px-4">
        <Image
          src={track.thumbnail}
          alt={track.title}
          width={48}
          height={48}
          className="rounded-md object-cover aspect-square"
          unoptimized
        />
        <div className="flex-1 overflow-hidden">
            <div className="w-full group">
                <div className="flex animate-marquee group-hover:pause">
                    <p className="font-semibold text-base whitespace-nowrap pr-8">
                       {decodeHtmlEntities(track.title)}
                    </p>
                     <p className="font-semibold text-base whitespace-nowrap pr-8" aria-hidden="true">
                       {decodeHtmlEntities(track.title)}
                    </p>
                </div>
            </div>
          <p className="text-sm text-muted-foreground truncate">{decodeHtmlEntities(track.artist)}</p>
        </div>
        <EqualizerIcon />
      </div>
    </div>
  );
}
