
'use client';

import { useState } from 'react';
import type { Track } from '@/types';
import { Header } from '@/components/app/header';
import { SearchPanel } from '@/components/app/search-panel';
import { PlaylistPanel } from '@/components/app/playlist-panel';
import { TrackItem } from '@/components/app/track-item';
import { searchYoutube } from '@/ai/flows/search-youtube';
import { useToast } from "@/hooks/use-toast";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { MonitorPlay } from 'lucide-react';
import { usePlaylist } from '@/hooks/use-playlist';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { usePlayerStatus } from '@/hooks/use-player-status';


export default function GuestPage() {
  const { playlist, addTrack } = usePlaylist();
  const { currentlyPlayingId } = usePlayerStatus();
  const [searchResults, setSearchResults] = useState<Track[]>([]);
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const { toast } = useToast();

  const handleSearch = async (query: string) => {
    setHasSearched(true);
    if (!query) {
      setSearchResults([]);
      setHasSearched(false);
      return;
    }
    console.log("Iniciando búsqueda en el cliente para:", query);
    setIsLoadingSearch(true);
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

  const handleClearSearch = () => {
    setSearchResults([]);
    setHasSearched(false);
  };
  
  const handleAddTrack = (track: Track) => {
    addTrack(track);
  };


  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <Header>
        <Link href="/host" passHref>
          <Button variant="ghost" size="icon">
            <MonitorPlay className="h-6 w-6"/>
          </Button>
        </Link>
      </Header>
      
      {/* Sticky Search Panel */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm">
         <div className="container mx-auto px-2 sm:px-4 w-full">
            <SearchPanel
                onSearch={handleSearch}
                onClear={handleClearSearch}
                isLoading={isLoadingSearch}
              />
         </div>
      </div>

      {/* Scrollable Main Content */}
      <main className="flex-1 overflow-y-auto hide-scrollbar">
        <div className="container mx-auto p-2 sm:p-4 w-full">
            <div className="flex flex-col gap-4 mt-2">
                {/* Search Results */}
                {isLoadingSearch && searchResults.length === 0 && (
                  <div className="flex flex-col items-center justify-center pt-16">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <p className="mt-4 text-muted-foreground">Buscando...</p>
                    </div>
                )}
                {!isLoadingSearch && searchResults.length === 0 && hasSearched && (
                  <p className="pt-8 text-center text-muted-foreground">
                    No se encontraron resultados para "{document.querySelector('input[type=text]')?.value}".
                  </p>
                )}
                {searchResults.length > 0 && (
                    <div className="space-y-2">
                        {searchResults.map((track) => (
                            <TrackItem key={track.id} track={track} onAdd={handleAddTrack} />
                        ))}
                    </div>
                )}


                {/* Divider when showing both search and playlist */}
                {searchResults.length > 0 && playlist.length > 0 && (
                    <div className="my-4 border-b border-border"></div>
                )}

                {/* Playlist */}
                <PlaylistPanel
                    playlist={playlist}
                    onRemoveTrack={() => {}} 
                    currentlyPlayingId={currentlyPlayingId}
                    isGuestView
                />
            </div>
        </div>
      </main>

      {/* Fixed Footer */}
      <footer className="text-center p-2 text-sm text-muted-foreground border-t border-border">
        Hecho por Diego para su cumpleaños © 2025
      </footer>
    </div>
  );
}
