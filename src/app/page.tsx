'use client';

import { useState } from 'react';
import type { Track } from '@/types';
import { Header } from '@/components/app/header';
import { SearchPanel } from '@/components/app/search-panel';
import { PlaylistPanel } from '@/components/app/playlist-panel';
import { suggestTracks } from '@/ai/flows/suggest-tracks';

const initialPlaylist: Track[] = [
  { id: '3JZ_D3ELwOQ', title: 'Stairway to Heaven', artist: 'Led Zeppelin', thumbnail: 'https://placehold.co/120x90.png', dataAiHint: 'rock music' },
  { id: 'fJ9rUzIMcZQ', title: 'Hotel California', artist: 'Eagles', thumbnail: 'https://placehold.co/120x90.png', dataAiHint: 'rock music' },
];

const mockTrendingTracks: string[] = [
  "Dua Lipa - Houdini",
  "Tate McRae - Greedy",
  "Jack Harlow - Lovin On Me",
  "Tyla - Water",
  "Doja Cat - Agora Hills"
];


export default function Home() {
  const [playlist, setPlaylist] = useState<Track[]>(initialPlaylist);
  const [searchResults, setSearchResults] = useState<Track[]>([]);
  const [suggestions, setSuggestions] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState({ search: false, suggestions: false });

  const handleSearch = async (query: string) => {
    if (!query) {
      setSearchResults([]);
      return;
    }
    setIsLoading(prev => ({ ...prev, search: true }));
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 500));
    const mockResults: Track[] = [
        { id: 'y6120QOlsfU', title: 'Bohemian Rhapsody', artist: 'Queen', thumbnail: 'https://placehold.co/120x90.png', dataAiHint: 'rock band' },
        { id: 'dQw4w9WgXcQ', title: 'Never Gonna Give You Up', artist: 'Rick Astley', thumbnail: 'https://placehold.co/120x90.png', dataAiHint: 'pop music' },
        { id: '9bZkp7q19f0', title: 'Smells Like Teen Spirit', artist: 'Nirvana', thumbnail: 'https://placehold.co/120x90.png', dataAiHint: 'grunge rock' },
        { id: 'P01-Qo-aI8E', title: 'Africa', artist: 'TOTO', thumbnail: 'https://placehold.co/120x90.png', dataAiHint: 'pop rock' },
    ];
    setSearchResults(mockResults.filter(t => t.title.toLowerCase().includes(query.toLowerCase()) || t.artist.toLowerCase().includes(query.toLowerCase())));
    setIsLoading(prev => ({ ...prev, search: false }));
  };

  const getSuggestions = async () => {
    setIsLoading(prev => ({ ...prev, suggestions: true }));
    setSuggestions([]);
    try {
      const currentPlaylistTitles = playlist.map(t => `${t.title} by ${t.artist}`);
      const result = await suggestTracks({
        playlist: currentPlaylistTitles,
        trendingTracks: mockTrendingTracks,
      });
      
      const suggestionsAsTracks = result.suggestions.map((suggestion, index) => {
        const [title, artist] = suggestion.split(' by ');
        return {
          id: `sug-${index}-${Date.now()}`,
          title: title || suggestion,
          artist: artist || 'AI Suggestion',
          thumbnail: 'https://placehold.co/120x90.png',
          dataAiHint: 'music album'
        }
      });
      setSuggestions(suggestionsAsTracks);

    } catch (error) {
      console.error("Failed to get suggestions:", error);
      // Handle error in UI if needed
    } finally {
      setIsLoading(prev => ({ ...prev, suggestions: false }));
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
      <main className="flex-1 container mx-auto p-4 w-full">
        <div className="flex flex-col gap-8">
          <SearchPanel
            onSearch={handleSearch}
            searchResults={searchResults}
            suggestions={suggestions}
            onGetSuggestions={getSuggestions}
            onAddTrack={addTrackToPlaylist}
            isLoading={isLoading}
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
