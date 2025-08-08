
'use client';

import { useState } from 'react';
import type { Track } from '@/types';
import { Header } from '@/components/app/header';
import { SearchPanel } from '@/components/app/search-panel';
import { PlaylistPanel } from '@/components/app/playlist-panel';
import { searchYoutube } from '@/ai/flows/search-youtube';
import { useToast } from "@/hooks/use-toast";
import { usePlaylist } from '@/hooks/use-playlist';
import { Loader2, ListMusic, Music } from 'lucide-react';
import { usePlayerStatus } from '@/hooks/use-player-status';
import { TrackItem } from '@/components/app/track-item';
import { Button } from '@/components/ui/button';


export default function DjPage() {
  const { playlist, addTrack, removeTrack, updatePlaylistOrder } = usePlaylist();
  const { currentlyPlayingId, setCurrentlyPlayingId } = usePlayerStatus();
  const [searchResults, setSearchResults] = useState<Track[]>([]);
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [currentQuery, setCurrentQuery] = useState('');
  const [nextPageToken, setNextPageToken] = useState<string | undefined>(undefined);
  const { toast } = useToast();

  const handleSearch = async (query: string) => {
    if (!query) {
      handleClearSearch();
      return;
    }
    setIsSearching(true);
    console.log("Iniciando búsqueda en el cliente para:", query);
    setIsLoadingSearch(true);
    setCurrentQuery(query);
    setSearchResults([]); 
    setNextPageToken(undefined);
    try {
      const response = await searchYoutube({ query });
      console.log("Respuesta recibida en el cliente:", response);
      if (response.results.length === 0) {
        toast({
          title: "No se encontraron resultados",
          description: "Intenta con otra búsqueda.",
        });
      }
      const tracks: Track[] = response.results.map(track => ({
        ...track,
        dataAiHint: 'music album cover'
      }));
      setSearchResults(tracks);
      setNextPageToken(response.nextPageToken);
      console.log("Resultados de búsqueda actualizados en el estado:", tracks);
    } catch (error: any) {
      console.error("Fallo al buscar en YouTube desde el cliente:", error);
      toast({
        title: "Error de Búsqueda",
        description: `${error.message}`,
        variant: "destructive",
      });
      setSearchResults([]); 
    } finally {
      setIsLoadingSearch(false);
    }
  };

  const handleLoadMore = async () => {
    if (!nextPageToken || !currentQuery || isLoadingMore) return;
    
    setIsLoadingMore(true);
    try {
        const response = await searchYoutube({ query: currentQuery, pageToken: nextPageToken });
        const newTracks: Track[] = response.results.map(track => ({
            ...track,
            dataAiHint: 'music album cover'
        }));
        
        setSearchResults(prev => {
            const existingIds = new Set(prev.map(t => t.id));
            const uniqueNewTracks = newTracks.filter(t => !existingIds.has(t.id));
            return [...prev, ...uniqueNewTracks];
        });

        setNextPageToken(response.nextPageToken);
    } catch (error: any) {
        console.error("Fallo al cargar más resultados:", error);
        toast({
            title: "Error al Cargar Más",
            description: `${error.message}`,
            variant: "destructive",
        });
    } finally {
        setIsLoadingMore(false);
    }
  };


  const handleAddTrack = (track: Track) => {
    addTrack(track);
  };

  const handleClearSearch = () => {
    setSearchResults([]);
    setIsSearching(false);
    setCurrentQuery('');
    setNextPageToken(undefined);
  };

  const playTrack = (track: Track) => {
    if (track.firestoreId) {
        setCurrentlyPlayingId(track.firestoreId);
    }
  };

  const handleRemoveTrack = (trackId: string) => {
    removeTrack(trackId);
  };
  
  const handleReorder = (newPlaylist: Track[]) => {
      updatePlaylistOrder(newPlaylist);
  };
  
  const searchPanel = (
    <SearchPanel
      onSearch={handleSearch}
      onClear={handleClearSearch}
      isLoading={isLoadingSearch}
      initialQuery={currentQuery}
    />
  );


  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <Header searchPanel={searchPanel} iconClassName="text-destructive">
        
      </Header>

      <main className="flex-1 overflow-y-auto hide-scrollbar">
        <div className="container mx-auto p-2 sm:p-4 w-full">
            <div className="flex flex-col gap-4 mt-2">
                {isSearching ? (
                  <>
                    {isLoadingSearch && (
                      <div className="flex flex-col items-center justify-center pt-16">
                          <Loader2 className="h-8 w-8 animate-spin text-primary" />
                          <p className="mt-4 text-muted-foreground">Buscando...</p>
                        </div>
                    )}
                    {!isLoadingSearch && searchResults.length === 0 && (
                      <p className="pt-8 text-center text-muted-foreground">
                        No se encontraron resultados.
                      </p>
                    )}
                    {searchResults.length > 0 && (
                        <div className="space-y-2">
                            {searchResults.map((track) => (
                                <TrackItem key={track.id} track={track} onAdd={handleAddTrack} />
                            ))}
                        </div>
                    )}
                    
                    {nextPageToken && (
                        <div className="flex justify-center mt-4">
                            <Button
                                onClick={handleLoadMore}
                                disabled={isLoadingMore}
                                variant="outline"
                            >
                                {isLoadingMore ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : null}
                                Ver más...
                            </Button>
                        </div>
                    )}
                  </>
                ) : (
                   <PlaylistPanel
                      playlist={playlist}
                      onRemoveTrack={handleRemoveTrack}
                      currentlyPlayingId={currentlyPlayingId}
                      onReorder={handleReorder}
                      onPlayTrack={playTrack}
                    />
                )}
            </div>
        </div>
      </main>

       {isSearching && (
        <div className="px-2 pb-2 pt-1 border-t border-border bg-background">
          <Button 
            variant="outline" 
            className="w-full"
            onClick={handleClearSearch}
          >
            <ListMusic className="mr-2" />
            Volver a la Playlist
          </Button>
        </div>
      )}

      <footer className="text-center p-1 text-sm text-muted-foreground border-t border-border">
        Hecho por Diego para su cumpleaños © 2025
      </footer>
    </div>
  );
}
