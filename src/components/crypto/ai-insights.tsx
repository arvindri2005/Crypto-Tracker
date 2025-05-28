
"use client";

import { useState, useEffect, useCallback } from "react";
import { generateCryptoInsights, type GenerateCryptoInsightsInput } from "@/ai/flows/generate-crypto-insights";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Wand2, AlertTriangle } from "lucide-react";
import type { PricePoint } from "@/types/coingecko";
import { formatCurrency, formatPercentage } from "@/lib/formatters";

interface AIInsightsProps {
  coinSymbol: string;
  coinName: string;
  priceData: PricePoint[] | undefined; // Array of [timestamp, price]
}

// Updated to accept coinSymbol as a parameter
function generatePriceMovementSummary(priceData: PricePoint[] | undefined, coinName: string, coinSymbol: string): string {
  if (!priceData || priceData.length < 2) {
    return `Not enough price data available for ${coinName} to generate a summary.`;
  }

  const firstPoint = priceData[0];
  const lastPoint = priceData[priceData.length - 1];
  const firstPrice = firstPoint[1];
  const lastPrice = lastPoint[1];

  const overallChange = ((lastPrice - firstPrice) / firstPrice) * 100;
  const changeDirection = overallChange >= 0 ? "increased" : "decreased";

  // Find min and max prices in the period
  let minPrice = firstPrice;
  let maxPrice = firstPrice;
  for (const point of priceData) {
    if (point[1] < minPrice) minPrice = point[1];
    if (point[1] > maxPrice) maxPrice = point[1];
  }

  return `${coinName} (${coinSymbol.toUpperCase()}) price has ${changeDirection} by ${formatPercentage(Math.abs(overallChange))} over the selected period.
The price ranged from ${formatCurrency(minPrice)} to ${formatCurrency(maxPrice)}.
Current price is ${formatCurrency(lastPrice)}.`;
}


export function AIInsights({ coinSymbol, coinName, priceData }: AIInsightsProps) {
  const [insight, setInsight] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const fetchInsights = useCallback(async () => {
    if (!priceData || priceData.length === 0) {
      setError("Price data is not available to generate insights.");
      // Clear previous insight if data becomes unavailable
      setInsight(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    setInsight(null);

    try {
      // Pass coinSymbol to the helper function
      const recentPriceMovements = generatePriceMovementSummary(priceData, coinName, coinSymbol);
      const input: GenerateCryptoInsightsInput = {
        cryptoSymbol: coinSymbol,
        recentPriceMovements,
      };
      const result = await generateCryptoInsights(input);
      setInsight(result.insight);
    } catch (err) {
      console.error("Error generating AI insights:", err);
      setError(err instanceof Error ? err.message : "Failed to generate insights. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [priceData, coinName, coinSymbol, setIsLoading, setError, setInsight]); // Added all stable dependencies

  // Automatically fetch insights when priceData changes or component mounts with data
  useEffect(() => {
    if (priceData && priceData.length > 0) {
      fetchInsights();
    } else {
      // If priceData becomes unavailable (e.g. user selects a range with no data), clear insights and errors.
      setInsight(null);
      setError(null); // Optionally clear error, or let user see previous error if desired.
    }
  }, [fetchInsights, priceData]); // Depend on memoized fetchInsights and priceData

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Wand2 className="h-6 w-6 text-primary" />
            <CardTitle>AI-Driven Insights for {coinName}</CardTitle>
          </div>
          <Button onClick={fetchInsights} disabled={isLoading || !priceData || priceData.length === 0} size="sm">
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Wand2 className="mr-2 h-4 w-4" />
            )}
            {isLoading ? "Generating..." : "Refresh Insights"}
          </Button>
        </div>
        <CardDescription>
          AI-powered analysis of recent price movements. This is not financial advice.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {isLoading && !error && (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-3 text-muted-foreground">Generating insights, please wait...</p>
          </div>
        )}
        {!isLoading && !error && insight && (
          <p className="text-sm leading-relaxed whitespace-pre-line">{insight}</p>
        )}
        {!isLoading && !error && !insight && (!priceData || priceData.length === 0) && (
          <p className="text-sm text-muted-foreground">
            Price data is currently unavailable. Insights cannot be generated. Select a time range with data.
          </p>
        )}
         {!isLoading && !error && !insight && priceData && priceData.length > 0 && (
          <p className="text-sm text-muted-foreground">
            Click &quot;Refresh Insights&quot; to generate analysis.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
