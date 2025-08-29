'use client';

import { useState, useEffect } from 'react';
// Remove direct Yahoo Finance import - we'll use the API endpoint instead
import { calculateAllIndicators } from '@/lib/technical-indicators';
import { loadDashboardConfig, DashboardConfig } from '@/lib/dashboard-config';
import DashboardConfigComponent from '@/components/DashboardConfig';

interface StockData {
  symbol: string;
  name: string;
  category: string;
  data: any[];
  indicators: any;
  currentPrice: number;
  loading: boolean;
  error: string | null;
}

const AI_STOCKS = [
  // Semiconductors
  { symbol: 'AMD', name: 'AMD', category: 'Semiconductors' },
  { symbol: 'ASML', name: 'ASML', category: 'Semiconductors' },
  { symbol: 'AVGO', name: 'Broadcom', category: 'Semiconductors' },
  { symbol: 'INTC', name: 'Intel', category: 'Semiconductors' },
  { symbol: 'MRVL', name: 'Marvell', category: 'Semiconductors' },
  { symbol: 'NVDA', name: 'Nvidia', category: 'Semiconductors' },
  { symbol: 'TSM', name: 'TSMC', category: 'Semiconductors' },
  
  // Cloud Service Providers
  { symbol: 'AMZN', name: 'Amazon', category: 'Cloud Providers' },
  { symbol: 'GOOGL', name: 'Alphabet', category: 'Cloud Providers' },
  { symbol: 'IBM', name: 'IBM', category: 'Cloud Providers' },
  { symbol: 'MSFT', name: 'Microsoft', category: 'Cloud Providers' },
  { symbol: 'NOW', name: 'ServiceNow', category: 'Cloud Providers' },
  { symbol: 'ORCL', name: 'Oracle', category: 'Cloud Providers' },
  
  // Servers
  { symbol: 'DELL', name: 'Dell', category: 'Servers' },
  { symbol: 'HPE', name: 'HPE', category: 'Servers' },
  { symbol: 'SMCI', name: 'Super Micro', category: 'Servers' },
  { symbol: 'VRT', name: 'Vertiv', category: 'Servers' },
  
  // Storage
  { symbol: 'MU', name: 'Micron', category: 'Storage' },
  { symbol: 'STX', name: 'Seagate', category: 'Storage' },
  { symbol: 'WDC', name: 'Western Digital', category: 'Storage' },
  
  // Electronics
  { symbol: 'AMSC', name: 'American Superconductor', category: 'Electronics' },
  { symbol: 'APH', name: 'Amphenol', category: 'Electronics' },
  { symbol: 'ETN', name: 'Eaton', category: 'Electronics' },
  { symbol: 'NVT', name: 'nVent', category: 'Electronics' },
  
  // Networking
  { symbol: 'ALAB', name: 'Astera Labs', category: 'Networking' },
  { symbol: 'ANET', name: 'Arista Networks', category: 'Networking' },
  { symbol: 'CIEN', name: 'Ciena', category: 'Networking' },
  { symbol: 'CLS', name: 'Celestica', category: 'Networking' },
  { symbol: 'COHR', name: 'Coherent', category: 'Networking' },
  { symbol: 'CRDO', name: 'Credo Technology', category: 'Networking' },
  { symbol: 'CSCO', name: 'Cisco Systems', category: 'Networking' },
  { symbol: 'EXTR', name: 'Extreme Networks', category: 'Networking' },
  { symbol: 'FFIV', name: 'F5 Networks', category: 'Networking' },
  { symbol: 'JNPR', name: 'Juniper Networks', category: 'Networking' },
  
  // Cloud and Data Services
  { symbol: 'CFLT', name: 'Confluent', category: 'Cloud Services' },
  { symbol: 'DDOG', name: 'Datadog', category: 'Cloud Services' },
  { symbol: 'DOCN', name: 'DigitalOcean', category: 'Cloud Services' },
  { symbol: 'ESTC', name: 'Elastic', category: 'Cloud Services' },
  { symbol: 'GTLB', name: 'GitLab', category: 'Cloud Services' },
  { symbol: 'INOD', name: 'Innodata', category: 'Cloud Services' },
  { symbol: 'MDB', name: 'MongoDB', category: 'Cloud Services' },
  { symbol: 'PLTR', name: 'Palantir', category: 'Cloud Services' },
  { symbol: 'SNOW', name: 'Snowflake', category: 'Cloud Services' },
  
  // Data Centers
  { symbol: 'AMT', name: 'American Tower', category: 'Data Centers' },
  { symbol: 'APLD', name: 'Applied Digital', category: 'Data Centers' },
  { symbol: 'CORZ', name: 'Core Scientific', category: 'Data Centers' },
  { symbol: 'CRWV', name: 'Coreweave', category: 'Data Centers' },
  { symbol: 'EQIX', name: 'Equinix', category: 'Data Centers' },
  { symbol: 'GDS', name: 'GDS Holdings', category: 'Data Centers' },
  { symbol: 'GLXY', name: 'Galaxy Digital', category: 'Data Centers' },
  { symbol: 'IREN', name: 'Iris Energy', category: 'Data Centers' },
  { symbol: 'NBIS', name: 'Nebius', category: 'Data Centers' },
  { symbol: 'VNET', name: 'VNET Group', category: 'Data Centers' },
  
  // Nuclear Energy
  { symbol: 'BWXT', name: 'BWX Tech', category: 'Nuclear Energy' },
  { symbol: 'NNE', name: 'Nano Nuclear', category: 'Nuclear Energy' },
  { symbol: 'OKLO', name: 'Oklo', category: 'Nuclear Energy' },
  { symbol: 'RYCEF', name: 'Rolls Royce', category: 'Nuclear Energy' },
  { symbol: 'SMR', name: 'NuScale', category: 'Nuclear Energy' },
  
  // Data
  { symbol: 'META', name: 'Meta', category: 'Data' },
  { symbol: 'RDDT', name: 'Reddit', category: 'Data' },
  
  // Energy and Utilities
  { symbol: 'CEG', name: 'Constellation Energy', category: 'Energy' },
  { symbol: 'D', name: 'Dominion Energy', category: 'Energy' },
  { symbol: 'DUK', name: 'Duke Energy', category: 'Energy' },
  { symbol: 'ETR', name: 'Entergy', category: 'Energy' },
  { symbol: 'GEV', name: 'GE Vernova', category: 'Energy' },
  { symbol: 'NEE', name: 'NextEra Energy', category: 'Energy' },
  { symbol: 'PEG', name: 'PSEG', category: 'Energy' },
  { symbol: 'PNW', name: 'Pinnacle West', category: 'Energy' },
  { symbol: 'SO', name: 'Southern Company', category: 'Energy' },
  { symbol: 'SRE', name: 'Sempra Energy', category: 'Energy' },
  { symbol: 'VST', name: 'Vistra', category: 'Energy' },
  { symbol: 'TLN', name: 'Energy', category: 'Energy' },
  { symbol: 'WEC', name: 'WEC Energy Group', category: 'Energy' },
  
  // Engineering and Construction
  { symbol: 'PWR', name: 'Quanta', category: 'Engineering' }
];

const CATEGORY_EMOJIS: { [key: string]: string } = {
  'Semiconductors': '💻',
  'Cloud Providers': '🌩️',
  'Servers': '🖥️',
  'Storage': '💾',
  'Electronics': '⚡',
  'Networking': '🌐',
  'Cloud Services': '☁️',
  'Data Centers': '🏢',
  'Nuclear Energy': '☢️',
  'Data': '📊',
  'Energy': '🔋',
  'Engineering': '🏗️'
};

export default function AIStocksPage() {
  const [stocks, setStocks] = useState<StockData[]>([]);
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState<DashboardConfig>(loadDashboardConfig());
  const [showConfig, setShowConfig] = useState(false);

  useEffect(() => {
    const fetchAllStocks = async () => {
      setLoading(true);
      
      const stockPromises = AI_STOCKS.map(async (stock) => {
        try {
          console.log(`Fetching data for ${stock.symbol}...`);
          
          // Use the existing API endpoint instead of direct Yahoo Finance call
          const response = await fetch(`/api/stock/${stock.symbol}`);
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          
          const result = await response.json();
          const data = result.data || [];
          console.log(`${stock.symbol} data:`, data);
          
          if (!data || data.length === 0) {
            console.warn(`No data received for ${stock.symbol}`);
            return {
              symbol: stock.symbol,
              name: stock.name,
              category: stock.category,
              data: [],
              indicators: {},
              currentPrice: 0,
              loading: false,
              error: 'No data available'
            };
          }
          
          const indicators = calculateAllIndicators(data);
          const currentPrice = data[0]?.close || 0;
          console.log(`${stock.symbol} current price:`, currentPrice);
          
          return {
            symbol: stock.symbol,
            name: stock.name,
            category: stock.category,
            data,
            indicators,
            currentPrice,
            loading: false,
            error: null
          };
        } catch (error) {
          console.error(`Error fetching ${stock.symbol}:`, error);
          return {
            symbol: stock.symbol,
            name: stock.name,
            category: stock.category,
            data: [],
            indicators: {},
            currentPrice: 0,
            loading: false,
            error: error instanceof Error ? error.message : 'Failed to fetch data'
          };
        }
      });

      const results = await Promise.all(stockPromises);
      setStocks(results);
      setLoading(false);
    };

    fetchAllStocks();
  }, []);

  const getIndicatorValue = (indicators: any, key: string): number | null => {
    if (!indicators || key === 'pivotPoints') return null;
    const value = indicators[key];
    return typeof value === 'number' ? value : null;
  };

  const renderIndicatorCell = (
    value: number | null, 
    isVolatility: boolean = false, 
    isRSI: boolean = false, 
    isVolume: boolean = false,
    currentPrice?: number
  ) => {
    if (value === null) return <span className="text-gray-400">-</span>;
    
    let colorClass = 'text-gray-900';
    
    if (isRSI) {
      if (value > 70) colorClass = 'text-red-600 font-semibold';
      else if (value < 30) colorClass = 'text-green-600 font-semibold';
    } else if (currentPrice && !isVolatility && !isVolume) {
      // For moving averages, color based on price relationship
      if (currentPrice > value) colorClass = 'text-green-600 font-semibold';
      else if (currentPrice < value) colorClass = 'text-red-600 font-semibold';
    }
    
    let formattedValue: string;
    
    if (isVolume) {
      // Format volume in millions with commas
      const volumeInMillions = value / 1000000;
      formattedValue = volumeInMillions.toFixed(1) + 'M';
    } else if (isVolatility) {
      formattedValue = value.toFixed(2);
    } else {
      formattedValue = value.toFixed(2);
    }
    
    return <span className={colorClass}>{formattedValue}</span>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading AI stocks data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🤖 AI Stocks Dashboard</h1>
          <p className="text-gray-600">Technical analysis for AI infrastructure and related stocks</p>
          <div className="mt-4 flex gap-4">
            <a
              href="/"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              🏠 Home
            </a>
            <a
              href="/dashboard"
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors"
            >
              📊 Market Dashboard
            </a>
            <button
              onClick={() => setShowConfig(true)}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors"
            >
              ⚙️ Configure Indicators
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-bold text-gray-900 border-b">
                    Stock
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-bold text-gray-900 border-b">
                    Category
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-bold text-gray-900 border-b">
                    Price
                  </th>
                  {config.movingAverages.filter(ma => ma.enabled).map(ma => (
                    <th key={ma.key} className="px-4 py-3 text-left text-sm font-bold text-gray-900 border-b">
                      {ma.label}
                    </th>
                  ))}
                  {config.showVolatility && (
                    <>
                      <th className="px-4 py-3 text-left text-sm font-bold text-gray-900 border-b">14D ATR</th>
                      <th className="px-4 py-3 text-left text-sm font-bold text-gray-900 border-b">20D ADR</th>
                    </>
                  )}
                  {config.showRSI && (
                    <th className="px-4 py-3 text-left text-sm font-bold text-gray-900 border-b">14D RSI</th>
                  )}
                  {config.showVolume && (
                    <th className="px-4 py-3 text-left text-sm font-bold text-gray-900 border-b">20D Vol</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {stocks.map((stock) => (
                  <tr key={stock.symbol} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm border-r">
                      <div>
                        <div className="font-semibold text-gray-900">{stock.symbol}</div>
                        <div className="text-xs text-gray-500">{stock.name}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm border-r">
                      <span className="inline-flex items-center gap-1">
                        <span>{CATEGORY_EMOJIS[stock.category]}</span>
                        <span className="text-gray-700">{stock.category}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm border-r font-semibold">
                      {stock.error ? (
                        <span className="text-red-500 text-xs">{stock.error}</span>
                      ) : stock.currentPrice > 0 ? (
                        `$${stock.currentPrice.toFixed(2)}`
                      ) : (
                        <span className="text-gray-400">Loading...</span>
                      )}
                    </td>
                    {config.movingAverages.filter(ma => ma.enabled).map(ma => (
                      <td key={ma.key} className="px-4 py-3 text-sm border-r">
                        {renderIndicatorCell(getIndicatorValue(stock.indicators, ma.key), false, false, false, stock.currentPrice)}
                      </td>
                    ))}
                    {config.showVolatility && (
                      <>
                        <td className="px-4 py-3 text-sm border-r">
                          {renderIndicatorCell(getIndicatorValue(stock.indicators, 'atr14'), true)}
                        </td>
                        <td className="px-4 py-3 text-sm border-r">
                          {renderIndicatorCell(getIndicatorValue(stock.indicators, 'adr20'), true)}
                        </td>
                      </>
                    )}
                    {config.showRSI && (
                      <td className="px-4 py-3 text-sm border-r">
                        {renderIndicatorCell(getIndicatorValue(stock.indicators, 'rsi14'), false, true)}
                      </td>
                    )}
                    {config.showVolume && (
                      <td className="px-4 py-3 text-sm">
                        {renderIndicatorCell(getIndicatorValue(stock.indicators, 'volumeSMA20'), false, false, true)}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Configuration Modal */}
        <DashboardConfigComponent
          config={config}
          onConfigChange={setConfig}
          isOpen={showConfig}
          onClose={() => setShowConfig(false)}
        />
      </div>
    </div>
  );
}
