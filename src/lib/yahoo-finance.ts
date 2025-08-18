import { SPXData } from '@/types/spx';

export async function fetchFromYahooFinance(): Promise<SPXData[]> {
  // Calculate date range (3 years of data)
  const endDate = new Date();
  const startDate = new Date();
  startDate.setFullYear(startDate.getFullYear() - 3);

  // Yahoo Finance API endpoint for SPX (^GSPC)
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/%5EGSPC?period1=${Math.floor(startDate.getTime() / 1000)}&period2=${Math.floor(endDate.getTime() / 1000)}&interval=1d`;

  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  
  if (!data.chart || !data.chart.result || !data.chart.result[0]) {
    throw new Error('Invalid data structure from Yahoo Finance');
  }

  const result = data.chart.result[0];
  const timestamps = result.timestamp;
  const quotes = result.indicators.quote[0];
  const adjClose = result.indicators.adjclose[0];

  // First, create the data array without change calculations
  const rawData: Array<{
    date: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }> = timestamps.map((timestamp: number, index: number) => {
    const date = new Date(timestamp * 1000).toISOString().split('T')[0];
    const open = quotes.open[index] || 0;
    const high = quotes.high[index] || 0;
    const low = quotes.low[index] || 0;
    const close = adjClose.adjclose[index] || quotes.close[index] || 0;
    const volume = quotes.volume[index] || 0;

    return {
      date,
      open: Math.round(open * 100) / 100,
      high: Math.round(high * 100) / 100,
      low: Math.round(low * 100) / 100,
      close: Math.round(close * 100) / 100,
      volume
    };
  });

  // Sort by date (oldest first) to calculate changes correctly
  rawData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Now calculate changes using the properly sorted data
  const spxData: SPXData[] = rawData.map((row, index) => {
    const prevClose = index > 0 ? rawData[index - 1].close : row.close;
    const change = row.close - prevClose;
    const changePercent = prevClose !== 0 ? (change / prevClose) * 100 : 0;

    return {
      ...row,
      change: Math.round(change * 100) / 100,
      changePercent: Math.round(changePercent * 100) / 100
    };
  });

  // Sort back to most recent first for display
  spxData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  return spxData;
}
