'use client';

import { useState } from 'react';
import type { Track } from '@/types';
import { Header } from '@/components/app/header';
import { SearchPanel } from '@/components/app/search-panel';
import { PlaylistPanel } from '@/components/app/playlist-panel';
import { Player } from '@/components/app/player';
import { searchYoutube } from '@/ai/flows/search-youtube';
import { useToast } from "@/hooks/use-toast";

const initialPlaylist: Track[] = [
  { id: '3JZ_D3ELwOQ', title: 'Stairway to Heaven', artist: 'Led Zeppelin', thumbnail: 'https://i.ytimg.com/vi/3JZ_D3ELwOQ/mqdefault.jpg', dataAiHint: 'rock music' },
  { id: 'fJ9rUzIMcZQ', title: 'Hotel California', artist: 'Eagles', thumbnail: 'https://i.ytimg.com/vi/fJ9rUzIMcZQ/mqdefault.jpg', dataAiHint: 'rock music' },
];

export default function Home() {
  const [playlist, setPlaylist] = useState<Track[]>(initialPlaylist);
  const [searchResults, setSearchResults] = useState<Track[]>([]);
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<Track | null>(null);
  const { toast } = useToast();

  const handleSearch = async (query: string) => {
    if (!query) {
      setSearchResults([]);
      return;
    }
    console.log("Iniciando búsqueda en el cliente para:", query);
    setIsLoadingSearch(true);
    setCurrentlyPlaying(null); // Opcional: limpiar el reproductor al buscar
    try {
      const response = await searchYoutube({ query });
      console.log("Respuesta recibida en el cliente:", response);
      const tracks: Track[] = response.results.map(track => ({
        ...track,
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
    if (!playlist.find(t => t.id === track.id)) {
      setPlaylist(prev => [...prev, track]);
    }
  };

  const removeTrackFromPlaylist = (trackId: string) => {
    setPlaylist(prev => prev.filter(t => t.id !== trackId));
    if(currentlyPlaying?.id === trackId) {
      setCurrentlyPlaying(null);
    }
  };

  const playTrack = (track: Track) => {
    setCurrentlyPlaying(track);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-1 container mx-auto p-4 max-w-md w-full">
        {currentlyPlaying && <Player track={currentlyPlaying} />}
        <div className="flex flex-col gap-8 mt-4">
          <SearchPanel
            onSearch={handleSearch}
            searchResults={searchResults}
            onAddTrack={addTrackToPlaylist}
            isLoading={isLoadingSearch}
          />
          <PlaylistPanel
            playlist={playlist}
            onRemoveTrack={removeTrackFromPlaylist}
            onPlayTrack={playTrack}
            currentlyPlayingId={currentlyPlaying?.id}
          />
        </div>
      </main>
    </div>
  );
}
