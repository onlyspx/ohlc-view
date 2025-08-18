import { NextRequest, NextResponse } from 'next/server';
import { SPXResponse } from '@/types/spx';
import { getStoredData, storeData, shouldUpdateData } from '@/lib/storage';
import { fetchStockData } from '@/lib/yahoo-finance';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ symbol: string }> }
) {
  const { symbol } = await params;
  const symbolUpper = symbol.toUpperCase();
  
  try {
    // Check if we need to update the data
    const needsUpdate = await shouldUpdateData(symbolUpper);
    
    if (!needsUpdate) {
      // Return cached data
      const storedData = await getStoredData(symbolUpper);
      if (storedData) {
        const responseData: SPXResponse = {
          data: storedData.data,
          lastUpdated: storedData.lastUpdated
        };
        return NextResponse.json(responseData);
      }
    }

    // Fetch fresh data from Yahoo Finance
    const stockData = await fetchStockData(symbolUpper);
    
    // Store the new data
    const lastUpdated = new Date().toISOString();
    await storeData(stockData, lastUpdated, symbolUpper);

    const responseData: SPXResponse = {
      data: stockData,
      lastUpdated
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error(`Error fetching ${symbolUpper} data:`, error);
    
    // Try to return cached data as fallback
    try {
      const storedData = await getStoredData(symbolUpper);
      if (storedData) {
        const responseData: SPXResponse = {
          data: storedData.data,
          lastUpdated: storedData.lastUpdated
        };
        return NextResponse.json(responseData);
      }
    } catch (fallbackError) {
      console.error('Error accessing cached data:', fallbackError);
    }
    
    return NextResponse.json(
      { error: `Failed to fetch ${symbolUpper} data` },
      { status: 500 }
    );
  }
}
