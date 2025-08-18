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
  
  // Sort data chronologically (oldest first) for proper EMA calculation
  const chronologicalData = [...data].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  
  // Calculate initial SMA from the first 'period' days
  const initialSMA = chronologicalData.slice(0, period).reduce((sum, item) => sum + item.close, 0) / period;
  
  const multiplier = 2 / (period + 1);
  let ema = initialSMA;
  
  // Calculate EMA for remaining data points (starting from period + 1)
  for (let i = period; i < chronologicalData.length; i++) {
    ema = (chronologicalData[i].close * multiplier) + (ema * (1 - multiplier));
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
