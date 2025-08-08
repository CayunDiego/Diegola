import Image from 'next/image';
import { Plus, Trash2, PlayCircle, Music, MoreVertical, Volume2 } from 'lucide-react';
import type { Track } from '@/types';
import { Button } from '@/components/ui/button';
import { cn, decodeHtmlEntities } from '@/lib/utils';


// A new component for the animated equalizer icon
function EqualizerIcon() {
  return (
    <div className="flex items-end w-5 h-5 gap-0.5">
      <span
        className="w-1 h-full bg-primary animate-eq-bar"
        style={{ animationDelay: '0ms' }}
      />
      <span
        className="w-1 h-full bg-primary animate-eq-bar"
        style={{ animationDelay: '200ms' }}
      />
      <span
        className="w-1 h-full bg-primary animate-eq-bar"
        style={{ animationDelay: '400ms' }}
      />
    </div>
  );
}

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
    // Only allow playing a track from the playlist on host view
    if (isPlaylist && onPlay && !isGuestView && !isPlaying) {
      onPlay(track);
    }
  };

  const handleActionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPlaylist && onRemove && !isGuestView && track.firestoreId) {
        onRemove(track.firestoreId);
    } else if (onAdd) {
      onAdd(track);
    }
  };
  
  const isClickable = isPlaylist && !isGuestView && !isPlaying;
  const showActionButton = onAdd || (isPlaylist && !isGuestView && !isPlaying);


  return (
    <div
      className={cn(
        'flex items-center gap-4 p-2 transition-all w-full rounded-md group bg-transparent relative overflow-hidden',
        isClickable && 'cursor-pointer hover:bg-white/10',
        isPlaying && 'bg-white/10'
      )}
      onClick={isClickable ? handleCardClick : undefined}
    >
        {isPlaying && (
            <div className="absolute -z-10 inset-0.5 bg-gradient-to-br from-primary/40 via-accent/40 to-destructive/40 blur-lg animate-aurora" />
        )}
      <div className="relative">
          <Image
            src={track.thumbnail}
            alt={track.title}
            width={48}
            height={48}
            className="rounded-md object-cover aspect-square"
            data-ai-hint={track.dataAiHint}
          />
          {isPlaying && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <EqualizerIcon />
            </div>
           )}
      </div>

      <div className="flex-1 overflow-hidden">
        <p className={cn(
            "font-normal text-base whitespace-normal",
            isPlaying ? 'text-primary' : 'text-foreground'
            )}>
            {decodeHtmlEntities(track.title)}
        </p>
        <p className="text-sm text-muted-foreground truncate">
            {decodeHtmlEntities(track.artist)}
            {track.duration && ` • ${track.duration}`}
            {track.viewCount && ` • ${track.viewCount}`}
        </p>
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
