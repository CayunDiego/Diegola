import type { Timestamp } from 'firebase/firestore';

export interface Track {
  id: string; // YouTube video ID
  firestoreId?: string; // Firestore document ID
  title: string;
  artist: string;
  thumbnail: string;
  dataAiHint?: string;
  createdAt?: Timestamp;
  order: number;
}
