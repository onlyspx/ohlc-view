import { fetchSPXIntradayData } from '@/lib/yahoo-finance';

export async function GET(request: Request, { params }: { params: Promise<{ date: string }> }) {
  try {
    const { date } = await params;
    const data = await fetchSPXIntradayData(date);
    
    return Response.json({
      data,
      date: date,
      lastUpdated: new Date().toISOString(),
      recordCount: data.length
    });
  } catch (error) {
    console.error('Error fetching SPX intraday data:', error);
    return Response.json(
      { error: 'Failed to fetch SPX intraday data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
