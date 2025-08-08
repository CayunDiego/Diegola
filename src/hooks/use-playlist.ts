import { useState, useEffect, useCallback } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp, query, orderBy, getDocs, where, writeBatch, runTransaction, limit } from 'firebase/firestore';
import type { Track } from '@/types';
import { useToast } from './use-toast';

export function usePlaylist() {
  const [playlist, setPlaylist] = useState<Track[]>([]);
  const { toast } = useToast();
  const playlistCollectionRef = collection(db, 'playlist');

  useEffect(() => {
    // We order by 'order' now to respect the custom sorting
    const q = query(playlistCollectionRef, orderBy('order', 'asc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const playlistData = snapshot.docs.map(doc => ({ ...doc.data(), firestoreId: doc.id })) as Track[];
      setPlaylist(playlistData);
    }, (error) => {
      console.error("Error al obtener la playlist de Firestore:", error);
      toast({
        title: "Error de Conexión",
        description: "No se pudo conectar a la playlist en tiempo real.",
        variant: "destructive",
      });
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addTrack = async (track: Omit<Track, 'firestoreId' | 'order' | 'createdAt'>) => {
    try {
      await runTransaction(db, async (transaction) => {
        // Check for duplicates using the YouTube video ID before adding
        const q = query(playlistCollectionRef, where("id", "==", track.id));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
            toast({
              title: "Canción Duplicada",
              description: "Esta canción ya está en la playlist.",
              variant: "default",
            });
            // By returning, we abort the transaction
            return;
        }
        
        // Get the current highest order number by querying for the last track by order
        const orderQuery = query(playlistCollectionRef, orderBy('order', 'desc'), limit(1));
        const lastTrackSnapshot = await getDocs(orderQuery);
        const lastOrder = lastTrackSnapshot.docs.length > 0 ? (lastTrackSnapshot.docs[0].data().order ?? -1) : -1;
        const newOrder = lastOrder + 1;
        
        // Use transaction.set with a new doc ref
        const newDocRef = doc(playlistCollectionRef);
        transaction.set(newDocRef, { ...track, order: newOrder, createdAt: serverTimestamp() });

        toast({
          title: "¡Canción añadida!",
          description: `"${track.title}" se ha añadido a la playlist.`,
        });
      });
    } catch (error) {
      console.error("Error al añadir la canción:", error);
      toast({
        title: "Error al Añadir",
        description: "No se pudo añadir la canción a la playlist.",
        variant: "destructive",
      });
    }
  };

  const removeTrack = async (firestoreId: string) => {
    try {
      await deleteDoc(doc(db, 'playlist', firestoreId));
      // Firestore listener will update the list. We might need to re-order remaining tracks
      // but for now, we'll let the drag and drop handle final order.
    } catch (error) {
      console.error("Error al eliminar la canción:", error);
      toast({
        title: "Error al Eliminar",
        description: "No se pudo eliminar la canción de la playlist.",
        variant: "destructive",
      });
    }
  };
  
  const updatePlaylistOrder = useCallback(async (newPlaylist: Track[]) => {
      const batch = writeBatch(db);
      newPlaylist.forEach((track, index) => {
          if (track.firestoreId) {
            const docRef = doc(db, 'playlist', track.firestoreId);
            batch.update(docRef, { order: index });
          }
      });
      try {
          await batch.commit();
          // The onSnapshot listener will handle the UI update.
      } catch (error) {
          console.error("Error al reordenar la playlist:", error);
          toast({
            title: "Error al Reordenar",
            description: "No se pudo guardar el nuevo orden.",
            variant: "destructive",
          });
      }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const clearPlaylist = async () => {
    try {
        const querySnapshot = await getDocs(playlistCollectionRef);
        const batch = writeBatch(db);
        querySnapshot.forEach(doc => {
            batch.delete(doc.ref);
        });
        await batch.commit();
        toast({
            title: "Playlist Vaciada",
            description: "Se han eliminado todas las canciones."
        });
    } catch (error) {
        console.error("Error al vaciar la playlist:", error);
        toast({
            title: "Error",
            description: "No se pudo vaciar la playlist.",
            variant: "destructive"
        });
    }
  };

  return { playlist, addTrack, removeTrack, clearPlaylist, updatePlaylistOrder };
}
