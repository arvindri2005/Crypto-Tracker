
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useWatchlist } from "@/hooks/use-watchlist";
import type { CoinMarket } from "@/types/coingecko";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent as UiSidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenuSkeleton,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Home, Search, Star, XCircle, Flame, AlertTriangle } from "lucide-react";
import Image from "next/image";
import { formatCurrency, formatPercentage } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";

const mainNav = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/search", label: "Search", icon: Search },
];

export function SidebarContent() {
  const pathname = usePathname();
  const { 
    watchlistCoinData, 
    removeFromWatchlist, 
    isLoaded, 
    isLoadingData, 
    error 
  } = useWatchlist();

  const initialIdCount = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem("cryptoTrackWatchlist") || "[]").length : 0;


  return (
    <Sidebar collapsible="icon" variant="sidebar" className="border-r">
      <SidebarHeader className="p-4">
        <Link href="/" className="flex items-center gap-2">
          <Flame className="h-7 w-7 text-primary" />
          <h1 className="text-xl font-semibold group-data-[collapsible=icon]:hidden">
            {siteConfig.name}
          </h1>
        </Link>
      </SidebarHeader>
      <UiSidebarContent>
        <SidebarMenu>
          {mainNav.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                className="w-full justify-start"
                isActive={pathname === item.href}
                tooltip={item.label}
              >
                <Link href={item.href}>
                  <item.icon className="h-5 w-5" />
                  <span className="group-data-[collapsible=icon]:hidden">
                    {item.label}
                  </span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>

        <SidebarGroup className="mt-4">
          <SidebarGroupLabel
            className="flex items-center group-data-[collapsible=icon]:justify-center"
            aria-label="Watchlist"
          >
            <Star className="h-4 w-4 mr-2 group-data-[collapsible=icon]:mr-0" />
            <span className="group-data-[collapsible=icon]:hidden">Watchlist</span>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <ScrollArea className="h-[calc(100vh-280px)] group-data-[collapsible=icon]:h-[calc(100vh-150px)]">
              {!isLoaded && ( 
                <div className="p-2 space-y-2">
                   {[...Array(3)].map((_, i) => ( 
                    <SidebarMenuSkeleton key={i} showIcon />
                  ))}
                </div>
              )}
              {isLoaded && isLoadingData && ( 
                 <div className="p-2 space-y-2">
                  {[...Array(Math.max(1, initialIdCount))].map((_, i) => (
                    <SidebarMenuSkeleton key={i} showIcon />
                  ))}
                </div>
              )}
              {isLoaded && error && (
                <div className="p-3 text-xs text-destructive-foreground bg-destructive/80 rounded-md m-2 group-data-[collapsible=icon]:hidden">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    <span className="font-medium">Error loading watchlist:</span>
                  </div>
                  <p className="mt-1 ml-6">{error.message}</p>
                </div>
              )}
              {isLoaded && !isLoadingData && !error && watchlistCoinData && watchlistCoinData.length > 0 && (
                <SidebarMenu>
                  {watchlistCoinData.map((coin) => (
                    <SidebarMenuItem key={coin.id} className="relative group/watchlist-item">
                      <SidebarMenuButton
                        asChild
                        className="w-full justify-start h-auto py-2 items-start group-data-[collapsible=icon]:items-center"
                        isActive={pathname === `/crypto/${coin.id}`}
                        tooltip={
                          <div className="text-left">
                            <div className="font-medium">{coin.name} ({coin.symbol.toUpperCase()})</div>
                            <div>{formatCurrency(coin.current_price)}</div>
                            <div className={cn(
                                "text-xs",
                                (coin.price_change_percentage_24h ?? 0) >= 0
                                  ? "text-green-500" 
                                  : "text-red-500"   
                              )}>
                              {formatPercentage(coin.price_change_percentage_24h)} (24h)
                            </div>
                          </div>
                        }
                      >
                        <Link href={`/crypto/${coin.id}`}>
                          <Image
                            src={coin.image}
                            alt={coin.name}
                            width={24}
                            height={24}
                            className="rounded-full group-data-[collapsible=icon]:mx-auto"
                          />
                          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
                            <span className="font-medium">{coin.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {formatCurrency(coin.current_price)}
                            </span>
                             <span className={cn(
                                "text-xs",
                                (coin.price_change_percentage_24h ?? 0) >= 0
                                  ? "text-green-600 dark:text-green-400"
                                  : "text-red-600 dark:text-red-400"
                              )}>
                              {formatPercentage(coin.price_change_percentage_24h)}
                            </span>
                          </div>
                        </Link>
                      </SidebarMenuButton>
                       <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-1/2 right-1 -translate-y-1/2 h-7 w-7 opacity-0 group-hover/watchlist-item:opacity-100 group-data-[collapsible=icon]:hidden"
                          onClick={(e) => {
                            e.stopPropagation(); 
                            removeFromWatchlist(coin.id);
                          }}
                          aria-label={`Remove ${coin.name} from watchlist`}
                        >
                          <XCircle className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                        </Button>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              )}
              {isLoaded && !isLoadingData && !error && (!watchlistCoinData || watchlistCoinData.length === 0) && (
                 <div className="p-4 text-center text-sm text-muted-foreground group-data-[collapsible=icon]:hidden">
                  {initialIdCount > 0 && watchlistCoinData.length === 0 ? "Loading watchlist data..." : "Your watchlist is empty. Add coins to track them here."}
                </div>
              )}
            </ScrollArea>
          </SidebarGroupContent>
        </SidebarGroup>
      </UiSidebarContent>
    </Sidebar>
  );
}
