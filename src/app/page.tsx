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
        // Use a more unique ID for search results to avoid key collisions
        id: `${track.id}_${Date.now()}`, 
        dataAiHint: 'music video'
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
    const trackData = {
        id: track.id.split('_')[0], // Use the original YouTube ID
        title: track.title,
        artist: track.artist,
        thumbnail: track.thumbnail,
        dataAiHint: track.dataAiHint,
    };
    addTrack(trackData);
  };


  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header>
        <Link href="/host" passHref>
          <Button variant="outline">
            <MonitorPlay className="mr-2"/>
            Host View
          </Button>
        </Link>
      </Header>
      <main className="flex-1 container mx-auto p-4 max-w-md w-full">
        <div className="flex flex-col gap-8 mt-4">
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
    </div>
  );
}
