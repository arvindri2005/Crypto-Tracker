
import type { CoinDetails, CoinMarket, CoinSearchResult, TrendingResult, CoinMarketChartData } from "@/types/coingecko";

const API_BASE_URL = "https://api.coingecko.com/api/v3";

async function fetcher<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      "Accept": "application/json",
    },
  });
  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({ message: "Unknown error" }));
    console.error(`API Error (${response.status}) for endpoint ${endpoint}:`, errorBody);
    if (response.status === 429) {
      throw new Error(
        "Too many requests to CoinGecko API. Please try again in a few minutes."
      );
    }
    if (response.status === 401) {
      throw new Error(
        `CoinGecko API request failed with status 401: Unauthorized. The requested data (especially large ranges like 'max') may require an API key or is currently restricted.`
      );
    }
    throw new Error(
      `CoinGecko API request failed with status ${response.status}: ${errorBody.error || errorBody.message || "Failed to fetch data"}`
    );
  }
  return response.json();
}

export async function searchCoins(query: string): Promise<CoinSearchResult> {
  if (!query.trim()) {
    return { coins: [] };
  }
  return fetcher<CoinSearchResult>(`/search?query=${encodeURIComponent(query)}`);
}

export async function getCoinDetails(id: string): Promise<CoinDetails> {
  return fetcher<CoinDetails>(`/coins/${id}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`);
}

export async function getCoinsMarkets(coinIds: string[], currency: string = "usd"): Promise<CoinMarket[]> {
  if (coinIds.length === 0) {
    return [];
  }
  return fetcher<CoinMarket[]>(`/coins/markets?vs_currency=${currency}&ids=${coinIds.join(',')}&order=market_cap_desc&per_page=250&page=1&sparkline=false`);
}

export async function getTrendingCoins(): Promise<TrendingResult> {
  return fetcher<TrendingResult>("/search/trending");
}

export async function getTopCoins(perPage: number = 10, currency: string = "usd"): Promise<CoinMarket[]> {
    return fetcher<CoinMarket[]>(`/coins/markets?vs_currency=${currency}&order=market_cap_desc&per_page=${perPage}&page=1&sparkline=false`);
}

export async function getCoinMarketChart(coinId: string, days: number | 'max' = 7, currency: string = "usd"): Promise<CoinMarketChartData> {
  return fetcher<CoinMarketChartData>(`/coins/${coinId}/market_chart?vs_currency=${currency}&days=${days}`);
}

