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

// Calculate True Range for a single day
export function calculateTrueRange(high: number, low: number, prevClose: number): number {
  const range1 = high - low; // Current day's range
  const range2 = Math.abs(high - prevClose); // Gap up or down
  const range3 = Math.abs(low - prevClose); // Gap up or down
  
  return Math.max(range1, range2, range3);
}

// Average True Range (ATR) - measures volatility
export function calculateATR(data: SPXData[], period: number = 14): number | null {
  if (data.length < period + 1) return null;
  
  // Sort chronologically (oldest first)
  const chronologicalData = [...data].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  
  // Calculate True Range for each day
  const trueRanges: number[] = [];
  for (let i = 1; i < chronologicalData.length; i++) {
    const current = chronologicalData[i];
    const previous = chronologicalData[i - 1];
    const tr = calculateTrueRange(current.high, current.low, previous.close);
    trueRanges.push(tr);
  }
  
  // Calculate ATR as simple average of last 'period' true ranges
  const recentTRs = trueRanges.slice(-period);
  const atr = recentTRs.reduce((sum, tr) => sum + tr, 0) / period;
  
  return Math.round(atr * 100) / 100;
}

// Average Daily Range (ADR) - average of daily ranges
export function calculateADR(data: SPXData[], period: number = 20): number | null {
  if (data.length < period) return null;
  
  // Sort chronologically (oldest first) and take the most recent 'period' days
  const chronologicalData = [...data].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  
  const recentData = chronologicalData.slice(-period); // Take last 'period' days
  const dailyRanges = recentData.map(day => day.high - day.low);
  const adr = dailyRanges.reduce((sum, range) => sum + range, 0) / period;
  
  return Math.round(adr * 100) / 100;
}

// Relative Strength Index (RSI) - momentum oscillator
export function calculateRSI(data: SPXData[], period: number = 14): number | null {
  if (data.length < period + 1) return null;
  
  // Sort chronologically (oldest first)
  const chronologicalData = [...data].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  
  const changes: number[] = [];
  for (let i = 1; i < chronologicalData.length; i++) {
    changes.push(chronologicalData[i].close - chronologicalData[i - 1].close);
  }
  
  const gains = changes.map(change => change > 0 ? change : 0);
  const losses = changes.map(change => change < 0 ? Math.abs(change) : 0);
  
  // Calculate average gain and loss
  const avgGain = gains.slice(-period).reduce((sum, gain) => sum + gain, 0) / period;
  const avgLoss = losses.slice(-period).reduce((sum, loss) => sum + loss, 0) / period;
  
  if (avgLoss === 0) return 100;
  
  const rs = avgGain / avgLoss;
  const rsi = 100 - (100 / (1 + rs));
  
  return Math.round(rsi * 100) / 100;
}

// Volume Simple Moving Average
export function calculateVolumeSMA(data: SPXData[], period: number = 20): number | null {
  if (data.length < period) return null;
  
  // Sort chronologically (oldest first) and take the most recent 'period' days
  const chronologicalData = [...data].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  
  const recentData = chronologicalData.slice(-period); // Take last 'period' days
  const volumes = recentData.map(day => day.volume || 0);
  const avgVolume = volumes.reduce((sum, volume) => sum + volume, 0) / period;
  
  return Math.round(avgVolume);
}

// Pivot Points calculation using previous day's data
export function calculatePivotPoints(data: SPXData[]): {
  pp: number | null;
  r1: number | null;
  r2: number | null;
  s1: number | null;
  s2: number | null;
} | null {
  if (data.length < 2) return null;
  
  // Sort chronologically (oldest first) and get previous day's data
  const chronologicalData = [...data].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  
  const prevDay = chronologicalData[chronologicalData.length - 2]; // Previous day
  const currentDay = chronologicalData[chronologicalData.length - 1]; // Current day
  
  if (!prevDay) return null;
  
  const prevHigh = prevDay.high;
  const prevLow = prevDay.low;
  const prevClose = prevDay.close;
  
  // Calculate Pivot Point
  const pp = (prevHigh + prevLow + prevClose) / 3;
  
  // Calculate Support and Resistance levels
  const r1 = (2 * pp) - prevLow;
  const r2 = pp + (prevHigh - prevLow);
  const s1 = (2 * pp) - prevHigh;
  const s2 = pp - (prevHigh - prevLow);
  
  return {
    pp: Math.round(pp * 100) / 100,
    r1: Math.round(r1 * 100) / 100,
    r2: Math.round(r2 * 100) / 100,
    s1: Math.round(s1 * 100) / 100,
    s2: Math.round(s2 * 100) / 100
  };
}

// Calculate all technical indicators for the current data
export function calculateAllIndicators(data: SPXData[]) {
  const indicators: any = {
    atr14: calculateATR(data, 14),
    adr20: calculateADR(data, 20),
    rsi14: calculateRSI(data, 14),
    volumeSMA20: calculateVolumeSMA(data, 20),
    pivotPoints: calculatePivotPoints(data)
  };

  // Add all possible moving averages
  const periods = [5, 8, 10, 13, 20, 21, 34, 50, 55, 89, 100, 200];
  
  periods.forEach(period => {
    indicators[`sma${period}`] = calculateSMA(data, period);
    indicators[`ema${period}`] = calculateEMA(data, period);
  });

  return indicators;
}

// Gap Analysis Functions
export function calculateGapPoints(currentOpen: number, prevClose: number): number {
  return Math.round((currentOpen - prevClose) * 100) / 100;
}

export function calculateGapFill(gapPoints: number, dayLow: number, dayHigh: number, prevClose: number): string {
  if (gapPoints === 0) return "Yes"; // No gap
  
  if (gapPoints > 0) {
    // Bull gap: check if price went below previous close
    if (dayLow <= prevClose) {
      return "Yes";
    } else {
      const pointsLeft = Math.round((dayLow - prevClose) * 100) / 100;
      return `No (${pointsLeft.toFixed(2)} points left)`;
    }
  } else {
    // Bear gap: check if price went above previous close
    if (dayHigh >= prevClose) {
      return "Yes";
    } else {
      const pointsLeft = Math.round((prevClose - dayHigh) * 100) / 100;
      return `No (${pointsLeft.toFixed(2)} points left)`;
    }
  }
}

// Trading Analysis Functions
export function getDayOfWeek(date: string): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  // Parse the date string and create a date object with UTC to avoid timezone issues
  const [year, month, day] = date.split('-').map(Number);
  const dateObj = new Date(Date.UTC(year, month - 1, day)); // month is 0-indexed, use UTC
  
  return days[dateObj.getUTCDay()];
}

export function calculateRTHRange(high: number, low: number): number {
  return Math.round((high - low) * 100) / 100;
}

// Price Level Analysis Functions
export function calculatePointNegativeOpen(open: number, low: number): number {
  return Math.round((open - low) * 100) / 100;
}

export function calculatePointPositiveOpen(open: number, high: number): number {
  return Math.round((high - open) * 100) / 100;
}

export function calculateAbovePDH(dayHigh: number, prevDayHigh: number): string {
  if (dayHigh > prevDayHigh) {
    const pointsUp = Math.round((dayHigh - prevDayHigh) * 100) / 100;
    return `Yes (${pointsUp.toFixed(2)} points up)`;
  }
  return "No";
}

export function calculateBelowPDL(dayLow: number, prevDayLow: number): string {
  if (dayLow < prevDayLow) {
    const pointsDown = Math.round((prevDayLow - dayLow) * 100) / 100;
    return `Yes (${pointsDown.toFixed(2)} points down)`;
  }
  return "No";
}

// Enhanced data processing function
export function enhanceStockDataWithTechnicalAnalysis(data: SPXData[]): SPXData[] {
  // Sort chronologically (oldest first) for proper calculations
  const chronologicalData = [...data].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  
  return chronologicalData.map((row, index) => {
    const prevDay = index > 0 ? chronologicalData[index - 1] : null;
    
    // Calculate gap analysis
    const gapPoints = prevDay ? calculateGapPoints(row.open, prevDay.close) : 0;
    const gapFill = prevDay ? calculateGapFill(gapPoints, row.low, row.high, prevDay.close) : "Yes";
    
    // Calculate trading analysis
    const dayOfWeek = getDayOfWeek(row.date);
    const rthRange = calculateRTHRange(row.high, row.low);
    
    // Calculate price level analysis
    const pointNegativeOpen = calculatePointNegativeOpen(row.open, row.low);
    const pointPositiveOpen = calculatePointPositiveOpen(row.open, row.high);
    const abovePDH = prevDay ? calculateAbovePDH(row.high, prevDay.high) : "No";
    const belowPDL = prevDay ? calculateBelowPDL(row.low, prevDay.low) : "No";
    
    return {
      ...row,
      gapPoints,
      gapFill,
      dayOfWeek,
      rthRange,
      pointNegativeOpen,
      pointPositiveOpen,
      abovePDH,
      belowPDL,
      prevDayHigh: prevDay?.high,
      prevDayLow: prevDay?.low,
      prevDayClose: prevDay?.close
    };
  });
}
