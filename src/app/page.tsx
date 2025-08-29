'use client';

import { useState } from 'react';
import { useStockData } from '@/hooks/useStockData';
import SPXTable from '@/components/SPXTable';
import { format } from 'date-fns';
import { calculateAllIndicators } from '@/lib/technical-indicators';

export default function Home() {
  const [symbol, setSymbol] = useState('SPY');
  const { data, loading, error, lastUpdated } = useStockData(symbol);

  // Debug logging
  console.log('Current symbol:', symbol);
  console.log('Data length:', data.length);
  console.log('First data item:', data[0]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const searchSymbol = (formData.get('symbol') as string || 'SPY').toUpperCase();
    setSymbol(searchSymbol);
  };

  return (
    <main className="min-h-screen bg-white text-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Stock Technical Analysis
          </h1>
          <p className="text-gray-600 text-lg mb-4">
            Historical OHLC data with technical indicators for any stock
          </p>
          
          {/* Navigation */}
          <div className="mb-6 flex gap-4">
                    <a
          href="/dashboard"
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors"
        >
          📊 Market Dashboard
        </a>
        <a
          href="/ai-stocks"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          🤖 AI Stocks
        </a>
            <a
              href="/market-profile"
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
            >
              📊 SPX Market Profile
            </a>
          </div>
          
          {/* Search Form */}
          <form onSubmit={handleSearch} className="mb-4">
            <div className="flex gap-2 max-w-md">
              <input
                type="text"
                name="symbol"
                placeholder="Enter stock symbol (e.g., TSLA, AAPL, SPY)"
                defaultValue={symbol}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Search
              </button>
            </div>
          </form>
          
          {lastUpdated && (
            <p className="text-gray-500 text-sm">
              Last updated: {format(new Date(lastUpdated), 'MMM dd, yyyy HH:mm:ss')}
            </p>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="mb-6 flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-300 rounded-lg">
            <h3 className="text-red-800 font-semibold mb-2">Error Loading Data</h3>
            <p className="text-red-700">{error}</p>
          </div>
        )}

                {/* Current Price Display */}
        {data && data.length > 0 && data[0] && (
          <div className="mb-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {symbol} Current Price: <span className="text-4xl font-bold text-gray-900">
                  {data[0].close ? `$${data[0].close.toLocaleString()}` : 'Loading...'}
                </span>
                {data[0].change !== undefined && data[0].changePercent !== undefined && (
                  <span className={`text-lg font-semibold ml-3 ${data[0].change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ({data[0].change >= 0 ? '+' : ''}{data[0].change.toFixed(2)} {data[0].changePercent >= 0 ? '+' : ''}{data[0].changePercent.toFixed(2)}%)
                  </span>
                )}
              </h2>
            </div>
          </div>
        )}

        {/* Technical Indicators Table */}
        {data.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Technical Indicators for {symbol}
            </h2>
            <div className="bg-white rounded-lg overflow-hidden shadow-lg" style={{backgroundColor: 'white'}}>
              <table className="w-full">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-bold text-black">Indicator</th>
                    <th className="px-4 py-3 text-left text-sm font-bold text-black">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {(() => {
                    const indicators = calculateAllIndicators(data);
                    const currentPrice = data[0]?.close || 0;
                    
                    // Define indicators in order (shortest to longest period)
                    const indicatorList = [
                      { key: 'sma5', label: '5D SMA', value: indicators.sma5 },
                      { key: 'ema8', label: '8D EMA', value: indicators.ema8 },
                      { key: 'sma10', label: '10D SMA', value: indicators.sma10 },
                      { key: 'sma20', label: '20D SMA', value: indicators.sma20 },
                      { key: 'ema21', label: '21D EMA', value: indicators.ema21 },
                      { key: 'sma50', label: '50D SMA', value: indicators.sma50 },
                      { key: 'sma100', label: '100D SMA', value: indicators.sma100 },
                      { key: 'sma200', label: '200D SMA', value: indicators.sma200 },
                      { key: 'atr14', label: '14D ATR', value: indicators.atr14, isVolatility: true },
                      { key: 'adr20', label: '20D ADR', value: indicators.adr20, isVolatility: true },
                      { key: 'rsi14', label: '14D RSI', value: indicators.rsi14, isRSI: true },
                      { key: 'volumeSMA20', label: '20D Vol SMA', value: indicators.volumeSMA20, isVolume: true }
                    ];
                    
                    return indicatorList.map(({ key, label, value, isVolatility, isRSI, isVolume }) => {
                      let rowClass = 'bg-white';
                      let valueColor = 'text-gray-900';
                      
                      if (value !== null && !isVolatility && !isRSI && !isVolume) {
                        if (value > currentPrice) {
                          rowClass = 'bg-red-50';
                          valueColor = 'text-red-600';
                        } else if (value < currentPrice) {
                          rowClass = 'bg-green-50';
                          valueColor = 'text-green-600';
                        }
                      }
                      
                      // RSI color coding
                      if (isRSI && value !== null) {
                        if (value >= 70) {
                          valueColor = 'text-red-600'; // Overbought
                        } else if (value <= 30) {
                          valueColor = 'text-green-600'; // Oversold
                        }
                      }
                      
                      return (
                        <tr key={key} className={`hover:bg-gray-50 ${rowClass}`} style={{backgroundColor: value !== null && !isVolatility && !isRSI && !isVolume && value > currentPrice ? '#fef2f2' : value !== null && !isVolatility && !isRSI && !isVolume && value < currentPrice ? '#f0fdf4' : 'white'}}>
                          <td className="px-4 py-3 text-sm font-medium" style={{color: value !== null && !isVolatility && !isRSI && !isVolume && value > currentPrice ? '#dc2626' : value !== null && !isVolatility && !isRSI && !isVolume && value < currentPrice ? '#16a34a' : '#111827'}}>{label}</td>
                          <td className={`px-4 py-3 text-sm font-bold ${valueColor}`} style={{color: isRSI && value !== null ? (value >= 70 ? '#dc2626' : value <= 30 ? '#16a34a' : '#111827') : valueColor}}>
                            {value === null ? 'N/A' : 
                              isVolatility ? `${value.toFixed(2)} pts` : 
                              isRSI ? `${value.toFixed(1)}` :
                              isVolume ? `${(value / 1000000).toFixed(1)}M` :
                              `$${value.toLocaleString()}`
                            }
                          </td>
                        </tr>
                      );
                    });
                  })()}
                </tbody>
              </table>
            </div>
            <div className="mt-2 text-xs text-gray-600">
              <span className="text-gray-600">• <span className="text-red-600">Red</span> = Above • <span className="text-green-600">Green</span> = Below</span>
            </div>
          </div>
        )}

        {/* Pivot Points Table */}
        {data.length > 0 && (() => {
          const indicators = calculateAllIndicators(data);
          return indicators.pivotPoints;
        })() && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Pivot Points for {symbol}
            </h2>
            <div className="bg-white rounded-lg overflow-hidden shadow-lg" style={{backgroundColor: 'white'}}>
              <table className="w-full">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-bold text-black">Level</th>
                    <th className="px-4 py-3 text-left text-sm font-bold text-black">Price</th>
                    <th className="px-4 py-3 text-left text-sm font-bold text-black">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {(() => {
                    const indicators = calculateAllIndicators(data);
                    const { pp, r1, r2, s1, s2 } = indicators.pivotPoints || {};
                    const currentPrice = data[0]?.close || 0;
                    
                    const pivotLevels = [
                      { key: 'r2', label: 'Resistance 2 (R2)', value: r2, type: 'resistance' },
                      { key: 'r1', label: 'Resistance 1 (R1)', value: r1, type: 'resistance' },
                      { key: 'pp', label: 'Pivot Point (PP)', value: pp, type: 'pivot' },
                      { key: 's1', label: 'Support 1 (S1)', value: s1, type: 'support' },
                      { key: 's2', label: 'Support 2 (S2)', value: s2, type: 'support' }
                    ];
                    
                    return pivotLevels.map(({ key, label, value, type }) => {
                      let status = '';
                      let statusColor = 'text-gray-600';
                      
                      if (value !== null && value !== undefined) {
                        if (currentPrice > value) {
                          status = 'Above';
                          statusColor = 'text-green-600';
                        } else if (currentPrice < value) {
                          status = 'Below';
                          statusColor = 'text-red-600';
                        } else {
                          status = 'At Level';
                          statusColor = 'text-blue-600';
                        }
                      }
                      
                      return (
                        <tr key={key} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{label}</td>
                          <td className="px-4 py-3 text-sm font-bold text-gray-900">
                            {value === null || value === undefined ? 'N/A' : `$${value.toLocaleString()}`}
                          </td>
                          <td className={`px-4 py-3 text-sm font-medium ${statusColor}`}>
                            {value === null || value === undefined ? 'N/A' : status}
                          </td>
                        </tr>
                      );
                    });
                  })()}
                </tbody>
              </table>
            </div>
            <div className="mt-2 text-xs text-gray-600">
              <span className="text-gray-600">• Pivot Points based on previous day's High, Low, Close • <span className="text-green-600">Above</span> = Bullish • <span className="text-red-600">Below</span> = Bearish</span>
            </div>
          </div>
        )}

        {/* Data Table */}
        <SPXTable data={data} loading={loading} />
      </div>
    </main>
  );
}
