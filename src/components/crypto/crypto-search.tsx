
"use client";

import { useState, useEffect, useRef } from "react"; // Added useEffect, useRef
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation"; // Added useRouter
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { searchCoins } from "@/lib/coingecko";
import type { CoinSearchItem } from "@/types/coingecko";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, SearchIcon, AlertTriangle } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";

export function CryptoSearch() {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 500);
  const [isFocused, setIsFocused] = useState(false);
  const router = useRouter(); // Initialize useRouter
  const searchContainerRef = useRef<HTMLDivElement>(null); // Ref for click outside

  const { data: searchResults, isLoading, isError, error } = useQuery<CoinSearchItem[], Error>({
    queryKey: ["searchCoins", debouncedQuery],
    queryFn: () => searchCoins(debouncedQuery).then(res => res.coins),
    enabled: debouncedQuery.length > 0,
    retry: 1,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  // Close dropdown if clicked outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []); // Empty dependency array means this effect runs once on mount and cleans up on unmount

  return (
    <div ref={searchContainerRef} className="relative w-full max-w-lg mx-auto">
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search for a cryptocurrency..."
          value={query}
          onChange={handleInputChange}
          onFocus={() => setIsFocused(true)}
          // Removed onBlur from here, click outside handles closing now
          className="pl-10 pr-10 py-2 w-full"
        />
         {isLoading && query === debouncedQuery && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground animate-spin" />
          )}
      </div>

      {isFocused && debouncedQuery.length > 0 && (
        <Card className="absolute z-50 w-full mt-1 shadow-lg border">
          <ScrollArea className="max-h-80">
            <CardContent className="p-1">
              {isLoading && (
                <div className="p-3 text-center text-muted-foreground flex items-center justify-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Searching...</span>
                </div>
              )}
              {isError && !isLoading && (
                <div className="p-3 text-center text-destructive flex flex-col items-center justify-center space-y-1">
                  <AlertTriangle className="h-5 w-5" />
                  <span>Error fetching results.</span>
                  {error?.message && (
                     <span className="text-xs text-destructive/80">{error.message.includes("429") ? "Too many requests. Please try again briefly." : error.message}</span>
                  )}
                </div>
              )}
              {!isLoading && !isError && searchResults && searchResults.length > 0 && (
                <ul className="divide-y divide-border">
                  {searchResults.map((coin) => (
                    <li key={coin.id}>
                      <div // Changed from Link to div
                        className="flex items-center p-2.5 hover:bg-accent/50 rounded-md transition-colors duration-150 cursor-pointer"
                        onMouseDown={(e) => { // Using onMouseDown
                          // e.preventDefault(); // Usually not needed, uncomment if it causes selection issues
                          router.push(`/crypto/${coin.id}`);
                          setIsFocused(false); // Close dropdown after initiating navigation
                        }}
                      >
                        <Image
                          src={coin.thumb}
                          alt={coin.name}
                          width={24}
                          height={24}
                          className="rounded-full mr-3 flex-shrink-0"
                        />
                        <div className="flex-grow overflow-hidden">
                          <p className="font-medium text-sm truncate">{coin.name}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {coin.symbol.toUpperCase()}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              {!isLoading && !isError && searchResults && searchResults.length === 0 && (
                <p className="p-3 text-center text-muted-foreground">
                  No results found for &quot;{debouncedQuery}&quot;.
                </p>
              )}
            </CardContent>
          </ScrollArea>
        </Card>
      )}
    </div>
  );
}
