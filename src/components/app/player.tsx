'use client';

import { Card, CardContent } from '@/components/ui/card';
import type { Track } from '@/types';
import { useEffect, useRef } from 'react';

interface PlayerProps {
  track: Track;
  onEnded?: () => void; // Changed to not pass trackId, as the parent knows it
}

export function Player({ track, onEnded }: PlayerProps) {
  const videoSrc = `https://www.youtube.com/embed/${track.id}?autoplay=1&enablejsapi=1&origin=${window.location.origin}`;
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    let player: any;
    const onPlayerReady = () => {
       // This function will be called when the player is ready.
       // It sends a message to the iframe to start listening for events.
        iframeRef.current?.contentWindow?.postMessage(JSON.stringify({
            event: 'listening',
            func: 'onStateChange'
        }), '*');
    };

    const handleMessage = (event: MessageEvent) => {
        if (event.origin !== "https://www.youtube.com") {
            return;
        }

        let data;
        try {
            data = JSON.parse(event.data);
        } catch(e) {
            return;
        }
        
        if (data.event === 'onReady') {
            onPlayerReady();
        }

        // When the video ends (player state 0), call the onEnded callback
        if (data.event === 'onStateChange' && data.info === 0) {
            onEnded?.();
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
            id="player"
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
