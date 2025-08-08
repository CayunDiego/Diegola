'use client';

import { Card, CardContent } from '@/components/ui/card';
import type { Track } from '@/types';
import { useEffect, useRef, memo } from 'react';

interface PlayerProps {
  track: Track;
  onEnded?: () => void;
}

// Function to load the YouTube IFrame API script
const loadYouTubeAPI = () => {
    if (typeof window !== 'undefined' && !(window as any).YT) {
        const tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName('script')[0];
        if (firstScriptTag && firstScriptTag.parentNode) {
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        }
    }
};

// A promise that resolves when the YouTube API is ready
const youtubeApiPromise = new Promise<void>((resolve) => {
    if (typeof window !== 'undefined') {
        if ((window as any).YT && (window as any).YT.Player) {
            resolve();
        } else {
            (window as any).onYouTubeIframeAPIReady = () => {
                resolve();
            };
        }
    }
});

const PlayerComponent = ({ track, onEnded }: PlayerProps) => {
  const playerRef = useRef<HTMLDivElement>(null);
  const playerInstanceRef = useRef<any>(null);

  useEffect(() => {
    loadYouTubeAPI();
    
    const createPlayer = () => {
        if (!playerRef.current || !track) return;
        
        // Destroy existing player instance if it exists
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
                    // This is the most reliable way to ensure autoplay.
                    event.target.playVideo();
                },
                'onStateChange': (event: any) => {
                    // When the video ends, call the onEnded callback
                    if (event.data === (window as any).YT.PlayerState.ENDED) {
                        onEnded?.();
                    }
                }
            }
        });
    };
    
    youtubeApiPromise.then(createPlayer);

    // Cleanup function to destroy the player instance
    return () => {
        if (playerInstanceRef.current) {
            try {
               playerInstanceRef.current.destroy();
            } catch (e) {
                console.warn("Error destroying YouTube player", e);
            }
        }
    };
  // We only want this effect to re-run if the video ID changes.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [track.id]);

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

// Memoize the component to prevent re-renders if props (track.id) haven't changed.
export const Player = memo(PlayerComponent, (prevProps, nextProps) => {
    return prevProps.track.id === nextProps.track.id;
});
