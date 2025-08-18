import fs from 'fs/promises';
import path from 'path';
import { SPXData } from '@/types/spx';

const getDataFilePath = (symbol: string) => path.join(process.cwd(), 'data', `${symbol.toLowerCase()}-data.json`);
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

interface CachedData {
  data: SPXData[];
  lastUpdated: string;
  lastFetched: string;
}

export async function getStoredData(symbol: string = 'spx'): Promise<CachedData | null> {
  try {
    const dataFilePath = getDataFilePath(symbol);
    const data = await fs.readFile(dataFilePath, 'utf-8');
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export async function storeData(data: SPXData[], lastUpdated: string, symbol: string = 'spx'): Promise<void> {
  try {
    const dataFilePath = getDataFilePath(symbol);
    // Ensure data directory exists
    const dataDir = path.dirname(dataFilePath);
    await fs.mkdir(dataDir, { recursive: true });
    
    const cachedData: CachedData = {
      data,
      lastUpdated,
      lastFetched: new Date().toISOString()
    };
    
    await fs.writeFile(dataFilePath, JSON.stringify(cachedData, null, 2));
  } catch (error) {
    console.error('Error storing data:', error);
  }
}

export function isDataStale(lastFetched: string): boolean {
  const lastFetchedTime = new Date(lastFetched).getTime();
  const currentTime = new Date().getTime();
  return (currentTime - lastFetchedTime) > CACHE_DURATION;
}

export async function shouldUpdateData(symbol: string = 'spx'): Promise<boolean> {
  const storedData = await getStoredData(symbol);
  
  if (!storedData) {
    return true; // No stored data, need to fetch
  }
  
  return isDataStale(storedData.lastFetched);
}
