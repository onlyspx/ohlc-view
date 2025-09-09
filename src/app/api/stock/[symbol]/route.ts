import { NextRequest, NextResponse } from 'next/server';
import { SPXResponse } from '@/types/spx';
import { fetchStockData } from '@/lib/yahoo-finance';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ symbol: string }> }
) {
  let symbolUpper = '';
  
  try {
    const { symbol } = await params;
    symbolUpper = symbol.toUpperCase();
    
    // Fetch fresh data from Yahoo Finance
    const stockData = await fetchStockData(symbolUpper);
    
    const lastUpdated = new Date().toISOString();

    const responseData: SPXResponse = {
      data: stockData,
      lastUpdated
    };

    return NextResponse.json(responseData, {
      headers: {
        'Cache-Control': 'public, max-age=60, s-maxage=60', // Cache for 1 minute
        'CDN-Cache-Control': 'max-age=60',
        'Vercel-CDN-Cache-Control': 'max-age=60'
      }
    });
  } catch (error) {
    console.error(`Error fetching ${symbolUpper} data:`, error);
    
    return NextResponse.json(
      { 
        error: `Failed to fetch ${symbolUpper} data`,
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
