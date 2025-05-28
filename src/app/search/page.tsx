"use client";

import { CryptoSearch } from "@/components/crypto/crypto-search";
import { SearchIcon } from "lucide-react";

export default function SearchPage() {
  return (
    <div className="space-y-8">
      <section className="text-center">
        <h1 className="text-3xl font-bold tracking-tight lg:text-4xl mb-4 flex items-center justify-center">
           <SearchIcon className="mr-3 h-8 w-8 text-primary" /> Search Cryptocurrencies
        </h1>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto">
          Find your favorite cryptocurrencies and add them to your watchlist.
        </p>
      </section>

      <section className="max-w-2xl mx-auto">
        <CryptoSearch />
      </section>
      
      {/* This space can be used to show popular searches or categories in the future */}
      <section className="mt-12">
        {/* Placeholder for additional content, e.g., trending searches */}
      </section>
    </div>
  );
}
