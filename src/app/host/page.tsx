'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Track } from '@/types';
import { Header } from '@/components/app/header';
import { PlaylistPanel } from '@/components/app/playlist-panel';
import { Player } from '@/components/app/player';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MonitorPlay, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';
import { usePlaylist } from '@/hooks/use-playlist';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function HostPage() {
  const { playlist, removeTrack, clearPlaylist, updatePlaylistOrder } = usePlaylist();
  const [currentlyPlaying, setCurrentlyPlaying] = useState<Track | null>(null);

  // Effect to handle playlist changes (e.g. track removed)
  useEffect(() => {
    // If the currently playing track is no longer in the playlist, play the next one.
    if (currentlyPlaying && !playlist.find(track => track.firestoreId === currentlyPlaying.firestoreId)) {
        const currentIndex = playlist.findIndex(t => t.order > (currentlyPlaying.order || 0));
        if (currentIndex !== -1) {
            setCurrentlyPlaying(playlist[currentIndex]);
        } else {
            setCurrentlyPlaying(null);
        }
    }
    
    // If nothing is playing and the playlist has songs, play the first one.
    if (!currentlyPlaying && playlist.length > 0) {
      setCurrentlyPlaying(playlist[0]);
    }
    
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playlist.map(p => p.firestoreId).join(',')]);


  const playTrack = (track: Track) => {
    setCurrentlyPlaying(track);
  };
  
  const playNextTrack = useCallback(() => {
    if (!currentlyPlaying) {
        if (playlist.length > 0) {
            setCurrentlyPlaying(playlist[0]);
        }
        return;
    }
    
    const currentIndex = playlist.findIndex(t => t.firestoreId === currentlyPlaying.firestoreId);
    
    if (currentIndex === -1) { // Current track was removed
        setCurrentlyPlaying(playlist.length > 0 ? playlist[0] : null);
        return;
    }

    const nextIndex = currentIndex + 1;
    if (nextIndex < playlist.length) {
      setCurrentlyPlaying(playlist[nextIndex]);
    } else {
      // End of playlist
      setCurrentlyPlaying(null);
    }
  }, [playlist, currentlyPlaying]);
  
  const handleRemoveTrack = (trackId: string) => {
    removeTrack(trackId);
  };
  
  const handleReorder = (newPlaylist: Track[]) => {
      // We only update firestore, the local state will be updated by the listener
      // This avoids a double-render and potential race conditions
      updatePlaylistOrder(newPlaylist);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
       <Header>
        <div className="flex gap-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                    <Trash2 className="mr-2"/>
                    Clear Playlist
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete all tracks from the playlist for everyone. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={clearPlaylist}>
                    Yes, clear playlist
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Link href="/" passHref>
                <Button variant="outline">
                    <Home className="mr-2"/>
                    Guest View
                </Button>
            </Link>
        </div>
      </Header>
      <main className="flex-1 container mx-auto p-4 flex flex-col lg:flex-row gap-8">
        <div className="flex-1">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MonitorPlay/> Player
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {currentlyPlaying ? (
                        <Player 
                            key={currentlyPlaying.firestoreId}
                            track={currentlyPlaying} 
                            onEnded={playNextTrack} 
                        />
                    ) : (
                        <div className="aspect-video bg-muted flex items-center justify-center rounded-lg">
                            <p className="text-muted-foreground">{ playlist.length > 0 ? 'Finished playing. Select a track to start.' : 'The playlist is empty.'}</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
        <div className="lg:w-1/3">
             <PlaylistPanel
                playlist={playlist}
                onRemoveTrack={handleRemoveTrack}
                onPlayTrack={playTrack}
                currentlyPlayingId={currentlyPlaying?.firestoreId}
                onReorder={handleReorder}
            />
        </div>
      </main>
    </div>
  );
}
