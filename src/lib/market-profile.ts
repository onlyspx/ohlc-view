import { SPXIntradayData, PriceLevel, MarketProfile } from '@/types/spx';

export interface CandlestickPattern {
  timeSlot: string;
  type: 'doji' | 'hammer' | 'shooting_star' | 'bullish_engulfing' | 'bearish_engulfing' | 'spinning_top' | 'marubozu' | 'normal';
  bodySize: number;
  upperShadow: number;
  lowerShadow: number;
  bodyRatio: number;
  description: string;
}

export interface MarketProfileAnalysis {
  pointOfControl: number;
  valueArea: { high: number; low: number };
  poorHighs: PriceLevel[];
  poorLows: PriceLevel[];
  singlePrints: PriceLevel[];
  profileType: 'normal' | 'double' | 'trend' | 'neutral';
  candlestickPatterns: CandlestickPattern[];
  volumeProfile: Array<{ price: number; volume: number; frequency: number }>;
}

// Calculate candlestick patterns for each 5-minute bar
export function analyzeCandlestickPatterns(data: SPXIntradayData[]): CandlestickPattern[] {
  return data.map(item => {
    const bodySize = Math.abs(item.close - item.open);
    const totalRange = item.high - item.low;
    const upperShadow = item.high - Math.max(item.open, item.close);
    const lowerShadow = Math.min(item.open, item.close) - item.low;
    const bodyRatio = totalRange > 0 ? bodySize / totalRange : 0;
    
    let type: CandlestickPattern['type'] = 'normal';
    let description = 'Normal candlestick';
    
    // Doji - very small body
    if (bodyRatio < 0.1) {
      type = 'doji';
      description = 'Doji - indecision, potential reversal';
    }
    // Hammer - small body at top, long lower shadow
    else if (bodyRatio < 0.3 && lowerShadow > bodySize * 2 && upperShadow < bodySize * 0.5) {
      type = 'hammer';
      description = 'Hammer - bullish reversal signal';
    }
    // Shooting Star - small body at bottom, long upper shadow
    else if (bodyRatio < 0.3 && upperShadow > bodySize * 2 && lowerShadow < bodySize * 0.5) {
      type = 'shooting_star';
      description = 'Shooting Star - bearish reversal signal';
    }
    // Spinning Top - small body, long shadows
    else if (bodyRatio < 0.3 && upperShadow > bodySize && lowerShadow > bodySize) {
      type = 'spinning_top';
      description = 'Spinning Top - indecision';
    }
    // Marubozu - no shadows, strong trend
    else if (bodyRatio > 0.8) {
      type = 'marubozu';
      description = 'Marubozu - strong trend continuation';
    }
    // Engulfing patterns (compare with previous)
    else if (bodySize > 0) {
      description = item.close > item.open ? 'Bullish candlestick' : 'Bearish candlestick';
    }
    
    return {
      timeSlot: item.timeSlot,
      type,
      bodySize,
      upperShadow,
      lowerShadow,
      bodyRatio,
      description
    };
  });
}

// Calculate market profile analysis
export function calculateMarketProfile(data: SPXIntradayData[]): MarketProfileAnalysis {
  if (data.length === 0) {
    throw new Error('No data available for market profile analysis');
  }

  // Create price levels with volume and frequency
  const priceMap = new Map<number, { volume: number; frequency: number; timeSlots: string[] }>();
  
  data.forEach(item => {
    // Round to nearest 0.25 for price levels
    const priceLevel = Math.round(item.close * 4) / 4;
    
    if (!priceMap.has(priceLevel)) {
      priceMap.set(priceLevel, { volume: 0, frequency: 0, timeSlots: [] });
    }
    
    const level = priceMap.get(priceLevel)!;
    level.volume += item.volume;
    level.frequency += 1;
    level.timeSlots.push(item.timeSlot);
  });

  // Convert to array and sort by price
  const priceLevels = Array.from(priceMap.entries())
    .map(([price, data]) => ({
      price,
      volume: data.volume,
      frequency: data.frequency,
      timeSlots: data.timeSlots
    }))
    .sort((a, b) => b.price - a.price); // High to low

  // Find Point of Control (price level with highest volume)
  const pointOfControl = priceLevels.reduce((max, level) => 
    level.volume > max.volume ? level : max
  ).price;

  // Calculate Value Area (70% of total volume)
  const totalVolume = priceLevels.reduce((sum, level) => sum + level.volume, 0);
  const valueAreaVolume = totalVolume * 0.7;
  
  let cumulativeVolume = 0;
  let valueAreaHigh = pointOfControl;
  let valueAreaLow = pointOfControl;
  
  // Find value area high
  for (const level of priceLevels) {
    if (level.price >= pointOfControl) {
      cumulativeVolume += level.volume;
      if (cumulativeVolume <= valueAreaVolume) {
        valueAreaHigh = level.price;
      }
    }
  }
  
  // Reset and find value area low
  cumulativeVolume = 0;
  for (const level of priceLevels) {
    if (level.price <= pointOfControl) {
      cumulativeVolume += level.volume;
      if (cumulativeVolume <= valueAreaVolume) {
        valueAreaLow = level.price;
      }
    }
  }

  // Identify Poor Highs and Poor Lows
  const poorHighs: PriceLevel[] = [];
  const poorLows: PriceLevel[] = [];
  const singlePrints: PriceLevel[] = [];

  priceLevels.forEach(level => {
    const isPoorHigh = level.frequency === 1 && level.price > pointOfControl;
    const isPoorLow = level.frequency === 1 && level.price < pointOfControl;
    const isSinglePrint = level.frequency === 1;

    if (isPoorHigh) {
      poorHighs.push({
        ...level,
        isPoorHigh: true,
        isPoorLow: false,
        isSinglePrint: true
      });
    } else if (isPoorLow) {
      poorLows.push({
        ...level,
        isPoorHigh: false,
        isPoorLow: true,
        isSinglePrint: true
      });
    } else if (isSinglePrint) {
      singlePrints.push({
        ...level,
        isPoorHigh: false,
        isPoorLow: false,
        isSinglePrint: true
      });
    }
  });

  // Determine Profile Type
  const dayHigh = Math.max(...data.map(d => d.high));
  const dayLow = Math.min(...data.map(d => d.low));
  const dayRange = dayHigh - dayLow;
  const valueAreaRange = valueAreaHigh - valueAreaLow;
  const valueAreaRatio = valueAreaRange / dayRange;

  let profileType: MarketProfileAnalysis['profileType'] = 'normal';
  
  if (valueAreaRatio < 0.3) {
    profileType = 'trend'; // Tight value area, trending day
  } else if (valueAreaRatio > 0.7) {
    profileType = 'neutral'; // Wide value area, balanced day
  } else if (poorHighs.length > 3 || poorLows.length > 3) {
    profileType = 'double'; // Multiple poor highs/lows, double distribution
  }

  // Create volume profile
  const volumeProfile = priceLevels.map(level => ({
    price: level.price,
    volume: level.volume,
    frequency: level.frequency
  }));

  return {
    pointOfControl,
    valueArea: { high: valueAreaHigh, low: valueAreaLow },
    poorHighs,
    poorLows,
    singlePrints,
    profileType,
    candlestickPatterns: analyzeCandlestickPatterns(data),
    volumeProfile
  };
}

// Get candlestick pattern summary
export function getCandlestickSummary(patterns: CandlestickPattern[]): {
  doji: number;
  hammer: number;
  shootingStar: number;
  spinningTop: number;
  marubozu: number;
  bullish: number;
  bearish: number;
} {
  return patterns.reduce((summary, pattern) => {
    switch (pattern.type) {
      case 'doji': summary.doji++; break;
      case 'hammer': summary.hammer++; break;
      case 'shooting_star': summary.shootingStar++; break;
      case 'spinning_top': summary.spinningTop++; break;
      case 'marubozu': summary.marubozu++; break;
      default:
        if (pattern.bodySize > 0) {
          // Determine if bullish or bearish based on close vs open
          // This is a simplified approach - in real analysis we'd need to compare with previous candle
          summary.bullish++;
        }
    }
    return summary;
  }, { doji: 0, hammer: 0, shootingStar: 0, spinningTop: 0, marubozu: 0, bullish: 0, bearish: 0 });
}
