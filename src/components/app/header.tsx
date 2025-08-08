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
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <Music2 className="h-7 w-7 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight font-headline">
            Diegola
          </h1>
        </div>
        {children && <div>{children}</div>}
      </div>
      {searchPanel && <div className="container mx-auto px-4">{searchPanel}</div>}
    </header>
  );
}
