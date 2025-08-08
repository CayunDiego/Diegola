'use server';

/**
 * @fileOverview Flow to search for YouTube videos.
 *
 * - searchYoutube - A function that searches for YouTube videos based on a query.
 * - SearchYoutubeInput - The input type for the searchYoutube function.
 * - SearchYoutubeOutput - The return type for the searchYoutube function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import type { Track } from '@/types';
import { GaxiosError } from 'gaxios';

const SearchYoutubeInputSchema = z.object({
  query: z.string().describe('The search query for YouTube.'),
});
export type SearchYoutubeInput = z.infer<typeof SearchYoutubeInputSchema>;

const SearchYoutubeOutputSchema = z.object({
  results: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      artist: z.string(),
      thumbnail: z.string(),
      duration: z.string().optional(),
      viewCount: z.string().optional(),
    })
  ),
});
export type SearchYoutubeOutput = z.infer<typeof SearchYoutubeOutputSchema>;


export async function searchYoutube(input: SearchYoutubeInput): Promise<SearchYoutubeOutput> {
  return searchYoutubeFlow(input);
}

const mockResults: (Omit<Track, 'order'> & {duration?: string; viewCount?: string})[] = [
    { id: 'y6120QOlsfU', title: 'Bohemian Rhapsody', artist: 'Queen', thumbnail: 'https://i.ytimg.com/vi/y6120QOlsfU/mqdefault.jpg', duration: '5:55', viewCount: '1.2B' },
    { id: 'dQw4w9WgXcQ', title: 'Never Gonna Give You Up', artist: 'Rick Astley', thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg', duration: '3:32', viewCount: '1.5B' },
    { id: '9bZkp7q19f0', title: 'Smells Like Teen Spirit', artist: 'Nirvana', thumbnail: 'https://i.ytimg.com/vi/9bZkp7q19f0/mqdefault.jpg', duration: '4:38', viewCount: '1.9B' },
    { id: 'P01-Qo-aI8E', title: 'Africa', artist: 'TOTO', thumbnail: 'https://i.ytimg.com/vi/P01-Qo-aI8E/mqdefault.jpg', duration: '4:56', viewCount: '987M' },
];

// Helper to format YouTube duration (PT#M#S) to a human-readable format (M:SS)
const formatDuration = (duration: string): string => {
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  if (!match) return '0:00';

  const hours = parseInt(match[1] || '0');
  const minutes = parseInt(match[2] || '0');
  const seconds = parseInt(match[3] || '0');

  const totalSeconds = hours * 3600 + minutes * 60 + seconds;
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// Helper to format view count into a compact form (e.g., 1.2M, 500K)
const formatViewCount = (viewCount: string): string => {
  const num = parseInt(viewCount);
  if (num >= 1000000000) return (num / 1000000000).toFixed(1).replace(/\.0$/, '') + 'B';
  if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  return num.toString();
}

const searchYoutubeFlow = ai.defineFlow(
  {
    name: 'searchYoutubeFlow',
    inputSchema: SearchYoutubeInputSchema,
    outputSchema: SearchYoutubeOutputSchema,
  },
  async (input) => {
    console.log(`Iniciando búsqueda en YouTube para: "${input.query}"`);
    const apiKey = process.env.YOUTUBE_API_KEY;

    if (!apiKey) {
      console.warn("YOUTUBE_API_KEY no configurada. Devolviendo datos de ejemplo.");
      const filtered = mockResults.filter(t => t.title.toLowerCase().includes(input.query.toLowerCase()) || t.artist.toLowerCase().includes(input.query.toLowerCase()));
      return { results: filtered as any[] };
    }

    // Step 1: Search for videos
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(input.query)}&type=video&key=${apiKey}&maxResults=10`;
    console.log("URL de la API de YouTube (Search):", searchUrl.replace(apiKey, 'TU_CLAVE_AQUI'));

    try {
      const searchResponse = await fetch(searchUrl);
      const searchData = await searchResponse.json();

      if (!searchResponse.ok) {
        const error = searchData?.error;
        const errorMessage = error?.message || `HTTP error! status: ${searchResponse.status}`;
        console.error("Error en la API de YouTube (Search):", errorMessage, searchData);
         if (error?.message.includes('API key not valid') || error?.errors?.[0]?.reason.includes('keyInvalid')) {
            console.warn("La clave de API de YouTube no es válida. Devolviendo datos de ejemplo.");
            const filtered = mockResults.filter(t => t.title.toLowerCase().includes(input.query.toLowerCase()) || t.artist.toLowerCase().includes(input.query.toLowerCase()));
            return { results: filtered as any[] };
        }
        throw new Error(`Error en la API de YouTube: ${errorMessage}`);
      }
      
      console.log("Datos recibidos de la API de YouTube (Search):", searchData);

      if (!searchData.items || searchData.items.length === 0) {
        console.log("La búsqueda en YouTube no arrojó resultados.");
        return { results: [] };
      }
      
      const videoIds = searchData.items
        .map((item: any) => item.id?.videoId)
        .filter((id: any) => id); // Filter out any undefined IDs

      if (videoIds.length === 0) {
        return { results: [] };
      }

      // Step 2: Get video details (duration, view count) for the found video IDs
      const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,statistics,snippet&id=${videoIds.join(',')}&key=${apiKey}`;
      console.log("URL de la API de YouTube (Videos):", detailsUrl.replace(apiKey, 'TU_CLAVE_AQUI'));

      const detailsResponse = await fetch(detailsUrl);
      const detailsData = await detailsResponse.json();

       if (!detailsResponse.ok) {
        const errorMessage = detailsData?.error?.message || `HTTP error! status: ${detailsResponse.status}`;
        // Don't throw, just log the error and return results without details
        console.error("Error al obtener detalles del video:", errorMessage, detailsData);
        // Fallback to search results without extra data
        const fallbackResults = searchData.items.map((item: any) => ({
            id: item.id.videoId,
            title: item.snippet.title,
            artist: item.snippet.channelTitle,
            thumbnail: item.snippet.thumbnails.default.url.replace('http://', 'https://'),
        }));
        return { results: fallbackResults };
      }

      const videoDetailsMap = new Map(detailsData.items.map((item: any) => [item.id, item]));

      const results: (Omit<Track, 'order'> & {duration?: string; viewCount?: string})[] = searchData.items
        .map((item: any) => {
            const videoId = item.id.videoId;
            if (!videoId) return null;

            const details = videoDetailsMap.get(videoId);
            return {
                id: videoId,
                title: item.snippet.title,
                artist: item.snippet.channelTitle,
                thumbnail: item.snippet.thumbnails.default.url.replace('http://', 'https://'),
                duration: details ? formatDuration(details.contentDetails.duration) : undefined,
                viewCount: details ? formatViewCount(details.statistics.viewCount) : undefined
            };
        })
        .filter((track: any): track is Track => track !== null);
      
      console.log("Resultados procesados con detalles:", results);
      return { results };

    } catch (error: any) {
      console.error("Fallo al buscar en YouTube:", error);
      // Check for GaxiosError which is common for Google API client errors
      if (error instanceof GaxiosError) {
        const apiError = (error.response?.data as any)?.error;
        if (apiError?.message) {
            if (apiError.message.includes('API key not valid')) {
                console.warn("La clave de API de YouTube no es válida. Devolviendo datos de ejemplo.");
                const filtered = mockResults.filter(t => t.title.toLowerCase().includes(input.query.toLowerCase()) || t.artist.toLowerCase().includes(input.query.toLowerCase()));
                return { results: filtered as any[] };
            }
            throw new Error(`Error de la API de YouTube: ${apiError.message}`);
        }
      }
      throw new Error(error.message || 'Error al conectar con YouTube.');
    }
  }
);
