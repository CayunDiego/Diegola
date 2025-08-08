import Image from 'next/image';
import { Plus, GripVertical, Trash2 } from 'lucide-react';
import type { Track } from '@/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface TrackItemProps {
  track: Track;
  onAdd?: (track: Track) => void;
  onRemove?: (id: string) => void;
  isPlaylist?: boolean;
  onDragStart?: (e: React.DragEvent<HTMLDivElement>, id: string) => void;
  onDragOver?: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop?: (e: React.DragEvent<HTMLDivElement>, id: string) => void;
}

export function TrackItem({
  track,
  onAdd,
  onRemove,
  isPlaylist = false,
  ...dragProps
}: TrackItemProps) {
  return (
    <Card
      className={cn(
        'flex items-center gap-4 p-2 transition-all',
        isPlaylist && 'cursor-grab active:cursor-grabbing hover:bg-secondary/50'
      )}
      draggable={isPlaylist}
      {...dragProps}
    >
      {isPlaylist && <GripVertical className="h-5 w-5 text-muted-foreground" />}
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
        <Button variant="ghost" size="icon" onClick={() => onAdd(track)} aria-label="Add to playlist">
          <Plus className="h-5 w-5" />
        </Button>
      )}
      {onRemove && (
        <Button variant="ghost" size="icon" onClick={() => onRemove(track.id)} aria-label="Remove from playlist">
          <Trash2 className="h-5 w-5 text-destructive" />
        </Button>
      )}
    </Card>
  );
}
