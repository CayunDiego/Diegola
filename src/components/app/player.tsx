'use client';

import { Card, CardContent } from '@/components/ui/card';
import type { Track } from '@/types';
import { useEffect, useRef } from 'react';

interface PlayerProps {
  track: Track;
  onEnded?: (trackId: string) => void;
}

export function Player({ track, onEnded }: PlayerProps) {
  const videoSrc = `https://www.youtube.com/embed/${track.id}?autoplay=1&enablejsapi=1`;
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
        // Ensure the event is from the YouTube iframe
        if (event.source !== iframeRef.current?.contentWindow) {
            return;
        }
        
        const data = JSON.parse(event.data);

        // When the video ends (player state 0), call the onEnded callback
        if (data.event === 'onStateChange' && data.info === 0) {
            onEnded?.(track.id);
        }
    };
    
    window.addEventListener('message', handleMessage);

    return () => {
        window.removeEventListener('message', handleMessage);
    };
  }, [track.id, onEnded]);
  
  return (
    <Card className="w-full overflow-hidden">
      <CardContent className="p-0">
        <div className="aspect-video">
          <iframe
            ref={iframeRef}
            key={track.id} // Add key to force re-render when track changes
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
