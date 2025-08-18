import { SPXData } from '@/types/spx';

// No storage - fetch on demand only
interface CachedData {
  data: SPXData[];
  lastUpdated: string;
  lastFetched: string;
}

export async function getStoredData(symbol: string = 'spx'): Promise<CachedData | null> {
  // No stored data - always fetch fresh
  return null;
}

export async function storeData(data: SPXData[], lastUpdated: string, symbol: string = 'spx'): Promise<void> {
  // No storage - do nothing
}

export function isDataStale(lastFetched: string): boolean {
  // Always consider data stale since we don't store
  return true;
}

export async function shouldUpdateData(symbol: string = 'spx'): Promise<boolean> {
  // Always fetch fresh data
  return true;
}
