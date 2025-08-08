import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Decodes HTML entities from a string.
 * @param text The text to decode.
 * @returns The decoded text.
 */
export function decodeHtmlEntities(text: string): string {
    if (typeof window === 'undefined') {
      // Basic decoding for server-side rendering to avoid breaking on common entities.
      return text.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&apos;/g, "'");
    }
    const textarea = document.createElement("textarea");
    textarea.innerHTML = text;
    return textarea.value;
}
