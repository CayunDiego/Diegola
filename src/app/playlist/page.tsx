'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Music2, Link as LinkIcon, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Header } from '@/components/app/header';
import { Skeleton } from '@/components/ui/skeleton';

interface SharedTrack {
    id: string;
    title: string;
    artist: string;
}

function PlaylistContent() {
    const searchParams = useSearchParams();
    const [playlist, setPlaylist] = useState<SharedTrack[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const tracksParam = searchParams.get('tracks');
        if (tracksParam) {
            try {
                const decodedTracks = JSON.parse(atob(tracksParam));
                if (Array.isArray(decodedTracks)) {
                    setPlaylist(decodedTracks);
                } else {
                    throw new Error("Invalid playlist format.");
                }
            } catch (e) {
                console.error("Failed to decode playlist:", e);
                setError("This playlist link seems to be broken or invalid.");
            }
        } else {
            setError("No playlist data found in the URL.");
        }
        setIsLoading(false);
    }, [searchParams]);

    if (isLoading) {
        return (
            <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4 p-2">
                        <Skeleton className="h-14 w-20 rounded-md" />
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (error) {
        return (
             <div className="flex flex-col items-center justify-center rounded-md border-2 border-dashed border-destructive/50 p-8 text-center text-destructive">
                <AlertTriangle className="h-10 w-10" />
                <p className="mt-4 font-semibold">Oops! Something went wrong.</p>
                <p className="text-sm">{error}</p>
             </div>
        );
    }
    
    if (playlist.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center rounded-md border-2 border-dashed border-muted-foreground/30 p-8 text-center">
                <LinkIcon className="h-10 w-10 text-muted-foreground/50" />
                <p className="mt-4 text-muted-foreground">This shared playlist is empty.</p>
            </div>
        )
    }

    return (
        <div className="space-y-2">
            {playlist.map((track, index) => (
                <div key={track.id} className="flex items-center gap-4 p-2 rounded-lg bg-secondary/50">
                    <span className="text-lg font-bold text-muted-foreground w-6 text-center">{index + 1}</span>
                    <Image
                        src={`https://placehold.co/80x60.png`}
                        alt={track.title}
                        width={80}
                        height={60}
                        className="rounded-md"
                        data-ai-hint="music album"
                    />
                    <div className="flex-1">
                        <p className="font-semibold">{track.title}</p>
                        <p className="text-sm text-muted-foreground">{track.artist}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default function SharedPlaylistPage() {
    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground">
            <Header />
            <main className="flex-1 container mx-auto p-4 md:px-6 flex items-center justify-center">
                <Card className="w-full max-w-2xl">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                           <Music2 className="text-primary"/> Shared Playlist
                        </CardTitle>
                        <CardDescription>
                            This is a shared playlist. To edit, please create your own list on the main page.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Suspense fallback={<div className="flex justify-center p-4"><Skeleton className="h-8 w-8" /></div>}>
                           <PlaylistContent />
                        </Suspense>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
