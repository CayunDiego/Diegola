import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from './use-toast';

const playerStatusDocRef = doc(db, 'player', 'status');

export function usePlayerStatus() {
  const [currentlyPlayingId, setCurrentlyPlayingIdState] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onSnapshot(playerStatusDocRef, (doc) => {
      if (doc.exists()) {
        setCurrentlyPlayingIdState(doc.data().trackId || null);
      } else {
        setCurrentlyPlayingIdState(null);
      }
    }, (error) => {
      console.error("Error getting player status:", error);
      toast({
        title: "Connection Error",
        description: "Could not sync player status.",
        variant: "destructive",
      });
    });

    return () => unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setCurrentlyPlayingId = async (trackId: string) => {
    try {
      await setDoc(playerStatusDocRef, { trackId, updatedAt: serverTimestamp() });
    } catch (error) {
      console.error("Error setting player status:", error);
    }
  };

  const clearCurrentlyPlayingId = async () => {
    try {
      await setDoc(playerStatusDocRef, { trackId: null, updatedAt: serverTimestamp() });
    } catch (error) {
        console.error("Error clearing player status:", error);
    }
  }

  return { currentlyPlayingId, setCurrentlyPlayingId, clearCurrentlyPlayingId };
}
