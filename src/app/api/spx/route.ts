import { NextResponse } from 'next/server';
import { SPXResponse } from '@/types/spx';
import { fetchFromYahooFinance } from '@/lib/yahoo-finance';

export async function GET() {
  try {
    // Fetch fresh data from Yahoo Finance
    const spxData = await fetchFromYahooFinance();
    
    const lastUpdated = new Date().toISOString();
    
    const responseData: SPXResponse = {
      data: spxData,
      lastUpdated
    };

    return NextResponse.json(responseData, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error('Error fetching SPX data:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch SPX data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { 
        status: 500,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }
    );
  }
}
