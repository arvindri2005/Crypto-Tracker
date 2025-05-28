
"use client";

import { useState, useMemo, memo } from "react";
import { format, fromUnixTime } from "date-fns";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { PricePoint } from "@/types/coingecko";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip as ShadcnChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { formatCurrency } from "@/lib/formatters";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface PriceChartProps {
  data: PricePoint[] | undefined;
  coinName: string;
  onTimeRangeChange: (days: number | 'max') => void;
  initialDays: number;
}

const chartConfig = {
  price: {
    label: "Price",
    color: "hsl(var(--accent))",
  },
} satisfies ChartConfig;

const timeRanges = [
  { label: "1D", days: 1 },
  { label: "7D", days: 7 },
  { label: "1M", days: 30 },
  { label: "3M", days: 90 },
  { label: "1Y", days: 365 },
  { label: "All", days: 0 }, // Use 0 for "all" in local state, maps to 'max' for API
];

const MAX_DATA_POINTS_THRESHOLD = 400; // Universal threshold for downsampling

const PriceChartComponent = ({ data, coinName, onTimeRangeChange, initialDays }: PriceChartProps) => {
  const [activeRange, setActiveRange] = useState(initialDays);

  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    let processedData = data;
    // Universal downsampling: if data for the current range exceeds threshold
    if (data.length > MAX_DATA_POINTS_THRESHOLD) {
      const samplingFactor = Math.ceil(data.length / MAX_DATA_POINTS_THRESHOLD);
      processedData = data.filter((_, index) => index % samplingFactor === 0);
      
      // Ensure the last original point is included if it was filtered out and not already present
      if (data.length > 0 && (data.length - 1) % samplingFactor !== 0) {
          const lastOriginalPointTimestamp = data[data.length - 1][0];
          if (!processedData.find(p => p[0] === lastOriginalPointTimestamp)) {
              processedData.push(data[data.length - 1]);
          }
      }
    }

    return processedData.map(([timestamp, price]) => ({
      date: fromUnixTime(timestamp / 1000), // CoinGecko timestamps are in ms
      price: price,
    }));
  }, [data]); // Only depends on data now

  const handleRangeClick = (days: number) => {
    setActiveRange(days);
    onTimeRangeChange(days === 0 ? 'max' : days);
  };
  
  const yAxisDomain = useMemo(() => {
    if (chartData.length === 0) {
        return data && data.length > 0 ? ['auto', 'auto'] : [0,1];
    }
    const prices = chartData.map(d => d.price).filter(p => typeof p === 'number' && isFinite(p));
    if (prices.length === 0) return [0, 1];

    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    
    const buffer = (maxPrice - minPrice) * 0.05 || (maxPrice * 0.05) || 0.05;
    const lowerBound = Math.max(0, minPrice - buffer);
    const upperBound = maxPrice + buffer;
    
    if (minPrice === maxPrice) {
        return [Math.max(0, minPrice - (minPrice*0.1 || 0.1)), maxPrice + (maxPrice*0.1 || 0.1)];
    }

    return [lowerBound, upperBound];
  }, [chartData, data]); // data dependency added here for the [0,1] fallback condition


  return (
    <Card>
      <CardHeader className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
        <CardTitle>{coinName} Price Chart</CardTitle>
        <div className="flex gap-1">
          {timeRanges.map((range) => (
            <Button
              key={range.label}
              variant={activeRange === range.days ? "default" : "outline"}
              size="sm"
              onClick={() => handleRangeClick(range.days)}
            >
              {range.label}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="h-[400px] w-full p-0">
        {(!data || data.length === 0) && (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            No chart data available for the selected range.
          </div>
        )}
        {(data && data.length > 0 && chartData.length === 0) && (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Processing chart data...
          </div>
        )}
        {(data && data.length > 0 && chartData.length > 0) && (
          <ChartContainer config={chartConfig} className="h-full w-full">
            <ResponsiveContainer>
              <AreaChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <defs>
                  <linearGradient id="fillPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => {
                    if (!(value instanceof Date) || isNaN(value.getTime())) return '';
                    // Determine date format based on the selected activeRange (approximating data density)
                    const currentRangeDays = activeRange === 0 ? (data ? data.length / (24*60/5) : 365*2) : activeRange; // Approximation for "All"
                    if (currentRangeDays <= 1) return format(value, "HH:mm"); // Hourly for 1D
                    if (currentRangeDays <= 90) return format(value, "MMM d"); // Daily for up to 3M
                    return format(value, "MMM yy"); // Monthly for >3M
                  }}
                  minTickGap={activeRange > 30 || activeRange === 0 ? 30 : 10} 
                  className="text-xs fill-muted-foreground"
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => formatCurrency(value, 'usd', value < 1 ? 6 : 2)}
                  domain={yAxisDomain}
                  className="text-xs fill-muted-foreground"
                  orientation="left"
                  width={80} 
                />
                <Tooltip
                  cursor={{ stroke: "hsl(var(--border))", strokeWidth: 1 }}
                  content={
                    <ShadcnChartTooltip
                      cursor={false}
                      content={
                        <ChartTooltipContent
                          hideLabel
                          formatter={(value, name, item) => (
                            <div className="min-w-[150px]">
                              <div className="font-medium text-foreground">
                                {item.payload.date instanceof Date && !isNaN(item.payload.date.getTime()) 
                                  ? format(item.payload.date, "MMM d, yyyy HH:mm")
                                  : 'Invalid Date'}
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Price:</span>
                                <span className="font-medium text-foreground">
                                  {typeof item.payload.price === 'number' 
                                    ? formatCurrency(item.payload.price, 'usd', item.payload.price < 1 ? 6 : 2)
                                    : 'N/A'}
                                </span>
                              </div>
                            </div>
                          )}
                        />
                      }
                    />
                  }
                />
                <Area
                  dataKey="price"
                  type="monotone"
                  fill="url(#fillPrice)"
                  stroke="hsl(var(--accent))"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{
                    r: 6,
                    style: { fill: "hsl(var(--accent))", opacity: 0.75 },
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}

export const PriceChart = memo(PriceChartComponent);
