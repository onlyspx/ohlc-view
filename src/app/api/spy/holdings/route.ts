import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';

interface SPYHolding {
  ticker: string;
  name: string;
  weight: number;
  currentPrice: number;
  week52High: number;
  week52Low: number;
  marketCap: number;
  sector: string;
  priceDate: string;
}

interface SPYData {
  currentPrice: number;
  week52High: number;
  week52Low: number;
  lastUpdated: string;
  priceDate: string;
  holdings: SPYHolding[];
  totalWeight: number;
}

// Map ticker symbols to Yahoo Finance format
const mapTickerToYahoo = (ticker: string): string => {
  const tickerMap: Record<string, string> = {
    'BRK.B': 'BRK-B',  // Berkshire Hathaway Class B
    'BRK.A': 'BRK-A',  // Berkshire Hathaway Class A (if needed)
  };
  return tickerMap[ticker] || ticker;
};

// Get real stock data from Yahoo Finance API with YTD high/low
const getStockData = async (ticker: string): Promise<{
  currentPrice: number;
  week52High: number;
  week52Low: number;
  marketCap: number;
  sector: string;
  priceDate: string;
} | null> => {
  try {
    // Map ticker to Yahoo Finance format
    const yahooTicker = mapTickerToYahoo(ticker);
    
    // Use your existing Yahoo Finance API
    const response = await fetch(`http://localhost:3000/api/stock/${yahooTicker}`);
    if (!response.ok) {
      console.error(`Failed to fetch data for ${ticker}: HTTP ${response.status}`);
      return null;
    }
    
    const responseData = await response.json();
    
    if (!responseData || !responseData.data || responseData.data.length === 0) {
      console.error(`No data available for ${ticker}`);
      return null;
    }
    
    const latestData = responseData.data[0];
    
    if (!latestData || !latestData.date) {
      console.error(`Invalid data structure for ${ticker}:`, latestData);
      return null;
    }
    
    // Calculate YTD high and low from all available data
    const currentYear = new Date().getFullYear();
    const ytdData = responseData.data.filter((item: any) => {
      const itemYear = new Date(item.date).getFullYear();
      return itemYear === currentYear;
    });
    
    let ytdHigh = latestData.high || 0;
    let ytdLow = latestData.low || 0;
    
    if (ytdData.length > 0) {
      ytdHigh = Math.max(...ytdData.map((item: any) => item.high || 0));
      ytdLow = Math.min(...ytdData.map((item: any) => item.low || 0));
    }
    
    const priceDate = new Date(latestData.date).toLocaleDateString();
    
    return {
      currentPrice: latestData.close || 0,
      week52High: ytdHigh, // Now using actual YTD high
      week52Low: ytdLow,   // Now using actual YTD low
      marketCap: 0, // Not available in current API
      sector: 'Unknown', // Not available in current API
      priceDate
    };
  } catch (error) {
    console.error(`Error fetching data for ${ticker}:`, error);
    return null;
  }
};

export async function GET(request: Request) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const holdingsCount = searchParams.get('count') || '30';
    
    // Determine how many holdings to fetch
    let maxHoldings: number;
    if (holdingsCount === 'all') {
      maxHoldings = 1000; // Large number to get all holdings
    } else {
      maxHoldings = parseInt(holdingsCount) || 30;
    }

    const filePath = path.join(process.cwd(), 'public', 'spy-holdings.xlsx');
    
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    const fileBuffer = fs.readFileSync(filePath);
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    // Find header row - look for the row with "Name", "Ticker", "Weight" headers
    let headerRowIndex = -1;
    for (let i = 0; i < data.length; i++) {
      const row = data[i] as any[];
      if (row && row.length >= 5 && 
          row[0] === 'Name' && 
          row[1] === 'Ticker' && 
          row[4] === 'Weight') {
        headerRowIndex = i;
        break;
      }
    }

    if (headerRowIndex === -1) {
      return NextResponse.json({ error: 'Header row not found' }, { status: 400 });
    }

    const holdings: SPYHolding[] = [];
    
    // Parse only top 30 holdings to avoid API errors
    for (let i = headerRowIndex + 1; i < Math.min(headerRowIndex + maxHoldings + 1, data.length); i++) {
      const row = data[i] as any[];
      
      if (!row || row.length === 0) continue;
      
      const ticker = row[1]?.toString().trim();
      const weight = parseFloat(row[4]?.toString().replace('%', '') || '0');
      const name = row[0]?.toString().trim() || ticker;
      
      if (!ticker || isNaN(weight) || weight <= 0) continue;
      
      // Get real stock data - only include if we have real data
      const stockData = await getStockData(ticker);
      
      if (stockData) {
        holdings.push({
          ticker,
          name,
          weight,
          currentPrice: stockData.currentPrice,
          week52High: stockData.week52High,
          week52Low: stockData.week52Low,
          marketCap: stockData.marketCap,
          sector: stockData.sector,
          priceDate: stockData.priceDate
        });
      } else {
        console.log(`Skipping ${ticker} - no real data available`);
      }
    }

    // Sort by weight (descending)
    holdings.sort((a, b) => b.weight - a.weight);

    // Calculate total weight of top 30 holdings
    const totalWeight = holdings.reduce((sum, holding) => sum + holding.weight, 0);

    // Get SPY data for the main display
    const spyStockData = await getStockData('SPY');

    if (!spyStockData) {
      return NextResponse.json({ error: 'Unable to fetch SPY data' }, { status: 500 });
    }

    const spyData: SPYData = {
      currentPrice: spyStockData.currentPrice,
      week52High: spyStockData.week52High,
      week52Low: spyStockData.week52Low,
      lastUpdated: new Date().toISOString(),
      priceDate: spyStockData.priceDate,
      holdings: holdings,
      totalWeight: totalWeight
    };

    return NextResponse.json(spyData);
    
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
