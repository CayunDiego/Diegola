'use client';

import { Share2, Music, Play, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from "@/hooks/use-toast";
import { TrackItem } from './track-item';
import type { Track } from '@/types';
import { DragDropContext, Droppable, Draggable, OnDragEndResponder } from '@hello-pangea/dnd';

interface PlaylistPanelProps {
  playlist: Track[];
  onRemoveTrack: (id: string) => void;
  onPlayTrack?: (track: Track) => void;
  currentlyPlayingId?: string;
  isGuestView?: boolean;
  onReorder?: (reorderedPlaylist: Track[]) => void;
}

export function PlaylistPanel({ 
  playlist, 
  onRemoveTrack, 
  onPlayTrack, 
  currentlyPlayingId, 
  isGuestView = false,
  onReorder 
}: PlaylistPanelProps) {
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

  const onDragEnd: OnDragEndResponder = (result) => {
    if (!result.destination || !onReorder) {
      return;
    }

    const items = Array.from(playlist);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    onReorder(items);
  };

  const renderPlaylist = () => (
    playlist.map((track, index) => (
      <Draggable 
        key={track.firestoreId} 
        draggableId={track.firestoreId!} 
        index={index}
        isDragDisabled={isGuestView}
      >
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className="flex items-center"
          >
            {!isGuestView && (
              <GripVertical className="h-5 w-5 text-muted-foreground/50 mr-2" />
            )}
            <div className="flex-1">
              <TrackItem
                track={track}
                onRemove={onRemoveTrack}
                onPlay={onPlayTrack}
                isPlaylist
                isPlaying={track.firestoreId === currentlyPlayingId}
                isGuestView={isGuestView}
              />
            </div>
          </div>
        )}
      </Draggable>
    ))
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Your Playlist</CardTitle>
            <CardDescription>
              {isGuestView ? 'Songs added by guests.' : 'Drag to reorder songs.'}
            </CardDescription>
          </div>
          {!isGuestView && (
            <Button variant="outline" onClick={handleShare}>
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {playlist.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-md border-2 border-dashed border-muted-foreground/30 p-8 text-center">
              <Music className="h-10 w-10 text-muted-foreground/50" />
              <p className="mt-4 text-muted-foreground">Your playlist is empty.</p>
              <p className="text-sm text-muted-foreground/80">Add songs from the search panel.</p>
            </div>
          ) : (
             <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="playlist">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef}>
                    {renderPlaylist()}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
