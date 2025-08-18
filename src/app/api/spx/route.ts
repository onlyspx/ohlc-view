import { NextResponse } from 'next/server';
import { SPXResponse } from '@/types/spx';
import { getStoredData, storeData, shouldUpdateData } from '@/lib/storage';
import { fetchFromYahooFinance } from '@/lib/yahoo-finance';

export async function GET() {
  try {
    // Check if we need to update the data
    const needsUpdate = await shouldUpdateData();
    
    if (!needsUpdate) {
      // Return cached data
      const storedData = await getStoredData();
      if (storedData) {
        const responseData: SPXResponse = {
          data: storedData.data,
          lastUpdated: storedData.lastUpdated
        };
        return NextResponse.json(responseData);
      }
    }

    // Fetch fresh data from Yahoo Finance
    const spxData = await fetchFromYahooFinance();
    
    // Store the new data
    const lastUpdated = new Date().toISOString();
    await storeData(spxData, lastUpdated);

    const responseData: SPXResponse = {
      data: spxData,
      lastUpdated
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error fetching SPX data:', error);
    
    // Try to return cached data as fallback
    try {
      const storedData = await getStoredData();
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
      { error: 'Failed to fetch SPX data' },
      { status: 500 }
    );
  }
}
