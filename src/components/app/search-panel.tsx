import { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TrackItem } from './track-item';
import type { Track } from '@/types';
import { Button } from '@/components/ui/button';

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
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Buscar Música</CardTitle>
        <form onSubmit={handleSubmit} className="flex gap-2 pt-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar en YouTube..."
              className="pl-8"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <Button type="submit" disabled={isLoading || !query}>
            {isLoading ? <Loader2 className="animate-spin" /> : 'Buscar'}
          </Button>
        </form>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[40vh]">
          <div className="space-y-2 pr-4">
            {isLoading && (
              <div className="flex justify-center p-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}
            {!isLoading && searchResults.length === 0 && (
              <p className="pt-8 text-center text-muted-foreground">
                Escribe algo y presiona buscar.
              </p>
            )}
            {!isLoading &&
              searchResults.map((track) => (
                <TrackItem key={track.id} track={track} onAdd={onAddTrack} />
              ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
