'use client';

import { useState, useEffect } from 'react';
import { useStockData } from '@/hooks/useStockData';
import { calculateAllIndicators } from '@/lib/technical-indicators';
import { format } from 'date-fns';

// Define the securities to track
const SECURITIES = {
  // Major indices (top priority)
  majorIndices: [
    'SPY', 'QQQ'
  ],
  // Top 16 SP500 companies by market cap (from Finviz)
  sp500: [
    'NVDA', 'MSFT', 'AAPL', 'GOOGL', 'AMZN', 'META', 'AVGO', 'TSLA', 'BRK-B',
    'JPM', 'WMT', 'V', 'LLY', 'ORCL', 'MA', 'NFLX'
  ],
  // Sector ETFs
  sectors: [
    'XLK', 'XLF', 'XLV', 'XLI', 'XLE', 'XLP', 'XLY', 'XLB', 'XLU', 'XLRE', 'XLC'
  ],
  // Other important indices and commodities
  others: [
    'IBIT', 'GLD', 'SMH', 'CL=F', '^VIX', 'IWM', 'DIA'
  ]
};

interface SecurityData {
  symbol: string;
  data: any[];
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

export default function Dashboard() {
  const [securitiesData, setSecuritiesData] = useState<SecurityData[]>([]);
  const [loading, setLoading] = useState(true);

  // Combine all securities (major indices first, then others)
  const allSecurities = [...SECURITIES.majorIndices, ...SECURITIES.sp500, ...SECURITIES.sectors, ...SECURITIES.others];

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      const dataPromises = allSecurities.map(async (symbol) => {
        try {
          // Simulate the useStockData hook behavior
          const response = await fetch(`/api/stock/${symbol}`);
          if (!response.ok) {
            throw new Error(`Failed to fetch ${symbol}`);
          }
          const data = await response.json();
          return {
            symbol,
            data: data.data || [],
            loading: false,
            error: null,
            lastUpdated: data.lastUpdated || new Date().toISOString()
          };
        } catch (error) {
          return {
            symbol,
            data: [],
            loading: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            lastUpdated: null
          };
        }
      });

      const results = await Promise.all(dataPromises);
      setSecuritiesData(results);
      setLoading(false);
    };

    fetchAllData();
  }, []);

  const getIndicatorValue = (data: any[], indicatorKey: string): number | null => {
    if (!data || data.length === 0) return null;
    const indicators = calculateAllIndicators(data);
    const value = indicators[indicatorKey as keyof typeof indicators];
    // Handle pivot points object
    if (indicatorKey === 'pivotPoints' && typeof value === 'object') {
      return null; // We're not showing pivot points in this dashboard
    }
    return typeof value === 'number' ? value : null;
  };

  const getCurrentPrice = (data: any[]) => {
    return data && data.length > 0 ? data[0].close : null;
  };

  const getPriceChange = (data: any[]) => {
    if (!data || data.length < 2) return { change: null, changePercent: null };
    const current = data[0];
    const previous = data[1];
    const change = current.close - previous.close;
    const changePercent = (change / previous.close) * 100;
    return { change, changePercent };
  };

  const renderIndicatorCell = (value: number | null, isVolatility = false, isRSI = false, isVolume = false, currentPrice: number | null = null) => {
    if (value === null) return <span className="text-gray-400">N/A</span>;
    
    let displayValue = '';
    let colorClass = 'text-gray-900';
    
    if (isVolatility) {
      displayValue = `${value.toFixed(2)} pts`;
    } else if (isRSI) {
      displayValue = value.toFixed(1);
      if (value >= 70) colorClass = 'text-red-600';
      else if (value <= 30) colorClass = 'text-green-600';
    } else if (isVolume) {
      displayValue = `${(value / 1000000).toFixed(1)}M`;
    } else {
      displayValue = `$${value.toLocaleString()}`;
      // Color code moving averages based on current price
      if (currentPrice !== null) {
        if (value > currentPrice) {
          colorClass = 'text-red-600'; // Price below MA (bearish)
        } else if (value < currentPrice) {
          colorClass = 'text-green-600'; // Price above MA (bullish)
        }
      }
    }
    
    return <span className={colorClass}>{displayValue}</span>;
  };

  const renderPriceCell = (data: any[]) => {
    const price = getCurrentPrice(data);
    const { change, changePercent } = getPriceChange(data);
    
    if (price === null) return <span className="text-gray-400">N/A</span>;
    
    return (
      <div>
        <div className="font-bold">${price.toLocaleString()}</div>
        {change !== null && changePercent !== null && (
          <div className={`text-sm ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {change >= 0 ? '+' : ''}{change.toFixed(2)} ({change >= 0 ? '+' : ''}{changePercent.toFixed(2)}%)
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white text-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Technical Indicators Dashboard
          </h1>
          <p className="text-gray-600 text-lg mb-4">
            Comprehensive view of technical indicators across major securities
          </p>
          
          {/* Navigation */}
          <div className="mb-6 flex gap-4">
            <a
              href="/"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              📈 Stock Analysis
            </a>
            <a
              href="/market-profile"
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
            >
              📊 SPX Market Profile
            </a>
          </div>
        </div>

        {/* Dashboard Table */}
        <div className="overflow-x-auto">
          <table className="w-full bg-white rounded-lg shadow-lg">
            <thead className="bg-gray-100 sticky top-0">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-bold text-gray-900 border-b">Symbol</th>
                <th className="px-4 py-3 text-left text-sm font-bold text-gray-900 border-b">Price</th>
                <th className="px-4 py-3 text-left text-sm font-bold text-gray-900 border-b">5D SMA</th>
                <th className="px-4 py-3 text-left text-sm font-bold text-gray-900 border-b">8D EMA</th>
                <th className="px-4 py-3 text-left text-sm font-bold text-gray-900 border-b">10D SMA</th>
                <th className="px-4 py-3 text-left text-sm font-bold text-gray-900 border-b">20D SMA</th>
                <th className="px-4 py-3 text-left text-sm font-bold text-gray-900 border-b">21D EMA</th>
                <th className="px-4 py-3 text-left text-sm font-bold text-gray-900 border-b">50D SMA</th>
                <th className="px-4 py-3 text-left text-sm font-bold text-gray-900 border-b">100D SMA</th>
                <th className="px-4 py-3 text-left text-sm font-bold text-gray-900 border-b">200D SMA</th>
                <th className="px-4 py-3 text-left text-sm font-bold text-gray-900 border-b">14D ATR</th>
                <th className="px-4 py-3 text-left text-sm font-bold text-gray-900 border-b">20D ADR</th>
                <th className="px-4 py-3 text-left text-sm font-bold text-gray-900 border-b">14D RSI</th>
                <th className="px-4 py-3 text-left text-sm font-bold text-gray-900 border-b">20D Vol</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {securitiesData.map((security) => {
                const currentPrice = getCurrentPrice(security.data);
                
                return (
                  <tr key={security.symbol} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-bold text-gray-900 border-r">
                      {security.symbol}
                    </td>
                    <td className="px-4 py-3 text-sm border-r">
                      {security.error ? (
                        <span className="text-red-500">Error</span>
                      ) : (
                        renderPriceCell(security.data)
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm border-r">
                      {renderIndicatorCell(getIndicatorValue(security.data, 'sma5'), false, false, false, currentPrice)}
                    </td>
                    <td className="px-4 py-3 text-sm border-r">
                      {renderIndicatorCell(getIndicatorValue(security.data, 'ema8'), false, false, false, currentPrice)}
                    </td>
                    <td className="px-4 py-3 text-sm border-r">
                      {renderIndicatorCell(getIndicatorValue(security.data, 'sma10'), false, false, false, currentPrice)}
                    </td>
                    <td className="px-4 py-3 text-sm border-r">
                      {renderIndicatorCell(getIndicatorValue(security.data, 'sma20'), false, false, false, currentPrice)}
                    </td>
                    <td className="px-4 py-3 text-sm border-r">
                      {renderIndicatorCell(getIndicatorValue(security.data, 'ema21'), false, false, false, currentPrice)}
                    </td>
                    <td className="px-4 py-3 text-sm border-r">
                      {renderIndicatorCell(getIndicatorValue(security.data, 'sma50'), false, false, false, currentPrice)}
                    </td>
                    <td className="px-4 py-3 text-sm border-r">
                      {renderIndicatorCell(getIndicatorValue(security.data, 'sma100'), false, false, false, currentPrice)}
                    </td>
                    <td className="px-4 py-3 text-sm border-r">
                      {renderIndicatorCell(getIndicatorValue(security.data, 'sma200'), false, false, false, currentPrice)}
                    </td>
                    <td className="px-4 py-3 text-sm border-r">
                      {renderIndicatorCell(getIndicatorValue(security.data, 'atr14'), true)}
                    </td>
                    <td className="px-4 py-3 text-sm border-r">
                      {renderIndicatorCell(getIndicatorValue(security.data, 'adr20'), true)}
                    </td>
                    <td className="px-4 py-3 text-sm border-r">
                      {renderIndicatorCell(getIndicatorValue(security.data, 'rsi14'), false, true)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {renderIndicatorCell(getIndicatorValue(security.data, 'volumeSMA20'), false, false, true)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Legend</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-semibold">Moving Averages:</span>
              <ul className="mt-1 space-y-1">
                <li>• <span className="text-red-600">Red</span> = Price below indicator (bearish)</li>
                <li>• <span className="text-green-600">Green</span> = Price above indicator (bullish)</li>
              </ul>
            </div>
            <div>
              <span className="font-semibold">RSI:</span>
              <ul className="mt-1 space-y-1">
                <li>• <span className="text-red-600">Red</span> = Overbought (≥70)</li>
                <li>• <span className="text-green-600">Green</span> = Oversold (≤30)</li>
              </ul>
            </div>
            <div>
              <span className="font-semibold">Price Change:</span>
              <ul className="mt-1 space-y-1">
                <li>• <span className="text-green-600">Green</span> = Positive change</li>
                <li>• <span className="text-red-600">Red</span> = Negative change</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Securities Summary */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="p-4 bg-yellow-50 rounded-lg">
            <h3 className="text-lg font-semibold text-yellow-900 mb-2">Major Indices</h3>
            <p className="text-yellow-700 text-sm">SPY, QQQ - Market benchmarks</p>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Top 16 SP500 Companies</h3>
            <p className="text-blue-700 text-sm">Market cap leaders including NVDA, MSFT, AAPL, GOOGL, AMZN, META, AVGO, TSLA, ORCL, MA, NFLX, etc.</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <h3 className="text-lg font-semibold text-green-900 mb-2">Sector ETFs</h3>
            <p className="text-green-700 text-sm">All 11 SPDR sector ETFs (XLK, XLF, XLV, etc.)</p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <h3 className="text-lg font-semibold text-purple-900 mb-2">Other Indices</h3>
            <p className="text-purple-700 text-sm">IBIT, GLD, SMH, Crude, VIX, and major ETFs</p>
          </div>
        </div>
      </div>
    </main>
  );
}
