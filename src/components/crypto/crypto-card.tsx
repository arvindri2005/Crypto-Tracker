
"use client";

import Image from "next/image";
import Link from "next/link";
import type { CoinMarket } from "@/types/coingecko";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Star, StarOff } from "lucide-react";
import { formatCurrency, formatPercentage, formatMarketCap } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { useWatchlist } from "@/hooks/use-watchlist";

interface CryptoCardProps {
  coin: CoinMarket;
}

export function CryptoCard({ coin }: CryptoCardProps) {
  const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useWatchlist();
  const isWatched = isInWatchlist(coin.id);

  const handleWatchlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isWatched) {
      removeFromWatchlist(coin.id);
    } else {
      addToWatchlist(coin.id, coin); // Pass the full coin object here
    }
  };

  return (
    <Link href={`/crypto/${coin.id}`} className="block group">
      <Card className="hover:shadow-lg transition-shadow duration-200 h-full flex flex-col">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
          <div className="flex items-center space-x-3">
            <Image
              src={coin.image}
              alt={coin.name}
              width={40}
              height={40}
              className="rounded-full"
            />
            <div>
              <CardTitle className="text-lg font-medium">{coin.name}</CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                {coin.symbol.toUpperCase()}
              </CardDescription>
            </div>
          </div>
           <Button
            variant="ghost"
            size="icon"
            onClick={handleWatchlistToggle}
            className="text-muted-foreground hover:text-primary"
            aria-label={isWatched ? `Remove ${coin.name} from watchlist` : `Add ${coin.name} to watchlist`}
          >
            {isWatched ? <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" /> : <Star className="h-5 w-5" />}
          </Button>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col justify-between">
          <div>
            <div className="text-2xl font-bold">{formatCurrency(coin.current_price)}</div>
            <p
              className={cn(
                "text-xs",
                coin.price_change_percentage_24h >= 0
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              )}
            >
              {formatPercentage(coin.price_change_percentage_24h)} (24h)
            </p>
            <div className="mt-2 text-sm text-muted-foreground">
              Market Cap: {formatMarketCap(coin.market_cap)}
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <Button variant="ghost" size="sm" className="text-primary group-hover:underline">
              View Details <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export function CryptoCardSkeleton() {
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
          <div>
            <div className="h-5 w-24 bg-muted animate-pulse rounded-md mb-1" />
            <div className="h-4 w-12 bg-muted animate-pulse rounded-md" />
          </div>
        </div>
        <div className="h-8 w-8 bg-muted animate-pulse rounded-md" />
      </CardHeader>
      <CardContent>
        <div className="h-8 w-32 bg-muted animate-pulse rounded-md mb-1" />
        <div className="h-4 w-16 bg-muted animate-pulse rounded-md mb-2" />
        <div className="h-4 w-28 bg-muted animate-pulse rounded-md" />
        <div className="mt-4 flex justify-end">
           <div className="h-8 w-24 bg-muted animate-pulse rounded-md" />
        </div>
      </CardContent>
    </Card>
  );
}
