import { NextResponse } from 'next/server';
import { fetchFromYahooFinance } from '@/lib/yahoo-finance';

export async function POST() {
  try {
    // Force fetch fresh data from Yahoo Finance
    const spxData = await fetchFromYahooFinance();
    
    const lastUpdated = new Date().toISOString();

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
        error: 'Failed to refresh SPX data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
