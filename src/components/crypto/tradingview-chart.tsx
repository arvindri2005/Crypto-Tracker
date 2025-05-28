
"use client";

import type { SVGProps } from "react";
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createChart, type IChartApi, type ISeriesApi, ColorType, LineStyle, CrosshairMode } from 'lightweight-charts';
import { formatCurrency } from '@/lib/formatters'; // For tooltip formatting

export interface TradingViewChartDataPoint {
  time: number; // UNIX timestamp in seconds
  value: number;
}

interface TradingViewChartProps {
  data: TradingViewChartDataPoint[];
  coinName: string;
  height?: number;
  backgroundColor?: string;
  lineColor?: string;
  topColor?: string;
  bottomColor?: string;
  textColor?: string;
  gridColor?: string;
}

const TradingViewChart: React.FC<TradingViewChartProps> = ({
  data,
  coinName,
  height = 400,
  backgroundColor = '#FFFFFF',
  lineColor = '#2962FF',
  topColor = 'rgba(41, 98, 255, 0.4)',
  bottomColor = 'rgba(41, 98, 255, 0.0)',
  textColor = '#333333',
  gridColor = '#E0E0E0',
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Area'> | null>(null);
  const [isLoading, setIsLoading] = useState(true);


  useEffect(() => {
    if (!chartContainerRef.current || data.length === 0) {
      setIsLoading(data.length === 0);
      return;
    }
    setIsLoading(false);

    if (!chartRef.current) {
      const chart = createChart(chartContainerRef.current, {
        width: chartContainerRef.current.clientWidth,
        height: height,
        layout: {
          background: { type: ColorType.Solid, color: backgroundColor },
          textColor: textColor,
        },
        grid: {
          vertLines: { color: gridColor, style: LineStyle.Solid },
          horzLines: { color: gridColor, style: LineStyle.Solid },
        },
        crosshair: {
          mode: CrosshairMode.Normal,
        },
        timeScale: {
          borderColor: gridColor,
          timeVisible: true,
          secondsVisible: false,
        },
        rightPriceScale: {
          borderColor: gridColor,
        },
        localization: {
            priceFormatter: (price: number) => formatCurrency(price, 'usd', price < 1 ? 6 : 2),
        },
      });
      chartRef.current = chart;

      const areaSeries = chart.addAreaSeries({
        lineColor: lineColor,
        topColor: topColor,
        bottomColor: bottomColor,
        lineWidth: 2,
        priceLineVisible: false, // Hide the dotted price line
      });
      seriesRef.current = areaSeries;
    }

    seriesRef.current?.setData(data);
    chartRef.current?.timeScale().fitContent();

    // Handle resize
    const resizeObserver = new ResizeObserver(entries => {
      if (entries[0] && entries[0].contentRect && chartRef.current) {
        chartRef.current.applyOptions({ width: entries[0].contentRect.width });
      }
    });
    resizeObserver.observe(chartContainerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [data, height, backgroundColor, lineColor, topColor, bottomColor, textColor, gridColor]);

  // Update series data when `data` prop changes without recreating the chart
  useEffect(() => {
    if (seriesRef.current && data.length > 0) {
      seriesRef.current.setData(data);
      setIsLoading(false);
    } else if (data.length === 0) {
        setIsLoading(true);
         if (seriesRef.current) seriesRef.current.setData([]); // Clear chart if no data
    }
  }, [data]);


  return (
    <div ref={chartContainerRef} style={{ width: '100%', height: `${height}px`, position: 'relative' }}>
      {isLoading && (
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: textColor }}>
          Loading chart data...
        </div>
      )}
    </div>
  );
};

export default TradingViewChart;
