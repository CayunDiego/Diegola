
'use client';

import { Music, GripVertical, ListMusic } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { TrackItem } from './track-item';
import type { Track } from '@/types';
import { DragDropContext, Droppable, Draggable, OnDragEndResponder } from '@hello-pangea/dnd';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';


interface PlaylistPanelProps {
  playlist: Track[];
  onRemoveTrack: (id: string) => void;
  onPlayTrack?: (track: Track) => void;
  currentlyPlayingId?: string | null;
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
        isDragDisabled={isGuestView || track.firestoreId === currentlyPlayingId}
      >
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className={cn(
              "flex items-center",
              snapshot.isDragging && "bg-accent"
            )}
          >
            {!isGuestView && (
              <GripVertical className={cn(
                  "h-5 w-5 text-muted-foreground/50 mr-2",
                  track.firestoreId === currentlyPlayingId && "opacity-20"
                )}
              />
            )}
            <div className="flex-1">
              <TrackItem
                track={track}
                onRemove={isGuestView ? undefined : onRemoveTrack}
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
    <>
      {playlist.length > 0 && (
          <div className="flex flex-col h-full">
            <h2 className="text-xl font-bold px-2 mb-2 shrink-0">Playlist</h2>
            <ScrollArea className="flex-1 hide-scrollbar">
              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="playlist">
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-1 pr-2">
                      {renderPlaylist()}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </ScrollArea>
          </div>
      )}
       {playlist.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/20 p-8 text-center h-full">
          <ListMusic className="h-10 w-10 text-muted-foreground/50" />
          <p className="mt-3 font-semibold text-muted-foreground">La playlist está vacía</p>
          <p className="text-sm text-muted-foreground/80">Busca y añade tus canciones favoritas.</p>
        </div>
      )}
    </>
  );
}
