import { Search, Sparkles, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TrackItem } from './track-item';
import type { Track } from '@/types';

interface SearchPanelProps {
  onSearch: (query: string) => void;
  searchResults: Track[];
  suggestions: Track[];
  onGetSuggestions: () => void;
  onAddTrack: (track: Track) => void;
  isLoading: { search: boolean; suggestions: boolean };
}

export function SearchPanel({
  onSearch,
  searchResults,
  suggestions,
  onGetSuggestions,
  onAddTrack,
  isLoading,
}: SearchPanelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Find Music</CardTitle>
        <div className="flex w-full items-center space-x-2 pt-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search YouTube for tracks..."
              className="pl-8"
              onChange={(e) => onSearch(e.target.value)}
              disabled={isLoading.search}
            />
          </div>
          <Button onClick={onGetSuggestions} disabled={isLoading.suggestions}>
            {isLoading.suggestions ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4" />
            )}
            Suggest
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="results">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="results">Search Results</TabsTrigger>
            <TabsTrigger value="suggestions">AI Suggestions</TabsTrigger>
          </TabsList>
          <TabsContent value="results" className="mt-4">
            <ScrollArea className="h-72">
                <div className="space-y-2 pr-4">
                {isLoading.search && <div className="flex justify-center p-4"><Loader2 className="h-8 w-8 animate-spin text-primary"/></div>}
                {!isLoading.search && searchResults.length === 0 && <p className="pt-8 text-center text-muted-foreground">No results. Type to search.</p>}
                {!isLoading.search && searchResults.map((track) => (
                    <TrackItem key={track.id} track={track} onAdd={onAddTrack} />
                ))}
                </div>
            </ScrollArea>
          </TabsContent>
          <TabsContent value="suggestions" className="mt-4">
            <ScrollArea className="h-72">
                <div className="space-y-2 pr-4">
                {isLoading.suggestions && <div className="flex justify-center p-4"><Loader2 className="h-8 w-8 animate-spin text-primary"/></div>}
                {!isLoading.suggestions && suggestions.length === 0 && <p className="pt-8 text-center text-muted-foreground">Click 'Suggest' for recommendations!</p>}
                {!isLoading.suggestions && suggestions.map((track) => (
                    <TrackItem key={track.id} track={track} onAdd={onAddTrack} />
                ))}
                </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
