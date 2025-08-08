
import { useState } from 'react';
import { Search, Loader2, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TrackItem } from './track-item';
import type { Track } from '@/types';
import { Button } from '@/components/ui/button';

interface SearchPanelProps {
  onSearch: (query: string) => void;
  onClear: () => void;
  searchResults: Track[];
  onAddTrack: (track: Track) => void;
  isLoading: boolean;
  hasSearched: boolean;
}

export function SearchPanel({
  onSearch,
  onClear,
  searchResults,
  onAddTrack,
  isLoading,
  hasSearched,
}: SearchPanelProps) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query);
    }
  };
  
  const clearSearch = () => {
    setQuery('');
    onClear();
  }

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={handleSubmit} className="flex gap-2 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar en YouTube..."
            className="pl-10 pr-10 h-12 text-base bg-input rounded-full focus-visible:ring-offset-0 focus-visible:ring-1 focus-visible:ring-ring"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={isLoading}
          />
          {query && !isLoading && (
            <Button 
                variant="ghost" 
                size="icon" 
                className="absolute right-1 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full"
                onClick={clearSearch}
                type="button"
            >
                <X className="h-5 w-5 text-muted-foreground"/>
            </Button>
          )}
           {isLoading && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 animate-spin text-muted-foreground" />
            )}
        </div>
        <Button type="submit" disabled={isLoading || !query.trim()} className="rounded-full h-12 w-24">
            {isLoading ? <Loader2 className="animate-spin" /> : 'Buscar'}
        </Button>
      </form>
      
      <div className="space-y-2">
        {isLoading && searchResults.length === 0 && (
           <div className="flex flex-col items-center justify-center pt-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="mt-4 text-muted-foreground">Buscando...</p>
            </div>
        )}
        {!isLoading && searchResults.length === 0 && hasSearched && (
          <p className="pt-8 text-center text-muted-foreground">
            No se encontraron resultados para "{query}".
          </p>
        )}
        {searchResults.map((track) => (
          <TrackItem key={track.id} track={track} onAdd={onAddTrack} />
        ))}
      </div>
    </div>
  );
}
