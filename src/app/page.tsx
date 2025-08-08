'use client';

import { useState } from 'react';
import type { Track } from '@/types';
import { Header } from '@/components/app/header';
import { SearchPanel } from '@/components/app/search-panel';
import { PlaylistPanel } from '@/components/app/playlist-panel';
import { searchYoutube } from '@/ai/flows/search-youtube';
import { useToast } from "@/hooks/use-toast";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { MonitorPlay } from 'lucide-react';
import { usePlaylist } from '@/hooks/use-playlist';

export default function GuestPage() {
  const { playlist, addTrack, removeTrack } = usePlaylist();
  const [searchResults, setSearchResults] = useState<Track[]>([]);
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);
  const { toast } = useToast();

  const handleSearch = async (query: string) => {
    if (!query) {
      setSearchResults([]);
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
  
  const addTrackToPlaylist = (track: Track) => {
    addTrack(track);
  };


  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header>
        <Link href="/host" passHref>
          <Button variant="ghost" size="icon">
            <MonitorPlay className="h-6 w-6"/>
          </Button>
        </Link>
      </Header>
      <main className="flex-1 container mx-auto p-2 sm:p-4 w-full">
        <div className="flex flex-col gap-4 mt-2">
          <SearchPanel
            onSearch={handleSearch}
            searchResults={searchResults}
            onAddTrack={addTrackToPlaylist}
            isLoading={isLoadingSearch}
          />
          <PlaylistPanel
            playlist={playlist}
            onRemoveTrack={removeTrack}
            isGuestView
          />
        </div>
      </main>
      <footer className="text-center p-4 text-sm text-muted-foreground">
        Hecho por Diego para su cumpleaños © 2025
      </footer>
    </div>
  );
}
