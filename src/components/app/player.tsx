'use client';

import { Card, CardContent } from '@/components/ui/card';
import type { Track } from '@/types';
import { useEffect, useRef } from 'react';

interface PlayerProps {
  track: Track;
  onEnded?: () => void;
}

// Variable global para evitar que se recargue el script de la API
let youtubeApiLoaded = false;
const youtubeApiPromise = new Promise<void>((resolve) => {
    if (typeof window !== 'undefined' && (window as any).YT) {
        youtubeApiLoaded = true;
        resolve();
    } else {
        // Asignamos la función de callback al objeto window
        // para que la API de YouTube la pueda llamar cuando esté lista.
        (window as any).onYouTubeIframeAPIReady = () => {
            youtubeApiLoaded = true;
            resolve();
        };
    }
});


export function Player({ track, onEnded }: PlayerProps) {
  const playerRef = useRef<HTMLDivElement>(null);
  const playerInstanceRef = useRef<any>(null);

  useEffect(() => {
    // Función para crear el reproductor
    const createPlayer = () => {
        if (!playerRef.current || !track) return;
        
        // Destruimos el reproductor anterior si existe
        if (playerInstanceRef.current) {
            playerInstanceRef.current.destroy();
        }

        // Creamos una nueva instancia del reproductor
        playerInstanceRef.current = new (window as any).YT.Player(playerRef.current, {
            height: '100%',
            width: '100%',
            videoId: track.id,
            playerVars: {
                autoplay: 1, // Autoplay
                controls: 1, // Mostrar controles
                origin: window.location.origin
            },
            events: {
                'onReady': (event: any) => {
                    // El video empieza a reproducirse automáticamente
                    event.target.playVideo();
                },
                'onStateChange': (event: any) => {
                    // Si el estado es 0 (terminado), llamamos a onEnded
                    if (event.data === (window as any).YT.PlayerState.ENDED) {
                        onEnded?.();
                    }
                }
            }
        });
    };
    
    // Cargamos la API de YouTube si aún no está cargada
    if (!youtubeApiLoaded) {
        const tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode!.insertBefore(tag, firstScriptTag);
    }

    // Una vez que la API está lista, creamos el reproductor
    youtubeApiPromise.then(createPlayer);

    // Limpieza al desmontar el componente o cambiar de canción
    return () => {
        if (playerInstanceRef.current) {
            // Utilizamos un try-catch porque a veces la destrucción puede fallar si el iframe ya no existe
            try {
               playerInstanceRef.current.destroy();
            } catch (e) {
                console.warn("Error al destruir el reproductor de YouTube", e);
            }
        }
    };
  }, [track.id, onEnded]); // Dependemos del ID de la canción y de la función onEnded

  return (
    <Card className="w-full overflow-hidden">
      <CardContent className="p-0">
        <div className="aspect-video">
          {/* Este div será reemplazado por el iframe de YouTube */}
          <div ref={playerRef} id="yt-player" className="w-full h-full"></div>
        </div>
      </CardContent>
    </Card>
  );
}
