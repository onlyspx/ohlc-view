import { SPXData } from '@/types/spx';

// Fetch stock data from Yahoo Finance for any symbol
export async function fetchStockData(symbol: string): Promise<SPXData[]> {
  // Calculate date range (3 years of data)
  const endDate = new Date();
  const startDate = new Date();
  startDate.setFullYear(startDate.getFullYear() - 3);

  // Yahoo Finance API endpoint for any symbol
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?period1=${Math.floor(startDate.getTime() / 1000)}&period2=${Math.floor(endDate.getTime() / 1000)}&interval=1d`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; StockApp/1.0)',
      },
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`Yahoo Finance API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.chart || !data.chart.result || !data.chart.result[0]) {
      throw new Error('Invalid data structure from Yahoo Finance API');
    }

    const result = data.chart.result[0];
    const timestamps = result.timestamp;
    const quotes = result.indicators.quote[0];
    const adjClose = result.indicators.adjclose[0];

    if (!timestamps || !quotes || !adjClose) {
      throw new Error('Missing required data fields from Yahoo Finance API');
    }

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
    const stockData: SPXData[] = rawData.map((row, index) => {
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
    stockData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    return stockData;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timeout: Yahoo Finance API took too long to respond');
    }
    throw error;
  }
}

// Keep the original function for backward compatibility
export async function fetchFromYahooFinance(): Promise<SPXData[]> {
  return fetchStockData('^GSPC');
}
