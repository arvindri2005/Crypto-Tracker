
"use client";

import { useState, useEffect, useCallback } from "react";
import type { CoinMarket } from "@/types/coingecko";
import { getCoinsMarkets } from "@/lib/coingecko"; // To fetch initial data

const WATCHLIST_STORAGE_KEY = "cryptoTrackWatchlist";

// Module-level store
let globalWatchlistIdsState: string[] = [];
let globalWatchlistCoinDataState: CoinMarket[] = [];
let globalIsLoadedFromStorageState = false; // Tracks if IDs are loaded from localStorage
let globalIsFetchingInitialDataState = false;
let globalFetchInitialErrorState: Error | null = null;
let initialDataFetched = false; // Ensure initial fetch only happens once per session

const stateUpdateListeners: Set<() => void> = new Set();

const dispatchStateUpdate = () => {
  stateUpdateListeners.forEach(listener => listener());
};

// Function to initialize and fetch data based on localStorage
const initializeWatchlistData = async () => {
  if (initialDataFetched || typeof window === 'undefined') return;
  initialDataFetched = true; // Mark that we've started this process

  try {
    const storedWatchlistIds = localStorage.getItem(WATCHLIST_STORAGE_KEY);
    if (storedWatchlistIds) {
      globalWatchlistIdsState = JSON.parse(storedWatchlistIds);
    }
  } catch (error) {
    console.error("Failed to load watchlist IDs from localStorage on module init:", error);
    globalWatchlistIdsState = [];
  }
  globalIsLoadedFromStorageState = true; // IDs loaded (or failed to load)

  if (globalWatchlistIdsState.length > 0) {
    globalIsFetchingInitialDataState = true;
    dispatchStateUpdate(); // Notify about loading state change

    try {
      const data = await getCoinsMarkets(globalWatchlistIdsState);
      globalWatchlistCoinDataState = data;
      globalFetchInitialErrorState = null;
    } catch (err) {
      console.error("Failed to fetch initial watchlist coin data:", err);
      globalFetchInitialErrorState = err instanceof Error ? err : new Error(String(err));
      globalWatchlistCoinDataState = []; // Clear data on error
    } finally {
      globalIsFetchingInitialDataState = false;
      dispatchStateUpdate(); // Notify about data load completion/error
    }
  } else {
    // No IDs in localStorage, so no initial fetch needed.
    // Ensure loading state is false if it was somehow true.
    globalIsFetchingInitialDataState = false; 
    dispatchStateUpdate();
  }
};

// Call initialization when the module loads client-side
if (typeof window !== 'undefined') {
    initializeWatchlistData();
}


export function useWatchlist() {
  const [watchlistIds, setLocalWatchlistIds] = useState<string[]>(globalWatchlistIdsState);
  const [watchlistCoinData, setLocalWatchlistCoinData] = useState<CoinMarket[]>(globalWatchlistCoinDataState);
  const [isLoadedFromStorage, setLocalIsLoadedFromStorage] = useState<boolean>(globalIsLoadedFromStorageState);
  const [isFetchingInitialData, setLocalIsFetchingInitialData] = useState<boolean>(globalIsFetchingInitialDataState);
  const [fetchInitialError, setLocalFetchInitialError] = useState<Error | null>(globalFetchInitialErrorState);

  useEffect(() => {
    const rerenderThisInstance = () => {
      setLocalWatchlistIds(globalWatchlistIdsState);
      setLocalWatchlistCoinData(globalWatchlistCoinDataState);
      setLocalIsLoadedFromStorage(globalIsLoadedFromStorageState);
      setLocalIsFetchingInitialData(globalIsFetchingInitialDataState);
      setLocalFetchInitialError(globalFetchInitialErrorState);
    };

    stateUpdateListeners.add(rerenderThisInstance);
    rerenderThisInstance(); // Initial sync for this instance

    return () => {
      stateUpdateListeners.delete(rerenderThisInstance);
    };
  }, []);

  const addToWatchlist = useCallback((coinId: string, coinData?: CoinMarket) => {
    if (!globalWatchlistIdsState.includes(coinId)) {
      const newWatchlistIds = [...globalWatchlistIdsState, coinId];
      globalWatchlistIdsState = newWatchlistIds;

      if (coinData) {
        const newCoinData = [...globalWatchlistCoinDataState, coinData];
        globalWatchlistCoinDataState = newCoinData;
      }
      // If coinData is not provided, it won't appear in the detailed list until a refresh/refetch.
      // This adheres to "use the last fetch data".

      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(globalWatchlistIdsState));
        } catch (error) {
          console.error("Failed to save watchlist IDs to localStorage:", error);
        }
      }
      dispatchStateUpdate();
    }
  }, []);

  const removeFromWatchlist = useCallback((coinId: string) => {
    const newWatchlistIds = globalWatchlistIdsState.filter((id) => id !== coinId);
    const newCoinData = globalWatchlistCoinDataState.filter((coin) => coin.id !== coinId);

    if (newWatchlistIds.length !== globalWatchlistIdsState.length) {
      globalWatchlistIdsState = newWatchlistIds;
      globalWatchlistCoinDataState = newCoinData;

      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(globalWatchlistIdsState));
        } catch (error) {
          console.error("Failed to save watchlist IDs to localStorage:", error);
        }
      }
      dispatchStateUpdate();
    }
  }, []);

  const isInWatchlist = useCallback((coinId: string) => {
    return globalWatchlistIdsState.includes(coinId);
  }, []);

  return {
    watchlistIds, // primarily for checking if an ID is in watchlist
    watchlistCoinData, // the actual data to display
    addToWatchlist,
    removeFromWatchlist,
    isInWatchlist,
    isLoaded: isLoadedFromStorage, // Renamed for clarity: means IDs are loaded from storage
    isLoadingData: isFetchingInitialData, // For the initial data fetch
    error: fetchInitialError, // Error from initial data fetch
  };
}
