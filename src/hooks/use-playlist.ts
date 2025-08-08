import { useState, useEffect, useCallback } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp, query, orderBy, getDocs, where, writeBatch } from 'firebase/firestore';
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
  }, []);

  const addTrack = async (track: Omit<Track, 'firestoreId' | 'order'>) => {
    try {
      // Check for duplicates using the YouTube video ID before adding
      const q = query(playlistCollectionRef, where("id", "==", track.id));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
          toast({
            title: "Canción Duplicada",
            description: "Esta canción ya está en la playlist.",
          });
          return;
      }
      
      // The new track's order will be the current playlist length,
      // making it the last item.
      const newOrder = playlist.length;
      
      // Add the track with a server-generated timestamp and order
      await addDoc(playlistCollectionRef, { ...track, order: newOrder, createdAt: serverTimestamp() });
       toast({
        title: "¡Canción añadida!",
        description: `"${track.title}" se ha añadido a la playlist.`,
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
      // After removing, we might want to re-order the remaining tracks
      // to ensure the 'order' field is contiguous, but for now we'll leave it
      // as it is for simplicity. Reordering on drop is more important.
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
          // The local state will be updated by the onSnapshot listener,
          // but we can also set it here for a faster UI response.
          setPlaylist(newPlaylist);
      } catch (error) {
          console.error("Error al reordenar la playlist:", error);
          toast({
            title: "Error al Reordenar",
            description: "No se pudo guardar el nuevo orden.",
            variant: "destructive",
          });
      }
  }, [toast]);

  const clearPlaylist = async () => {
    try {
        const deletePromises = playlist.map(track => deleteDoc(doc(db, 'playlist', track.firestoreId!)));
        await Promise.all(deletePromises);
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
