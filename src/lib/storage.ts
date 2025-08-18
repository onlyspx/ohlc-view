import fs from 'fs/promises';
import path from 'path';
import { SPXData } from '@/types/spx';

const DATA_FILE_PATH = path.join(process.cwd(), 'data', 'spx-data.json');
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

interface CachedData {
  data: SPXData[];
  lastUpdated: string;
  lastFetched: string;
}

export async function getStoredData(): Promise<CachedData | null> {
  try {
    const data = await fs.readFile(DATA_FILE_PATH, 'utf-8');
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export async function storeData(data: SPXData[], lastUpdated: string): Promise<void> {
  try {
    // Ensure data directory exists
    const dataDir = path.dirname(DATA_FILE_PATH);
    await fs.mkdir(dataDir, { recursive: true });
    
    const cachedData: CachedData = {
      data,
      lastUpdated,
      lastFetched: new Date().toISOString()
    };
    
    await fs.writeFile(DATA_FILE_PATH, JSON.stringify(cachedData, null, 2));
  } catch (error) {
    console.error('Error storing data:', error);
  }
}

export function isDataStale(lastFetched: string): boolean {
  const lastFetchedTime = new Date(lastFetched).getTime();
  const currentTime = new Date().getTime();
  return (currentTime - lastFetchedTime) > CACHE_DURATION;
}

export async function shouldUpdateData(): Promise<boolean> {
  const storedData = await getStoredData();
  
  if (!storedData) {
    return true; // No stored data, need to fetch
  }
  
  return isDataStale(storedData.lastFetched);
}
