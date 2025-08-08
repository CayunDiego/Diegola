'use client';

import { Card, CardContent } from '@/components/ui/card';
import type { Track } from '@/types';
import { useEffect, useRef, memo } from 'react';

interface PlayerProps {
  track: Track;
  onEnded?: () => void;
}

// Function to load the YouTube IFrame API script, returns a promise
const loadYouTubeAPI = () => {
    return new Promise<void>((resolve) => {
        if (typeof window !== 'undefined') {
            if ((window as any).YT && (window as any).YT.Player) {
                return resolve();
            }
            const tag = document.createElement('script');
            tag.src = "https://www.youtube.com/iframe_api";
            const firstScriptTag = document.getElementsByTagName('script')[0];
            if (firstScriptTag && firstScriptTag.parentNode) {
                firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
            }
            (window as any).onYouTubeIframeAPIReady = () => {
                resolve();
            };
        }
    });
};


const PlayerComponent = ({ track, onEnded }: PlayerProps) => {
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const playerInstanceRef = useRef<any>(null);

  useEffect(() => {
    const createPlayer = () => {
        if (!playerContainerRef.current) return;
        
        // Ensure any old player is destroyed
        if (playerInstanceRef.current) {
            playerInstanceRef.current.destroy();
        }

        playerInstanceRef.current = new (window as any).YT.Player(playerContainerRef.current, {
            videoId: track.id,
            playerVars: {
                autoplay: 1, // Autoplay
                controls: 1, // Show controls
                origin: typeof window !== 'undefined' ? window.location.origin : '',
            },
            events: {
                'onReady': (event: any) => {
                    // This is the most reliable way to ensure autoplay works.
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
    
    // Load the API and then create the player
    loadYouTubeAPI().then(createPlayer);

    // Cleanup function to destroy the player instance when the component unmounts
    // or the track.id changes, triggering the effect again.
    return () => {
        if (playerInstanceRef.current) {
            try {
               playerInstanceRef.current.destroy();
            } catch (e) {
                console.warn("Error destroying YouTube player", e);
            }
        }
    };
  // This effect MUST re-run if the video ID changes.
  // The onEnded function reference should be stable due to useCallback in parent.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [track.id]);

  return (
    <Card className="w-full overflow-hidden">
      <CardContent className="p-0">
        <div className="aspect-video">
          <div ref={playerContainerRef} className="w-full h-full"></div>
        </div>
      </CardContent>
    </Card>
  );
};

// Memoize the component to prevent re-renders if the track itself hasn't changed.
// We compare by the unique Firestore ID, which is the most stable identifier.
export const Player = memo(PlayerComponent, (prevProps, nextProps) => {
    return prevProps.track.firestoreId === nextProps.track.firestoreId;
});
