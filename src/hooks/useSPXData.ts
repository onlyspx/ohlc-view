import { useState, useEffect } from 'react';
import { SPXResponse, SPXData } from '@/types/spx';

export function useSPXData() {
  const [data, setData] = useState<SPXData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/api/spx');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result: SPXResponse = await response.json();
        
        setData(result.data);
        setLastUpdated(result.lastUpdated);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, loading, error, lastUpdated };
}

