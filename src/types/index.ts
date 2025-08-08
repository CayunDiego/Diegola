import type { Timestamp } from 'firebase/firestore';

export interface Track {
  id: string;
  title: string;
  artist: string;
  thumbnail: string;
  dataAiHint?: string;
  createdAt?: Timestamp;
}
