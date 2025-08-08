'use client';

import { Card, CardContent } from '@/components/ui/card';
import type { Track } from '@/types';

interface PlayerProps {
  track: Track;
}

export function Player({ track }: PlayerProps) {
  const videoSrc = `https://www.youtube.com/embed/${track.id}?autoplay=1`;

  return (
    <Card className="w-full overflow-hidden">
      <CardContent className="p-0">
        <div className="aspect-video">
          <iframe
            src={videoSrc}
            title={track.title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          ></iframe>
        </div>
      </CardContent>
    </Card>
  );
}
