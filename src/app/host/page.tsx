'use client';

import { useState } from 'react';
import type { Track } from '@/types';
import { Header } from '@/components/app/header';
import { PlaylistPanel } from '@/components/app/playlist-panel';
import { Player } from '@/components/app/player';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MonitorPlay } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';

const initialPlaylist: Track[] = [
  { id: '3JZ_D3ELwOQ', title: 'Stairway to Heaven', artist: 'Led Zeppelin', thumbnail: 'https://i.ytimg.com/vi/3JZ_D3ELwOQ/mqdefault.jpg', dataAiHint: 'rock music' },
  { id: 'fJ9rUzIMcZQ', title: 'Hotel California', artist: 'Eagles', thumbnail: 'https://i.ytimg.com/vi/fJ9rUzIMcZQ/mqdefault.jpg', dataAiHint: 'rock music' },
];

export default function HostPage() {
  const [playlist, setPlaylist] = useState<Track[]>(initialPlaylist);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<Track | null>(playlist[0] || null);

  const removeTrackFromPlaylist = (trackId: string) => {
    setPlaylist(prev => {
      const newPlaylist = prev.filter(t => t.id !== trackId);
      if (currentlyPlaying?.id === trackId) {
        // Play the next track if the current one is removed
        const currentIndex = prev.findIndex(t => t.id === trackId);
        setCurrentlyPlaying(newPlaylist[currentIndex] || newPlaylist[0] || null);
      }
      return newPlaylist;
    });
  };

  const playTrack = (track: Track) => {
    setCurrentlyPlaying(track);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
       <Header>
        <Link href="/" passHref>
            <Button variant="outline">
                <Home className="mr-2"/>
                Guest View
            </Button>
        </Link>
      </Header>
      <main className="flex-1 container mx-auto p-4 flex flex-col lg:flex-row gap-8">
        <div className="flex-1">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MonitorPlay/> Reproductor
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {currentlyPlaying ? (
                        <Player track={currentlyPlaying} />
                    ) : (
                        <div className="aspect-video bg-muted flex items-center justify-center rounded-lg">
                            <p className="text-muted-foreground">Selecciona una canción para reproducir</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
        <div className="lg:w-1/3">
             <PlaylistPanel
                playlist={playlist}
                onRemoveTrack={removeTrackFromPlaylist}
                onPlayTrack={playTrack}
                currentlyPlayingId={currentlyPlaying?.id}
            />
        </div>
      </main>
    </div>
  );
}
