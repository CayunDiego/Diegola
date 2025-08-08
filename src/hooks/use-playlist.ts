import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import type { Track } from '@/types';
import { useToast } from './use-toast';

export function usePlaylist() {
  const [playlist, setPlaylist] = useState<Track[]>([]);
  const { toast } = useToast();
  const playlistCollectionRef = collection(db, 'playlist');

  useEffect(() => {
    const q = query(playlistCollectionRef, orderBy('createdAt', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const playlistData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Track[];
      setPlaylist(playlistData);
    }, (error) => {
      console.error("Error al obtener la playlist de Firestore:", error);
      toast({
        title: "Error de Conexión",
        description: "No se pudo conectar a la playlist en tiempo real.",
        variant: "destructive",
      });
    });

    return () => unsubscribe();
  }, []);

  const addTrack = async (track: Omit<Track, 'id'>) => {
    try {
      // Check for duplicates before adding
      const isDuplicate = playlist.some(existingTrack => existingTrack.id.split('_')[0] === track.id.split('_')[0]);
      if (isDuplicate) {
          toast({
            title: "Canción Duplicada",
            description: "Esta canción ya está en la playlist.",
          });
          return;
      }
      
      await addDoc(playlistCollectionRef, { ...track, createdAt: serverTimestamp() });
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

  const removeTrack = async (trackId: string) => {
    try {
      await deleteDoc(doc(db, 'playlist', trackId));
    } catch (error) {
      console.error("Error al eliminar la canción:", error);
      toast({
        title: "Error al Eliminar",
        description: "No se pudo eliminar la canción de la playlist.",
        variant: "destructive",
      });
    }
  };
  
  const clearPlaylist = async () => {
    try {
        const deletePromises = playlist.map(track => deleteDoc(doc(db, 'playlist', track.id)));
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

  return { playlist, addTrack, removeTrack, clearPlaylist };
}
