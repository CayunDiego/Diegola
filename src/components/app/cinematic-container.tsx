
'use client';

import { useState, useEffect, useRef, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface CinematicContainerProps {
  imageUrl?: string;
  trackId?: string; 
  children: ReactNode;
}

export function CinematicContainer({ imageUrl, trackId, children }: CinematicContainerProps) {
  const [avgColor, setAvgColor] = useState<string>('hsl(var(--background))');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!imageUrl) {
        // Reset color when there's no image
        setAvgColor('hsl(var(--background))');
        return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d', { willReadFrequently: true });
    if (!ctx || !canvas) return;

    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = imageUrl;

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      try {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        let r = 0, g = 0, b = 0;

        for (let i = 0; i < data.length; i += 4 * 10) { // Sample every 10th pixel
          r += data[i];
          g += data[i + 1];
          b += data[i + 2];
        }

        const count = data.length / (4 * 10);
        r = Math.floor(r / count);
        g = Math.floor(g / count);
        b = Math.floor(b / count);

        setAvgColor(`rgba(${r}, ${g}, ${b}, 0.3)`);
      } catch (error) {
        console.error("Could not get image data for cinematic effect:", error);
        setAvgColor('hsl(var(--background))');
      }
    };

    img.onerror = () => {
        console.error("Failed to load image for cinematic effect.");
        setAvgColor('hsl(var(--background))');
    }

  }, [imageUrl]);

  return (
    <div className="relative w-full max-w-4xl">
      <div 
        className="absolute -inset-8 sm:-inset-12 md:-inset-20 z-0 transition-all duration-1000"
        style={{
            backgroundImage: `radial-gradient(circle, ${avgColor} 0%, hsl(var(--background)) 70%)`,
            filter: 'blur(40px)',
            opacity: trackId ? 1 : 0, // Fade in/out
        }}
        key={trackId} // Re-trigger animation on track change
      />
      <div className="relative z-10">
        {children}
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}

