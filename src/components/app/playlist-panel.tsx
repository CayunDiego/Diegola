'use client';

import { Share2, Music, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from "@/hooks/use-toast";
import { TrackItem } from './track-item';
import type { Track } from '@/types';

interface PlaylistPanelProps {
  playlist: Track[];
  onRemoveTrack: (id: string) => void;
  onPlayTrack?: (track: Track) => void;
  currentlyPlayingId?: string;
  isGuestView?: boolean;
}

export function PlaylistPanel({ playlist, onRemoveTrack, onPlayTrack, currentlyPlayingId, isGuestView = false }: PlaylistPanelProps) {
  const { toast } = useToast();
  
  const handleShare = () => {
    if (playlist.length === 0) {
      toast({
        title: "Playlist is empty",
        description: "Add some tracks before sharing.",
        variant: "destructive",
      });
      return;
    }

    const trackData = playlist.map(t => ({ id: t.id, title: t.title, artist: t.artist }));
    const encodedTracks = btoa(JSON.stringify(trackData));
    const shareUrl = `${window.location.origin}/playlist?tracks=${encodedTracks}`;
    
    navigator.clipboard.writeText(shareUrl).then(() => {
      toast({
        title: "Link Copied!",
        description: "Shareable playlist link copied to your clipboard.",
      });
    }, () => {
      toast({
        title: "Failed to copy",
        description: "Could not copy link. Please copy it manually.",
        variant: "destructive",
      });
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Tu Playlist</CardTitle>
            <CardDescription>
              {isGuestView ? 'Las canciones que has añadido.' : 'Haz clic para reproducir una canción.'}
            </CardDescription>
          </div>
          {!isGuestView && (
            <Button variant="outline" onClick={handleShare}>
              <Share2 className="mr-2 h-4 w-4" />
              Compartir
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {playlist.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-md border-2 border-dashed border-muted-foreground/30 p-8 text-center">
              <Music className="h-10 w-10 text-muted-foreground/50" />
              <p className="mt-4 text-muted-foreground">Tu playlist está vacía.</p>
              <p className="text-sm text-muted-foreground/80">Añade canciones desde el buscador.</p>
            </div>
          ) : (
            playlist.map((track) => (
              <TrackItem
                key={track.firestoreId || track.id}
                track={track}
                onRemove={onRemoveTrack}
                onPlay={onPlayTrack}
                isPlaylist
                isPlaying={track.firestoreId === currentlyPlayingId}
                isGuestView={isGuestView}
              />
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
