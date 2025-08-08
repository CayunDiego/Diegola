
import Image from 'next/image';
import { Plus, Trash2, PlayCircle, Music } from 'lucide-react';
import type { Track } from '@/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface TrackItemProps {
  track: Track;
  onAdd?: (track: Track) => void;
  onRemove?: (id: string) => void;
  onPlay?: (track: Track) => void;
  isPlaylist?: boolean;
  isPlaying?: boolean;
  isGuestView?: boolean;
}

export function TrackItem({
  track,
  onAdd,
  onRemove,
  onPlay,
  isPlaylist = false,
  isPlaying = false,
  isGuestView = false,
}: TrackItemProps) {
  
  const handleCardClick = () => {
    if (isPlaylist && onPlay && !isGuestView) {
      onPlay(track);
    }
  };

  return (
    <Card
      className={cn(
        'flex items-center gap-4 p-2 transition-all',
        isPlaylist && !isGuestView && 'cursor-pointer hover:bg-secondary/50',
        isPlaying && 'bg-primary/20 border-primary'
      )}
      onClick={handleCardClick}
    >
      {isPlaylist && !isGuestView && (
         <div className="w-5 h-5 flex items-center justify-center">
          {isPlaying ? (
            <Music className="h-5 w-5 text-primary animate-pulse" />
          ) : (
            <PlayCircle className="h-5 w-5 text-muted-foreground group-hover:text-foreground" />
          )}
        </div>
      )}
      <Image
        src={track.thumbnail}
        alt={track.title}
        width={60}
        height={45}
        className="rounded-md object-cover aspect-[4/3]"
        data-ai-hint={track.dataAiHint}
      />
      <div className="flex-1 truncate">
        <p className="font-semibold truncate">{track.title}</p>
        <p className="text-sm text-muted-foreground truncate">{track.artist}</p>
      </div>
      
      {onAdd && (
        <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); onAdd(track); }} aria-label="Add to playlist">
          <Plus className="h-5 w-5" />
        </Button>
      )}

      {onRemove && (
        <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); onRemove(track.id); }} aria-label="Remove from playlist">
          <Trash2 className="h-5 w-5 text-destructive" />
        </Button>
      )}
    </Card>
  );
}
