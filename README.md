
# CryptoTrack - Cryptocurrency Tracking Application

CryptoTrack is a web application built with Next.js that allows users to track cryptocurrency prices, view detailed information, analyze historical trends, and manage a personal watchlist.

## Features

*   **Dashboard Homepage:** Displays a list of top cryptocurrencies by market capitalization.
*   **Cryptocurrency Search:** Users can search for specific cryptocurrencies.
*   **Detailed Crypto View:**
    *   Displays comprehensive information for a selected cryptocurrency, including current price, market cap, 24-hour volume, price change, circulating supply, total supply, max supply, and 24-hour high/low.
    *   Interactive historical price chart powered by TradingView Lightweight Charts, with selectable time ranges (1D, 7D, 1M, 3M, 1Y, Max).
    *   Displays relevant links (homepage, Twitter, Facebook, Reddit, official forum).
*   **Watchlist Management:**
    *   Users can add or remove cryptocurrencies from their personal watchlist.
    *   The watchlist is persisted in the browser's `localStorage`.
    *   The sidebar displays the user's watchlist with current prices and 24-hour changes, updating when coins are added or removed.
*   **Responsive Design:** The user interface is designed to be responsive and adapt to various screen sizes, from mobile to desktop.
*   **Theme Customization:** Supports Light, Dark, and System themes, allowing users to choose their preferred visual mode.
*   **Modern Tech Stack:**
    *   Next.js (App Router)
    *   React
    *   TypeScript
    *   ShadCN UI components
    *   Tailwind CSS
    *   TanStack Query (React Query) for data fetching and caching
    *   TradingView Lightweight Charts for price history visualization

## Project Structure

*   `src/app/`: Contains the Next.js App Router pages and layouts.
    *   `page.tsx`: Homepage.
    *   `search/page.tsx`: Search page.
    *   `crypto/[id]/page.tsx`: Cryptocurrency detail page.
    *   `layout.tsx`: Root layout for the application.
*   `src/components/`: Contains reusable React components.
    *   `ui/`: ShadCN UI components.
    *   `crypto/`: Components specific to cryptocurrency display (cards, search, charts).
    *   `layout/`: Layout components like Header and Sidebar.
*   `src/hooks/`: Custom React hooks (e.g., `useWatchlist`, `useDebounce`).
*   `src/lib/`: Utility functions and library configurations.
    *   `coingecko.ts`: Functions for interacting with the CoinGecko API.
    *   `formatters.ts`: Data formatting utilities.
    *   `utils.ts`: General utility functions (like `cn` for classnames).
*   `src/types/`: TypeScript type definitions, especially for API responses.
*   `public/`: Static assets.
*   `next.config.ts`: Next.js configuration.
*   `tailwind.config.ts`: Tailwind CSS configuration.
*   `components.json`: ShadCN UI configuration.

## Getting Started

Follow these instructions to set up and run the project locally.

### Prerequisites

*   Node.js (v18 or later recommended)
*   npm, yarn, or pnpm

### Setup

1.  **Clone the repository (if applicable):**
    ```bash
    git clone <repository-url>
    cd <project-directory>
    ```

2.  **Install dependencies:**
    Using npm:
    ```bash
    npm install
    ```
    Or using yarn:
    ```bash
    yarn install
    ```
    Or using pnpm:
    ```bash
    pnpm install
    ```

### Running the Development Server

To start the development server:

Using npm:
```bash
npm run dev
```
Or using yarn:
```bash
yarn dev
```
Or using pnpm:
```bash
pnpm dev
```
The application will usually be available at `http://localhost:9002` (or another port if 9002 is busy).

### Building for Production

To create a production build:

Using npm:
```bash
npm run build
```
Or using yarn:
```bash
yarn build
```
Or using pnpm:
```bash
pnpm build
```
This will create an optimized build in the `.next` directory.

### Starting the Production Server

After building, you can start the production server:

Using npm:
```bash
npm run start
```
Or using yarn:
```bash
yarn start
```
Or using pnpm:
```bash
pnpm start
```

## Linting and Type Checking

*   **Linting:**
    ```bash
    npm run lint
    ```
*   **Type Checking:**
    ```bash
    npm run typecheck
    ```

## Learn More

*   [Next.js Documentation](https://nextjs.org/docs)
*   [React Documentation](https://react.dev/)
*   [ShadCN UI](https://ui.shadcn.com/)
*   [Tailwind CSS](https://tailwindcss.com/docs)
*   [CoinGecko API](https://www.coingecko.com/en/api/documentation)
*   [TradingView Lightweight Charts](https://tradingview.github.io/lightweight-charts/)

---
