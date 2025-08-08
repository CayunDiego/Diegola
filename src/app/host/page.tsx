'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Track } from '@/types';
import { Header } from '@/components/app/header';
import { PlaylistPanel } from '@/components/app/playlist-panel';
import { Player } from '@/components/app/player';
import { Trash2 } from 'lucide-react';
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
import { usePlayerStatus } from '@/hooks/use-player-status';

export default function HostPage() {
  const { playlist, removeTrack, clearPlaylist, updatePlaylistOrder } = usePlaylist();
  const { currentlyPlayingId, setCurrentlyPlayingId, clearCurrentlyPlayingId } = usePlayerStatus();
  const [localCurrentlyPlaying, setLocalCurrentlyPlaying] = useState<Track | null>(null);

  useEffect(() => {
    // Sync local player state when Firestore state changes
    if (currentlyPlayingId) {
        const playingTrack = playlist.find(t => t.firestoreId === currentlyPlayingId);
        if (playingTrack) {
            setLocalCurrentlyPlaying(playingTrack);
        } else if (localCurrentlyPlaying) {
            // The track was likely removed from the playlist, so stop playing.
             setLocalCurrentlyPlaying(null);
             clearCurrentlyPlayingId();
        }
    } else {
        setLocalCurrentlyPlaying(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentlyPlayingId, playlist]);

  useEffect(() => {
    // Autoplay logic:
    // If nothing is playing, but there are songs, play the first one.
    if (!currentlyPlayingId && playlist.length > 0) {
      playTrack(playlist[0]);
    }
    // If the currently playing track is removed, play the next one.
    if (currentlyPlayingId && !playlist.some(t => t.firestoreId === currentlyPlayingId)) {
      playNextTrack();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playlist.map(p => p.firestoreId).join(',')]);


  const playTrack = (track: Track) => {
    if (track.firestoreId) {
        setCurrentlyPlayingId(track.firestoreId);
    }
  };
  
  const playNextTrack = useCallback(() => {
    if (playlist.length === 0) {
        setLocalCurrentlyPlaying(null);
        clearCurrentlyPlayingId();
        return;
    }

    const currentIndex = playlist.findIndex(t => t.firestoreId === currentlyPlayingId);
    
    // If the track was not found or it's the last one, play the first track.
    const nextIndex = (currentIndex === -1 || currentIndex === playlist.length - 1) ? 0 : currentIndex + 1;
    
    const nextTrack = playlist[nextIndex];
     if (nextTrack?.firestoreId) {
        setCurrentlyPlayingId(nextTrack.firestoreId);
    }
    
  }, [playlist, currentlyPlayingId, setCurrentlyPlayingId, clearCurrentlyPlayingId]);
  
  const handleRemoveTrack = (trackId: string) => {
    removeTrack(trackId);
  };
  
  const handleReorder = (newPlaylist: Track[]) => {
      // We only update firestore, the local state will be updated by the listener
      // This avoids a double-render and potential race conditions
      updatePlaylistOrder(newPlaylist);
  };
  
  const handleClearPlaylist = () => {
    clearPlaylist();
    clearCurrentlyPlayingId();
  }

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
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
                  <AlertDialogAction onClick={handleClearPlaylist}>
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
      <main className="flex-1 container mx-auto p-4 flex flex-col lg:flex-row gap-8 overflow-hidden">
        <div className="flex-1 lg:overflow-y-auto">
            {localCurrentlyPlaying ? (
                <Player 
                    key={localCurrentlyPlaying.firestoreId}
                    track={localCurrentlyPlaying} 
                    onEnded={playNextTrack} 
                />
            ) : (
                <div className="aspect-video bg-muted flex items-center justify-center rounded-lg">
                    <p className="text-muted-foreground">{ playlist.length > 0 ? 'Finished playing. Select a track to start.' : 'The playlist is empty.'}</p>
                </div>
            )}
        </div>
        <div className="lg:w-1/3 flex flex-col h-full overflow-hidden">
             <PlaylistPanel
                playlist={playlist}
                onRemoveTrack={handleRemoveTrack}
                onPlayTrack={playTrack}
                currentlyPlayingId={currentlyPlayingId}
                onReorder={handleReorder}
            />
        </div>
      </main>
    </div>
  );
}
