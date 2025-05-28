
"use client";

import { useQuery } from "@tanstack/react-query";
import { CryptoCard, CryptoCardSkeleton } from "@/components/crypto/crypto-card";
import { CryptoSearch } from "@/components/crypto/crypto-search";
import { getCoinsMarkets, getTopCoins } from "@/lib/coingecko";
import type { CoinMarket } from "@/types/coingecko";
import { useWatchlist } from "@/hooks/use-watchlist";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, TrendingUpIcon } from "lucide-react";

export default function HomePage() {
  // useWatchlist is still used by CryptoCard for individual bookmarking status,
  // so it's kept here, but the specific query for the watchlist section is removed.
  const { isLoaded: watchlistLoaded } = useWatchlist();

  const {
    data: topCoins,
    isLoading: topCoinsLoading,
    error: topCoinsError,
  } = useQuery<CoinMarket[], Error>({
    queryKey: ["topCoins"],
    queryFn: () => getTopCoins(10), // Fetch top 10 coins
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return (
    <div className="space-y-12">
      <section className="text-center">
        <h1 className="text-4xl font-bold tracking-tight lg:text-5xl mb-4">
          Welcome to CryptoTrack
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Track cryptocurrency prices, analyze trends, and manage your watchlist.
          Start by searching for a coin or exploring top performers.
        </p>
      </section>

      <section>
        <CryptoSearch />
      </section>

      <section>
        <h2 className="text-xl sm:text-2xl font-semibold mb-6 flex items-center">
          <TrendingUpIcon className="mr-3 h-6 w-6 text-primary" /> Top Cryptocurrencies
        </h2>
        {topCoinsError && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error loading top coins</AlertTitle>
            <AlertDescription>{topCoinsError.message}</AlertDescription>
          </Alert>
        )}
        {topCoinsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <CryptoCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          topCoins && topCoins.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {topCoins.map((coin) => (
                <CryptoCard key={coin.id} coin={coin} />
              ))}
            </div>
          )
        )}
      </section>
    </div>
  );
}
