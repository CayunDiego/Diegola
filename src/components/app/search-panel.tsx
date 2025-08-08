import { Search, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TrackItem } from './track-item';
import type { Track } from '@/types';

interface SearchPanelProps {
  onSearch: (query: string) => void;
  searchResults: Track[];
  onAddTrack: (track: Track) => void;
  isLoading: boolean;
}

export function SearchPanel({
  onSearch,
  searchResults,
  onAddTrack,
  isLoading,
}: SearchPanelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Find Music</CardTitle>
        <div className="relative flex-1 pt-2">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search YouTube for tracks..."
              className="pl-8"
              onChange={(e) => onSearch(e.target.value)}
              disabled={isLoading}
            />
          </div>
      </CardHeader>
      <CardContent>
          <ScrollArea className="h-72">
              <div className="space-y-2 pr-4">
              {isLoading && <div className="flex justify-center p-4"><Loader2 className="h-8 w-8 animate-spin text-primary"/></div>}
              {!isLoading && searchResults.length === 0 && <p className="pt-8 text-center text-muted-foreground">No results. Type to search.</p>}
              {!isLoading && searchResults.map((track) => (
                  <TrackItem key={track.id} track={track} onAdd={onAddTrack} />
              ))}
              </div>
          </ScrollArea>
      </CardContent>
    </Card>
  );
}
