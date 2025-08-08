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
    if (isPlaylist && !isGuestView) { // <-- Check for isGuestView here
      if (onRemove && track.firestoreId) {
        onRemove(track.firestoreId);
      }
    } else if (onAdd) {
      if (onAdd) {
        onAdd(track);
      }
    }
  };

  const showActionButton = (isPlaylist && !isGuestView) || onAdd;


  return (
    <div
      className={cn(
        'flex items-center gap-4 p-2 transition-all w-full rounded-md group',
        (onAdd || (isPlaylist && !isGuestView)) && 'cursor-pointer hover:bg-white/5',
        isPlaying && 'bg-white/10'
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

      <div className="flex-1 overflow-hidden">
        <p className="font-normal text-base whitespace-normal">{track.title}</p>
        <p className="text-sm text-muted-foreground truncate">{track.artist}</p>
      </div>
      
      {showActionButton && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleActionClick} 
            aria-label={isPlaylist ? "Remove from playlist" : "Add to playlist"}
            className="text-muted-foreground hover:text-foreground group-hover:opacity-100 md:opacity-0 transition-opacity"
          >
            {isPlaylist ? <Trash2 className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
          </Button>
      )}
    </div>
  );
}
