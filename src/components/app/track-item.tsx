import Image from 'next/image';
import { Plus, Trash2, PlayCircle, Music, MoreVertical } from 'lucide-react';
import type { Track } from '@/types';
import { Button } from '@/components/ui/button';
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
    } else if (onAdd) {
      onAdd(track);
    }
  };

  const handleActionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPlaylist) {
      if (onRemove && track.firestoreId) {
        onRemove(track.firestoreId);
      }
    } else {
      if (onAdd) {
        onAdd(track);
      }
    }
  };


  return (
    <div
      className={cn(
        'flex items-center gap-4 p-2 transition-all w-full rounded-md',
        !isPlaylist && 'cursor-pointer hover:bg-secondary/50',
        isPlaylist && !isGuestView && 'cursor-pointer hover:bg-secondary/50',
        isPlaying && 'bg-primary/20'
      )}
      onClick={handleCardClick}
    >
      <div className="relative">
          <Image
            src={track.thumbnail}
            alt={track.title}
            width={48}
            height={48}
            className="rounded-md object-cover aspect-square"
            data-ai-hint={track.dataAiHint}
          />
      </div>

      <div className="flex-1 truncate">
        <p className="font-normal truncate text-base">{track.title}</p>
        <p className="text-sm text-muted-foreground truncate">{track.artist}</p>
      </div>
      
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={handleActionClick} 
        aria-label={isPlaylist ? "Remove from playlist" : "Add to playlist"}
        className="text-muted-foreground"
      >
        {isPlaylist ? <Trash2 className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
      </Button>
    </div>
  );
}
