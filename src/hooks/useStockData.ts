import { useState, useEffect } from 'react';
import { SPXResponse, SPXData } from '@/types/spx';

export function useStockData(symbol: string = 'SPY') {
  const [data, setData] = useState<SPXData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        // Clear previous data immediately when starting a new request
        setData([]);
        setLastUpdated(null);
        
        // Add timestamp to force cache refresh
        const timestamp = Date.now();
        const response = await fetch(`/api/stock/${symbol}?t=${timestamp}`, {
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result: SPXResponse = await response.json();
        
        setData(result.data);
        setLastUpdated(result.lastUpdated);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
        // Clear data on error to prevent showing stale data
        setData([]);
        setLastUpdated(null);
      } finally {
        setLoading(false);
      }
    };

    if (symbol) {
      fetchData();
    }
  }, [symbol]);

  return { data, loading, error, lastUpdated };
}
