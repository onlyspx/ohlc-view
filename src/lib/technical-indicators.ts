import { SPXData } from '@/types/spx';

// Simple Moving Average (SMA)
export function calculateSMA(data: SPXData[], period: number): number | null {
  if (data.length < period) return null;
  
  const recentData = data.slice(0, period);
  const sum = recentData.reduce((acc, item) => acc + item.close, 0);
  return Math.round((sum / period) * 100) / 100;
}

// Exponential Moving Average (EMA)
export function calculateEMA(data: SPXData[], period: number): number | null {
  if (data.length < period) return null;
  
  // Start with SMA for the first period
  const sma = calculateSMA(data, period);
  if (sma === null) return null;
  
  const multiplier = 2 / (period + 1);
  let ema = sma;
  
  // Calculate EMA for remaining data points
  for (let i = period; i < data.length; i++) {
    ema = (data[i].close * multiplier) + (ema * (1 - multiplier));
  }
  
  return Math.round(ema * 100) / 100;
}

// Calculate all technical indicators for the current data
export function calculateAllIndicators(data: SPXData[]) {
  return {
    sma5: calculateSMA(data, 5),
    ema8: calculateEMA(data, 8),
    sma10: calculateSMA(data, 10),
    sma20: calculateSMA(data, 20),
    ema21: calculateEMA(data, 21),
    sma50: calculateSMA(data, 50),
    sma100: calculateSMA(data, 100),
    sma200: calculateSMA(data, 200)
  };
}
