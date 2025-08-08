'use client';

import { useState } from 'react';
import type { Track } from '@/types';
import { Header } from '@/components/app/header';
import { SearchPanel } from '@/components/app/search-panel';
import { PlaylistPanel } from '@/components/app/playlist-panel';
import { searchYoutube } from '@/ai/flows/search-youtube';

const initialPlaylist: Track[] = [
  { id: '3JZ_D3ELwOQ', title: 'Stairway to Heaven', artist: 'Led Zeppelin', thumbnail: 'https://placehold.co/120x90.png', dataAiHint: 'rock music' },
  { id: 'fJ9rUzIMcZQ', title: 'Hotel California', artist: 'Eagles', thumbnail: 'https://placehold.co/120x90.png', dataAiHint: 'rock music' },
];

export default function Home() {
  const [playlist, setPlaylist] = useState<Track[]>(initialPlaylist);
  const [searchResults, setSearchResults] = useState<Track[]>([]);
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);

  const handleSearch = async (query: string) => {
    if (!query) {
      setSearchResults([]);
      return;
    }
    setIsLoadingSearch(true);
    try {
      const response = await searchYoutube({ query });
      const tracks: Track[] = response.results.map(track => ({
        ...track,
        dataAiHint: 'music video'
      }));
      setSearchResults(tracks);
    } catch (error) {
      console.error("Failed to search youtube:", error);
      // Handle error in UI if needed
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
  };
  
  const reorderPlaylist = (draggedId: string, targetId: string) => {
    const newPlaylist = [...playlist];
    const draggedIndex = newPlaylist.findIndex(t => t.id === draggedId);
    const targetIndex = newPlaylist.findIndex(t => t.id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const [removed] = newPlaylist.splice(draggedIndex, 1);
    newPlaylist.splice(targetIndex, 0, removed);
    setPlaylist(newPlaylist);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-1 container mx-auto p-4 max-w-md w-full">
        <div className="flex flex-col gap-8">
          <SearchPanel
            onSearch={handleSearch}
            searchResults={searchResults}
            onAddTrack={addTrackToPlaylist}
            isLoading={isLoadingSearch}
          />
          <PlaylistPanel
            playlist={playlist}
            onRemoveTrack={removeTrackFromPlaylist}
            onReorder={reorderPlaylist}
          />
        </div>
      </main>
    </div>
  );
}
