'use client';

import { useState } from 'react';
import { Share2, Music } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from "@/hooks/use-toast";
import { TrackItem } from './track-item';
import type { Track } from '@/types';

interface PlaylistPanelProps {
  playlist: Track[];
  onRemoveTrack: (id: string) => void;
  onReorder: (draggedId: string, targetId: string) => void;
}

export function PlaylistPanel({ playlist, onRemoveTrack, onReorder }: PlaylistPanelProps) {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const { toast } = useToast();

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, id: string) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = 'move';
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetId: string) => {
    e.preventDefault();
    if (draggedId && draggedId !== targetId) {
      onReorder(draggedId, targetId);
    }
    setDraggedId(null);
  };
  
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
            <CardTitle>Your Playlist</CardTitle>
            <CardDescription>Drag and drop to reorder tracks.</CardDescription>
          </div>
          <Button variant="outline" onClick={handleShare}>
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {playlist.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-md border-2 border-dashed border-muted-foreground/30 p-8 text-center">
              <Music className="h-10 w-10 text-muted-foreground/50" />
              <p className="mt-4 text-muted-foreground">Your playlist is empty.</p>
              <p className="text-sm text-muted-foreground/80">Add tracks from the search panel.</p>
            </div>
          ) : (
            playlist.map((track) => (
              <TrackItem
                key={track.id}
                track={track}
                onRemove={onRemoveTrack}
                isPlaylist
                onDragStart={(e) => handleDragStart(e, track.id)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, track.id)}
              />
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
