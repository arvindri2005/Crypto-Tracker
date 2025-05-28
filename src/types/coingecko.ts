
export type PricePoint = [number, number]; // [timestamp, price]

export interface CoinMarket {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  fully_diluted_valuation: number | null;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  market_cap_change_24h: number;
  market_cap_change_percentage_24h: number;
  circulating_supply: number;
  total_supply: number | null;
  max_supply: number | null;
  ath: number;
  ath_change_percentage: number;
  ath_date: string;
  atl: number;
  atl_change_percentage: number;
  atl_date: string;
  roi: {
    times: number;
    currency: string;
    percentage: number;
  } | null;
  last_updated: string;
}

export interface CoinDetails {
  id: string;
  symbol: string;
  name: string;
  image: {
    thumb: string;
    small: string;
    large: string;
  };
  description: {
    en: string;
  };
  market_data: {
    current_price: { [currency: string]: number };
    price_change_percentage_24h_in_currency: { [currency: string]: number };
    total_volume: { [currency: string]: number };
    market_cap: { [currency: string]: number };
    circulating_supply: number;
    total_supply: number | null;
    max_supply: number | null;
    high_24h: { [currency: string]: number };
    low_24h: { [currency: string]: number };
  };
  links: {
    homepage: string[];
    blockchain_site: string[];
    official_forum_url: string[];
    chat_url: string[];
    announcement_url: string[];
    twitter_screen_name?: string;
    facebook_username?: string;
    subreddit_url?: string;
  };
}

export interface CoinSearchItem {
  id: string;
  name: string;
  api_symbol: string;
  symbol: string;
  market_cap_rank: number | null;
  thumb: string;
  large: string;
}
export interface CoinSearchResult {
  coins: CoinSearchItem[];
}

export interface TrendingCoinItem {
  item: {
    id: string;
    coin_id: number;
    name: string;
    symbol: string;
    market_cap_rank: number;
    thumb: string;
    small: string;
    large: string;
    slug: string;
    price_btc: number;
    score: number;
  };
}

export interface TrendingResult {
  coins: TrendingCoinItem[];
  exchanges: any[];
}

export interface CoinMarketChartData {
  prices: PricePoint[];
  market_caps: PricePoint[];
  total_volumes: PricePoint[];
}
