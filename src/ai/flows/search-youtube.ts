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
    })
  ),
});
export type SearchYoutubeOutput = z.infer<typeof SearchYoutubeOutputSchema>;


export async function searchYoutube(input: SearchYoutubeInput): Promise<SearchYoutubeOutput> {
  return searchYoutubeFlow(input);
}

const mockResults: Track[] = [
    { id: 'y6120QOlsfU', title: 'Bohemian Rhapsody', artist: 'Queen', thumbnail: 'https://i.ytimg.com/vi/y6120QOlsfU/mqdefault.jpg' },
    { id: 'dQw4w9WgXcQ', title: 'Never Gonna Give You Up', artist: 'Rick Astley', thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg' },
    { id: '9bZkp7q19f0', title: 'Smells Like Teen Spirit', artist: 'Nirvana', thumbnail: 'https://i.ytimg.com/vi/9bZkp7q19f0/mqdefault.jpg' },
    { id: 'P01-Qo-aI8E', title: 'Africa', artist: 'TOTO', thumbnail: 'https://i.ytimg.com/vi/P01-Qo-aI8E/mqdefault.jpg' },
];

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
      return { results: filtered };
    }

    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(input.query)}&type=video&key=${apiKey}&maxResults=10`;
    console.log("URL de la API de YouTube:", url.replace(apiKey, 'TU_CLAVE_AQUI'));

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data?.error?.message || `HTTP error! status: ${response.status}`;
        console.error("Error en la API de YouTube:", errorMessage, data);
        if (errorMessage.includes('API key not valid')) {
            console.warn("La clave de API de YouTube no es válida. Devolviendo datos de ejemplo.");
             const filtered = mockResults.filter(t => t.title.toLowerCase().includes(input.query.toLowerCase()) || t.artist.toLowerCase().includes(input.query.toLowerCase()));
            return { results: filtered };
        }
        throw new Error(`Error en la API de YouTube: ${errorMessage}`);
      }
      
      console.log("Datos recibidos de la API de YouTube:", data);

      if (!data.items) {
        console.warn("La respuesta de la API de YouTube no contiene 'items'.", data);
        throw new Error("La API de YouTube devolvió una respuesta inesperada. Revisa la cuota de tu API.");
      }
      
      const results: Track[] = data.items.map((item: any) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        artist: item.snippet.channelTitle,
        thumbnail: item.snippet.thumbnails.default.url.replace('http://', 'https://'),
      }));
      
      console.log("Resultados procesados:", results);
      return { results };

    } catch (error: any) {
      console.error("Fallo al buscar en YouTube:", error);
      throw new Error(error.message || 'Error al conectar con YouTube.');
    }
  }
);
