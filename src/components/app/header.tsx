import { Music2 } from 'lucide-react';
import type { ReactNode } from 'react';

export function Header({
  children,
  searchPanel,
}: {
  children?: ReactNode;
  searchPanel?: ReactNode;
}) {
  return (
    <header className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4">
        <div className="flex items-center gap-3">
          <Music2 className="h-7 w-7 text-primary" />
          <h1 className="hidden sm:block text-2xl font-bold tracking-tight font-headline">
            Diegola
          </h1>
        </div>
        
        {searchPanel && (
            <div className="flex-1 flex justify-center px-4">
                <div className="w-full max-w-md">
                    {searchPanel}
                </div>
            </div>
        )}

        {children && <div className="flex items-center gap-2">{children}</div>}
      </div>
    </header>
  );
}
