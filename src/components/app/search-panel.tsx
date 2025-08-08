
import { useState } from 'react';
import { Search, Loader2, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface SearchPanelProps {
  onSearch: (query: string) => void;
  onClear: () => void;
  isLoading: boolean;
}

export function SearchPanel({
  onSearch,
  onClear,
  isLoading,
}: SearchPanelProps) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && !isLoading) {
      onSearch(query);
    }
  };
  
  const clearSearch = () => {
    setQuery('');
    onClear();
  }

  return (
      <form onSubmit={handleSubmit} className="flex gap-2 items-center w-full">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar en YouTube..."
            className="pl-10 pr-10 h-10 text-base bg-card rounded-full focus-visible:ring-offset-0 focus-visible:ring-1 focus-visible:ring-ring"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={isLoading}
          />
          {query && !isLoading && (
            <Button 
                variant="ghost" 
                size="icon" 
                className="absolute right-10 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full"
                onClick={clearSearch}
                type="button"
            >
                <X className="h-5 w-5 text-muted-foreground"/>
            </Button>
          )}
        </div>
        <div className="relative">
            <Button 
                type="submit" 
                variant="default"
                size="icon" 
                className="rounded-full h-10 w-10 shrink-0"
                disabled={isLoading || !query}
                aria-label="Buscar"
            >
               {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                    <Search className="h-5 w-5" />
                )}
            </Button>
        </div>
      </form>
  );
}
