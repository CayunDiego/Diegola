import { Music2 } from 'lucide-react';
import type { ReactNode } from 'react';

export function Header({ children }: { children?: ReactNode }) {
  return (
    <header className="border-b">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <Music2 className="h-7 w-7 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight font-headline">TuneShare</h1>
        </div>
        {children && <div>{children}</div>}
      </div>
    </header>
  );
}
