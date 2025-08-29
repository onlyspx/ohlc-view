// Dashboard configuration types and utilities
export interface MovingAverage {
  key: string;
  label: string;
  period: number;
  type: 'SMA' | 'EMA' | 'WMA';
  enabled: boolean;
}

export interface DashboardConfig {
  tickers: string[];
  movingAverages: MovingAverage[];
  showVolatility: boolean;
  showRSI: boolean;
  showVolume: boolean;
}

// Default moving averages configuration
export const DEFAULT_MOVING_AVERAGES: MovingAverage[] = [
  { key: 'sma5', label: '5D SMA', period: 5, type: 'SMA', enabled: true },
  { key: 'ema8', label: '8D EMA', period: 8, type: 'EMA', enabled: true },
  { key: 'sma10', label: '10D SMA', period: 10, type: 'SMA', enabled: true },
  { key: 'sma20', label: '20D SMA', period: 20, type: 'SMA', enabled: true },
  { key: 'ema21', label: '21D EMA', period: 21, type: 'EMA', enabled: true },
  { key: 'sma50', label: '50D SMA', period: 50, type: 'SMA', enabled: true },
  { key: 'sma100', label: '100D SMA', period: 100, type: 'SMA', enabled: true },
  { key: 'sma200', label: '200D SMA', period: 200, type: 'SMA', enabled: true },
];

// Default tickers
export const DEFAULT_TICKERS = [
  'SPY', 'QQQ', // Major indices
  'NVDA', 'MSFT', 'AAPL', 'GOOGL', 'AMZN', 'META', 'AVGO', 'TSLA', 'BRK-B',
  'JPM', 'WMT', 'V', 'LLY', 'ORCL', 'MA', 'NFLX', // Top SP500
  'XLK', 'XLF', 'XLV', 'XLI', 'XLE', 'XLP', 'XLY', 'XLB', 'XLU', 'XLRE', 'XLC', // Sectors
  'IBIT', 'GLD', 'SMH', 'CL=F', '^VIX', 'IWM', 'DIA' // Others
];

// Local storage keys
const CONFIG_STORAGE_KEY = 'ohlc-dashboard-config';

// Load configuration from local storage
export function loadDashboardConfig(): DashboardConfig {
  if (typeof window === 'undefined') {
    return getDefaultConfig();
  }

  try {
    const stored = localStorage.getItem(CONFIG_STORAGE_KEY);
    if (stored) {
      const config = JSON.parse(stored);
      // Merge with defaults to ensure all properties exist
      return {
        ...getDefaultConfig(),
        ...config,
        movingAverages: config.movingAverages || DEFAULT_MOVING_AVERAGES
      };
    }
  } catch (error) {
    console.error('Error loading dashboard config:', error);
  }

  return getDefaultConfig();
}

// Save configuration to local storage
export function saveDashboardConfig(config: DashboardConfig): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
  } catch (error) {
    console.error('Error saving dashboard config:', error);
  }
}

// Get default configuration
export function getDefaultConfig(): DashboardConfig {
  return {
    tickers: [...DEFAULT_TICKERS],
    movingAverages: [...DEFAULT_MOVING_AVERAGES],
    showVolatility: true,
    showRSI: true,
    showVolume: true,
  };
}

// Reset configuration to defaults
export function resetDashboardConfig(): DashboardConfig {
  const defaultConfig = getDefaultConfig();
  saveDashboardConfig(defaultConfig);
  return defaultConfig;
}

// Add a new moving average
export function addMovingAverage(
  config: DashboardConfig,
  period: number,
  type: 'SMA' | 'EMA' | 'WMA' = 'SMA'
): DashboardConfig {
  const key = `${type.toLowerCase()}${period}`;
  const label = `${period}D ${type}`;
  
  const newMA: MovingAverage = {
    key,
    label,
    period,
    type,
    enabled: true
  };

  const updatedConfig = {
    ...config,
    movingAverages: [...config.movingAverages, newMA]
  };

  saveDashboardConfig(updatedConfig);
  return updatedConfig;
}

// Remove a moving average
export function removeMovingAverage(config: DashboardConfig, key: string): DashboardConfig {
  const updatedConfig = {
    ...config,
    movingAverages: config.movingAverages.filter(ma => ma.key !== key)
  };

  saveDashboardConfig(updatedConfig);
  return updatedConfig;
}

// Toggle moving average visibility
export function toggleMovingAverage(config: DashboardConfig, key: string): DashboardConfig {
  const updatedConfig = {
    ...config,
    movingAverages: config.movingAverages.map(ma => 
      ma.key === key ? { ...ma, enabled: !ma.enabled } : ma
    )
  };

  saveDashboardConfig(updatedConfig);
  return updatedConfig;
}

// Add ticker to list
export function addTicker(config: DashboardConfig, ticker: string): DashboardConfig {
  const upperTicker = ticker.toUpperCase();
  if (!config.tickers.includes(upperTicker)) {
    const updatedConfig = {
      ...config,
      tickers: [...config.tickers, upperTicker]
    };
    saveDashboardConfig(updatedConfig);
    return updatedConfig;
  }
  return config;
}

// Remove ticker from list
export function removeTicker(config: DashboardConfig, ticker: string): DashboardConfig {
  const updatedConfig = {
    ...config,
    tickers: config.tickers.filter(t => t !== ticker.toUpperCase())
  };
  saveDashboardConfig(updatedConfig);
  return updatedConfig;
}
