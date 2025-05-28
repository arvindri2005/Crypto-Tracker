
"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { getCoinDetails, getCoinMarketChart } from "@/lib/coingecko";
import type { CoinDetails, CoinMarketChartData } from "@/types/coingecko";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Star, StarOff, ExternalLink, AlertTriangle, ArrowLeft, LineChart, Info, MessageSquare, Twitter, Facebook, Home } from "lucide-react";
import { useWatchlist } from "@/hooks/use-watchlist";
import { formatCurrency, formatPercentage, formatMarketCap } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import Link from "next/link";
import type { SVGProps } from "react";
import React, { useState, useCallback, useMemo } from "react";
import TradingViewChart, { type TradingViewChartDataPoint } from "@/components/crypto/tradingview-chart";
import { Loader2 } from "lucide-react";


// Inline SVG for Reddit icon as it's not in lucide-react
const RedditIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    role="img"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    fill="currentColor"
    {...props}
  >
    <title>Reddit</title>
    <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.34.34 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.248 0-.688-.561-1.25-1.248-1.25zm5.5 0c-.687 0-1.25.562-1.25 1.25 0 .687.563 1.248 1.25 1.248.688 0 1.249-.561 1.249-1.248 0-.688-.561-1.25-1.249-1.25zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.327.327 0 0 0-.462-.026c-.595.557-1.993.67-2.528.67-.534 0-1.932-.113-2.527-.67a.326.326 0 0 0-.232-.068z"/>
  </svg>
);

const timeRanges = [
  { label: "1D", days: 1 },
  { label: "7D", days: 7 },
  { label: "1M", days: 30 },
  { label: "3M", days: 90 },
  { label: "1Y", days: 365 },
  { label: "Max", days: 'max' as const }, // Use 'max' as const for type safety
];


export default function CryptoDetailPage() {
  const params = useParams();
  const coinId = params.id as string;
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist();
  const [chartDays, setChartDays] = useState<number | 'max'>(7);

  const handleTimeRangeChange = useCallback((days: number | 'max') => {
    setChartDays(days);
  }, [setChartDays]);

  const { data: coin, isLoading: coinLoading, error: coinError } = useQuery<CoinDetails, Error>({
    queryKey: ["coinDetails", coinId],
    queryFn: () => getCoinDetails(coinId),
    enabled: !!coinId,
  });

  const { data: marketChartData, isLoading: chartLoading, error: chartError } = useQuery<CoinMarketChartData, Error>({
    queryKey: ["marketChart", coinId, chartDays],
    queryFn: () => getCoinMarketChart(coinId, chartDays),
    enabled: !!coinId,
  });
  
  const tradingViewData = useMemo((): TradingViewChartDataPoint[] => {
    if (!marketChartData || !marketChartData.prices) return [];
    return marketChartData.prices.map(p => ({
      time: p[0] / 1000, // Convert ms to seconds for Lightweight Charts
      value: p[1],
    }));
  }, [marketChartData]);


  if (coinLoading) {
    return <CryptoDetailSkeleton />;
  }

  if (coinError) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error loading cryptocurrency data</AlertTitle>
          <AlertDescription>
            {coinError?.message || "Could not fetch data for this coin."}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!coin) {
    return (
       <div className="container mx-auto py-8">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Coin Not Found</AlertTitle>
          <AlertDescription>The requested cryptocurrency could not be found.</AlertDescription>
        </Alert>
      </div>
    );
  }

  const isWatched = isInWatchlist(coin.id);
  const currentPrice = coin.market_data.current_price.usd;
  const priceChange24h = coin.market_data.price_change_percentage_24h_in_currency.usd;
  
  const renderLinks = () => {
    const links = [];
    if (coin.links.homepage?.[0]) links.push({ icon: Home, url: coin.links.homepage[0], label: "Homepage" });
    if (coin.links.twitter_screen_name) links.push({ icon: Twitter, url: `https://twitter.com/${coin.links.twitter_screen_name}`, label: "Twitter" });
    if (coin.links.facebook_username) links.push({ icon: Facebook, url: `https://facebook.com/${coin.links.facebook_username}`, label: "Facebook" });
    if (coin.links.subreddit_url) links.push({ icon: RedditIcon, url: coin.links.subreddit_url, label: "Reddit" });
    if (coin.links.official_forum_url?.[0]) links.push({ icon: MessageSquare, url: coin.links.official_forum_url[0], label: "Forum" });
    
    const prioritizedLinks = links.sort((a,b) => {
        const order = ['Homepage', 'Twitter', 'Reddit'];
        return order.indexOf(a.label) - order.indexOf(b.label);
    }).slice(0,3);

    return (
        <div className="flex flex-wrap gap-2">
            {prioritizedLinks.map(link => (
                <Button key={link.label} variant="outline" size="sm" asChild>
                    <a href={link.url} target="_blank" rel="noopener noreferrer">
                        <link.icon className="mr-2 h-4 w-4" /> {link.label}
                    </a>
                </Button>
            ))}
        </div>
    )
  }

  return (
    <div className="space-y-8">
      <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Dashboard
      </Link>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center space-x-4">
              <Image src={coin.image.large} alt={coin.name} width={64} height={64} className="rounded-full"/>
              <div>
                <CardTitle className="text-2xl sm:text-3xl font-bold">{coin.name} ({coin.symbol.toUpperCase()})</CardTitle>
                <div className="text-2xl sm:text-3xl font-bold mt-1">{formatCurrency(currentPrice)}</div>
                <p
                  className={cn(
                    "text-lg font-semibold",
                    priceChange24h >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                  )}
                >
                  {formatPercentage(priceChange24h)} (24h)
                </p>
              </div>
            </div>
            <Button
              onClick={() => isWatched ? removeFromWatchlist(coin.id) : addToWatchlist(coin.id)}
              variant={isWatched ? "secondary" : "default"}
              size="lg"
              className="w-full sm:w-auto"
            >
              {isWatched ? <StarOff className="mr-2 h-5 w-5" /> : <Star className="mr-2 h-5 w-5" />}
              {isWatched ? "Remove from Watchlist" : "Add to Watchlist"}
            </Button>
          </div>
        </CardHeader>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
          <CardTitle className="text-xl sm:text-2xl">{coin.name} Price Chart</CardTitle>
          <div className="flex flex-wrap justify-start gap-1 sm:justify-end">
            {timeRanges.map((range) => (
              <Button
                key={range.label}
                variant={chartDays === range.days ? "default" : "outline"}
                size="sm"
                onClick={() => handleTimeRangeChange(range.days)}
              >
                {range.label}
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="p-0"> {/* Remove padding for chart to take full width */}
          {chartLoading && (
             <div className="flex h-[400px] items-center justify-center text-muted-foreground">
                <Loader2 className="mr-2 h-8 w-8 animate-spin text-primary" />
                Loading chart data...
            </div>
          )}
          {chartError && (
            <Alert variant="destructive" className="m-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error loading chart data</AlertTitle>
              <AlertDescription>{chartError.message}</AlertDescription>
            </Alert>
          )}
          {!chartLoading && !chartError && marketChartData && (
            <TradingViewChart data={tradingViewData} coinName={coin.name} height={400} />
          )}
           {!chartLoading && !chartError && (!marketChartData || marketChartData.prices.length === 0) && (
             <div className="flex h-[400px] items-center justify-center text-muted-foreground">
                No chart data available for the selected range.
            </div>
           )}
        </CardContent>
      </Card>

      <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-xl sm:text-2xl"><LineChart className="mr-2 h-5 w-5 text-primary" /> Market Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between"><span>Market Cap:</span> <span className="font-medium">{formatMarketCap(coin.market_data.market_cap.usd)}</span></div>
              <div className="flex justify-between"><span>24h Volume:</span> <span className="font-medium">{formatCurrency(coin.market_data.total_volume.usd)}</span></div>
              <div className="flex justify-between"><span>Circulating Supply:</span> <span className="font-medium">{coin.market_data.circulating_supply?.toLocaleString() || 'N/A'} {coin.symbol.toUpperCase()}</span></div>
              {coin.market_data.total_supply && <div className="flex justify-between"><span>Total Supply:</span> <span className="font-medium">{coin.market_data.total_supply.toLocaleString()} {coin.symbol.toUpperCase()}</span></div>}
              {coin.market_data.max_supply && <div className="flex justify-between"><span>Max Supply:</span> <span className="font-medium">{coin.market_data.max_supply.toLocaleString()} {coin.symbol.toUpperCase()}</span></div>}
              <div className="flex justify-between"><span>24h High:</span> <span className="font-medium">{formatCurrency(coin.market_data.high_24h.usd)}</span></div>
              <div className="flex justify-between"><span>24h Low:</span> <span className="font-medium">{formatCurrency(coin.market_data.low_24h.usd)}</span></div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
                <CardTitle className="flex items-center text-xl sm:text-2xl"><Info className="mr-2 h-5 w-5 text-primary" /> About {coin.name}</CardTitle>
            </CardHeader>
            <CardContent>
                {coin.description?.en ? (
                     <div className="text-sm text-muted-foreground leading-relaxed max-h-48 overflow-y-auto" dangerouslySetInnerHTML={{ __html: sanitizeDescription(coin.description.en.split(". ").slice(0,3).join(". ") + (coin.description.en.split(". ").length > 3 ? "..." : "")) }} />
                ) : (
                    <p className="text-sm text-muted-foreground">No description available.</p>
                )}
                <div className="mt-4">
                    {renderLinks()}
                </div>
            </CardContent>
          </Card>
      </div>
    </div>
  );
}

function sanitizeDescription(htmlString: string): string {
  const SCRIPT_REGEX = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
  let sanitized = htmlString.replace(SCRIPT_REGEX, "");
  
  const ALLOWED_TAGS_REGEX = /<\/?(a|p|br|strong|em|ul|li|b|i)\b[^>]*>/gi;
  const DISALLOWED_ATTR_REGEX = /\s(on\w+|style|class)(="[^"]*"|\s)/gi;

  sanitized = sanitized.replace(ALLOWED_TAGS_REGEX, (match) => {
    if (match.startsWith("<a")) {
      const hrefMatch = match.match(/href="([^"]*)"/);
      if (hrefMatch) {
        return `<a href="${hrefMatch[1]}" target="_blank" rel="noopener noreferrer">`;
      }
      return ''; 
    }
    return match.replace(DISALLOWED_ATTR_REGEX, ' ');
  });
  
  return sanitized;
}

function CryptoDetailSkeleton() {
  return (
    <div className="space-y-8">
      <Skeleton className="h-6 w-40" /> {/* Back link */}
      
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-16 w-16 rounded-full" />
              <div>
                <Skeleton className="h-9 w-48 mb-2" /> {/* Responsive: sm:h-9, base: h-8? */}
                <Skeleton className="h-8 w-32 mb-1" /> {/* Responsive: sm:h-8, base: h-7? */}
                <Skeleton className="h-6 w-24" />
              </div>
            </div>
            <Skeleton className="h-12 w-full sm:w-48 rounded-md" /> {/* Watchlist button */}
          </div>
        </CardHeader>
      </Card>

      <Card> {/* Chart Skeleton */}
        <CardHeader className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
            <Skeleton className="h-6 w-32 sm:w-40" /> {/* Chart Title - Responsive */}
            <div className="flex flex-wrap justify-start gap-1 sm:justify-end"> {/* Responsive button container */}
                {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-9 w-10 rounded-md" />)} {/* Time Range Buttons */}
            </div>
        </CardHeader>
        <CardContent className="p-0">
            <Skeleton className="h-[400px] w-full" /> {/* Chart Area */}
        </CardContent>
      </Card>
      
      <div className="space-y-6">
          <Card> 
            <CardHeader>
              <Skeleton className="h-6 w-32 sm:w-40" /> {/* Stats Title - Responsive */}
            </CardHeader>
            <CardContent className="space-y-3">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-5 w-full rounded-md" />)}
            </CardContent>
          </Card>
          <Card> 
            <CardHeader>
              <Skeleton className="h-6 w-36 sm:w-48" /> {/* About Title - Responsive */}
            </CardHeader>
            <CardContent>
              <Skeleton className="h-16 w-full rounded-md mb-4" />
              <div className="flex flex-wrap gap-2">
                {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-8 w-24 rounded-md" />)}
              </div>
            </CardContent>
          </Card>
      </div>
    </div>
  );
}
