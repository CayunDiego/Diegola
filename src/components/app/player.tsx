'use client';

import { Card, CardContent } from '@/components/ui/card';
import type { Track } from '@/types';
import { useEffect, useRef, memo } from 'react';

interface PlayerProps {
  track: Track;
  onEnded?: () => void;
}

let youtubeApiLoaded = false;
const youtubeApiPromise = new Promise<void>((resolve) => {
    if (typeof window !== 'undefined' && (window as any).YT) {
        youtubeApiLoaded = true;
        resolve();
    } else {
        if (typeof window !== 'undefined') {
            (window as any).onYouTubeIframeAPIReady = () => {
                youtubeApiLoaded = true;
                resolve();
            };
        }
    }
});


const PlayerComponent = ({ track, onEnded }: PlayerProps) => {
  const playerRef = useRef<HTMLDivElement>(null);
  const playerInstanceRef = useRef<any>(null);

  useEffect(() => {
    const createPlayer = () => {
        if (!playerRef.current || !track) return;
        
        if (playerInstanceRef.current) {
            playerInstanceRef.current.destroy();
        }

        playerInstanceRef.current = new (window as any).YT.Player(playerRef.current, {
            height: '100%',
            width: '100%',
            videoId: track.id,
            playerVars: {
                autoplay: 1,
                controls: 1,
                origin: typeof window !== 'undefined' ? window.location.origin : '',
            },
            events: {
                'onReady': (event: any) => {
                    event.target.playVideo();
                },
                'onStateChange': (event: any) => {
                    if (event.data === (window as any).YT.PlayerState.ENDED) {
                        onEnded?.();
                    }
                }
            }
        });
    };
    
    if (!youtubeApiLoaded) {
        const tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName('script')[0];
        if (firstScriptTag && firstScriptTag.parentNode) {
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        }
    }

    youtubeApiPromise.then(createPlayer);

    return () => {
        if (playerInstanceRef.current) {
            try {
               playerInstanceRef.current.destroy();
            } catch (e) {
                console.warn("Error destroying YouTube player", e);
            }
        }
    };
  }, [track.id, onEnded]);

  return (
    <Card className="w-full overflow-hidden">
      <CardContent className="p-0">
        <div className="aspect-video">
          <div ref={playerRef} id="yt-player" className="w-full h-full"></div>
        </div>
      </CardContent>
    </Card>
  );
};

// Memoize the component to prevent re-renders if props haven't changed.
// The comparison function ensures we only care about the track ID and onEnded function reference.
export const Player = memo(PlayerComponent, (prevProps, nextProps) => {
    return prevProps.track.id === nextProps.track.id && prevProps.onEnded === nextProps.onEnded;
});