
import { useState, useEffect } from 'react';
import { Search, Loader2, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface SearchPanelProps {
  onSearch: (query: string) => void;
  onClear: () => void;
  isLoading: boolean;
  initialQuery?: string;
}

export function SearchPanel({
  onSearch,
  onClear,
  isLoading,
  initialQuery = '',
}: SearchPanelProps) {
  const [query, setQuery] = useState(initialQuery);

  useEffect(() => {
    // Sync query with external changes (e.g. clearing search)
    if (initialQuery !== query) {
        setQuery(initialQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuery]);

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
          <Input
            type="text"
            placeholder="Buscar en YouTube..."
            className="pr-20 h-10 text-base bg-card rounded-full focus-visible:ring-offset-0 focus-visible:ring-1 focus-visible:ring-ring"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={isLoading}
          />
           <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center">
                {query && !isLoading && (
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 rounded-full"
                        onClick={clearSearch}
                        type="button"
                    >
                        <X className="h-5 w-5 text-muted-foreground"/>
                    </Button>
                )}
                <Button 
                    type="submit" 
                    variant="default"
                    size="icon" 
                    className="rounded-full h-8 w-8 shrink-0"
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
        </div>
      </form>
  );
}
