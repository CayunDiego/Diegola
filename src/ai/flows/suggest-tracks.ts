'use server';

/**
 * @fileOverview AI-powered music suggestion flow.
 * 
 * - suggestTracks - A function that suggests music tracks based on a given playlist and trending tracks.
 * - SuggestTracksInput - The input type for the suggestTracks function.
 * - SuggestTracksOutput - The return type for the suggestTracks function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestTracksInputSchema = z.object({
  playlist: z
    .array(z.string())
    .describe('The current playlist of music tracks.'),
  trendingTracks: z
    .array(z.string())
    .describe('A list of currently trending music tracks.'),
});
export type SuggestTracksInput = z.infer<typeof SuggestTracksInputSchema>;

const SuggestTracksOutputSchema = z.object({
  suggestions: z
    .array(z.string())
    .describe('A list of suggested music tracks based on the playlist and trending tracks.'),
});
export type SuggestTracksOutput = z.infer<typeof SuggestTracksOutputSchema>;

export async function suggestTracks(input: SuggestTracksInput): Promise<SuggestTracksOutput> {
  return suggestTracksFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestTracksPrompt',
  input: {schema: SuggestTracksInputSchema},
  output: {schema: SuggestTracksOutputSchema},
  prompt: `You are a music recommendation expert.

Based on the current playlist and trending tracks, suggest new music tracks that the user might enjoy.

Current Playlist:
{{#each playlist}}- {{this}}\n{{/each}}

Trending Tracks:
{{#each trendingTracks}}- {{this}}\n{{/each}}

Suggestions:`, 
});

const suggestTracksFlow = ai.defineFlow(
  {
    name: 'suggestTracksFlow',
    inputSchema: SuggestTracksInputSchema,
    outputSchema: SuggestTracksOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
