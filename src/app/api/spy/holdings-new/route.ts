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
}

interface SPYData {
  currentPrice: number;
  week52High: number;
  week52Low: number;
  lastUpdated: string;
  holdings: SPYHolding[];
}

// Mock stock data - in production, this would come from a real API
const getStockData = (ticker: string): {
  currentPrice: number;
  week52High: number;
  week52Low: number;
  marketCap: number;
  sector: string;
} => {
  const mockData: Record<string, any> = {
    'AAPL': { currentPrice: 190.25, week52High: 199.62, week52Low: 124.17, marketCap: 2950000000000, sector: 'Technology' },
    'MSFT': { currentPrice: 415.26, week52High: 468.35, week52Low: 309.45, marketCap: 3080000000000, sector: 'Technology' },
    'NVDA': { currentPrice: 875.28, week52High: 974.00, week52Low: 200.00, marketCap: 2150000000000, sector: 'Technology' },
    'AMZN': { currentPrice: 155.58, week52High: 189.77, week52Low: 101.15, marketCap: 1620000000000, sector: 'Consumer Discretionary' },
    'GOOGL': { currentPrice: 140.93, week52High: 151.55, week52Low: 83.34, marketCap: 1750000000000, sector: 'Technology' },
    'GOOG': { currentPrice: 142.17, week52High: 152.75, week52Low: 84.00, marketCap: 1750000000000, sector: 'Technology' },
    'TSLA': { currentPrice: 248.42, week52High: 299.29, week52Low: 138.80, marketCap: 790000000000, sector: 'Consumer Discretionary' },
    'META': { currentPrice: 485.58, week52High: 531.49, week52Low: 185.64, marketCap: 1230000000000, sector: 'Technology' },
    'BRK.B': { currentPrice: 410.25, week52High: 430.00, week52Low: 300.00, marketCap: 900000000000, sector: 'Financials' },
    'AVGO': { currentPrice: 1280.00, week52High: 1400.00, week52Low: 400.00, marketCap: 600000000000, sector: 'Technology' },
  };

  return mockData[ticker] || {
    currentPrice: 100.00,
    week52High: 120.00,
    week52Low: 80.00,
    marketCap: 100000000000,
    sector: 'Unknown'
  };
};

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'public', 'spy-holdings.xlsx');
    
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    const fileBuffer = fs.readFileSync(filePath);
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    // Find header row
    let headerRowIndex = -1;
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      if (row[0] === 'Name' && row[1] === 'Ticker' && row[4] === 'Weight') {
        headerRowIndex = i;
        break;
      }
    }

    if (headerRowIndex === -1) {
      return NextResponse.json({ error: 'Header row not found' }, { status: 400 });
    }

    const holdings: SPYHolding[] = [];
    
    // Parse first 50 holdings
    for (let i = headerRowIndex + 1; i < Math.min(headerRowIndex + 51, data.length); i++) {
      const row = data[i];
      
      if (!row || row.length === 0) continue;
      
      const ticker = row[1]?.toString().trim();
      const weight = parseFloat(row[4]?.toString().replace('%', '') || '0');
      const name = row[0]?.toString().trim() || ticker;
      
      if (!ticker || isNaN(weight) || weight <= 0) continue;
      
      const stockData = getStockData(ticker);
      
      holdings.push({
        ticker,
        name,
        weight,
        currentPrice: stockData.currentPrice,
        week52High: stockData.week52High,
        week52Low: stockData.week52Low,
        marketCap: stockData.marketCap,
        sector: stockData.sector
      });
    }

    // Sort by weight (descending)
    holdings.sort((a, b) => b.weight - a.weight);

    const spyData: SPYData = {
      currentPrice: 580.25,
      week52High: 590.00,
      week52Low: 410.00,
      lastUpdated: new Date().toISOString(),
      holdings: holdings.slice(0, 50)
    };

    return NextResponse.json(spyData);
    
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
