
'use client';

import Image from 'next/image';
import type { Track } from '@/types';
import { cn } from '@/lib/utils';
import { Volume2 } from 'lucide-react';

interface NowPlayingBarProps {
  track: Track | null;
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
            <div className="relative w-full">
                <p className="font-semibold text-base whitespace-nowrap animate-marquee">
                    {track.title}
                </p>
            </div>
          <p className="text-sm text-muted-foreground truncate">{track.artist}</p>
        </div>
        <Volume2 className="h-5 w-5 text-primary" />
      </div>
       <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee {
          display: inline-block;
          animation: marquee 10s linear infinite;
          padding-left: 100%; 
        }
      `}</style>
    </div>
  );
}
