'use client';

import { useState } from 'react';
import { useStockData } from '@/hooks/useStockData';
import SPXTable from '@/components/SPXTable';
import { format } from 'date-fns';
import { calculateAllIndicators } from '@/lib/technical-indicators';

export default function Home() {
  const [symbol, setSymbol] = useState('SPX');
  const { data, loading, error, lastUpdated } = useStockData(symbol);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const searchSymbol = (formData.get('symbol') as string || 'SPX').toUpperCase();
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
          
          {/* Search Form */}
          <form onSubmit={handleSearch} className="mb-4">
            <div className="flex gap-2 max-w-md">
              <input
                type="text"
                name="symbol"
                placeholder="Enter stock symbol (e.g., TSLA, AAPL, SPX)"
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
                      { key: 'sma200', label: '200D SMA', value: indicators.sma200 }
                    ];
                    
                    return indicatorList.map(({ key, label, value }) => {
                      let rowClass = 'bg-white';
                      let valueColor = 'text-gray-900';
                      
                      if (value !== null) {
                        if (value > currentPrice) {
                          rowClass = 'bg-red-50';
                          valueColor = 'text-red-600';
                        } else if (value < currentPrice) {
                          rowClass = 'bg-green-50';
                          valueColor = 'text-green-600';
                        }
                      }
                      
                      return (
                        <tr key={key} className={`hover:bg-gray-50 ${rowClass}`} style={{backgroundColor: value !== null && value > currentPrice ? '#fef2f2' : value !== null && value < currentPrice ? '#f0fdf4' : 'white'}}>
                          <td className="px-4 py-3 text-sm font-medium" style={{color: value !== null && value > currentPrice ? '#dc2626' : value !== null && value < currentPrice ? '#16a34a' : '#111827'}}>{label}</td>
                          <td className={`px-4 py-3 text-sm font-bold ${valueColor}`} style={{color: value !== null && value > currentPrice ? '#dc2626' : value !== null && value < currentPrice ? '#16a34a' : '#111827'}}>
                            {value === null ? 'N/A' : `$${value.toLocaleString()}`}
                          </td>
                        </tr>
                      );
                    });
                  })()}
                </tbody>
              </table>
            </div>
            <div className="mt-2 text-xs text-gray-600">
              Current Price: <span className="text-gray-900 font-medium">${data[0]?.close?.toLocaleString()}</span>
              <span className="ml-4 text-gray-600">• <span className="text-red-600">Red</span> = Above • <span className="text-green-600">Green</span> = Below</span>
            </div>
          </div>
        )}

        {/* Data Table */}
        <SPXTable data={data} loading={loading} />
      </div>
    </main>
  );
}
