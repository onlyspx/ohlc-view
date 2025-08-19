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
  
  // Parse the date string and create a date object
  const [year, month, day] = date.split('-').map(Number);
  const dateObj = new Date(year, month - 1, day); // month is 0-indexed
  
  return days[dateObj.getDay()];
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
