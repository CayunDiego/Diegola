import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp, query, orderBy, getDocs, where } from 'firebase/firestore';
import type { Track } from '@/types';
import { useToast } from './use-toast';

export function usePlaylist() {
  const [playlist, setPlaylist] = useState<Track[]>([]);
  const { toast } = useToast();
  const playlistCollectionRef = collection(db, 'playlist');

  useEffect(() => {
    // We order by 'createdAt' to get the playlist in the correct order
    const q = query(playlistCollectionRef, orderBy('createdAt', 'asc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      // We map the documents to Track objects, including the Firestore document ID
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

  const addTrack = async (track: Omit<Track, 'firestoreId'>) => {
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
      
      // Add the track with a server-generated timestamp
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

  const removeTrack = async (firestoreId: string) => {
    try {
      // Delete the document using its Firestore ID
      await deleteDoc(doc(db, 'playlist', firestoreId));
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
        // To delete all tracks, we fetch all documents and delete them one by one
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

  return { playlist, addTrack, removeTrack, clearPlaylist };
}
