import { NextResponse } from 'next/server';
import { fetchFromYahooFinance } from '@/lib/yahoo-finance';
import { storeData } from '@/lib/storage';

export async function POST() {
  try {
    // Force fetch fresh data from Yahoo Finance
    const spxData = await fetchFromYahooFinance();
    
    // Store the new data
    const lastUpdated = new Date().toISOString();
    await storeData(spxData, lastUpdated);

    return NextResponse.json({
      success: true,
      message: 'Data refreshed successfully',
      lastUpdated,
      dataPoints: spxData.length
    });
  } catch (error) {
    console.error('Error refreshing SPX data:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to refresh SPX data' 
      },
      { status: 500 }
    );
  }
}
