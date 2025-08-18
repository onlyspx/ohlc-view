'use client';

import { useSPXData } from '@/hooks/useSPXData';
import SPXTable from '@/components/SPXTable';
import { format } from 'date-fns';
import { calculateAllIndicators } from '@/lib/technical-indicators';

export default function Home() {
  const { data, loading, error, lastUpdated } = useSPXData();

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            S&P 500 (SPX) Daily Data
          </h1>
          <p className="text-gray-400 text-lg">
            Historical OHLC data with technical indicators
          </p>
          {lastUpdated && (
            <p className="text-gray-500 text-sm mt-2">
              Last updated: {format(new Date(lastUpdated), 'MMM dd, yyyy HH:mm:ss')}
            </p>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-900 border border-red-700 rounded-lg">
            <h3 className="text-red-200 font-semibold mb-2">Error Loading Data</h3>
            <p className="text-red-300">{error}</p>
          </div>
        )}

        {/* Technical Indicators Table */}
        {data.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-white mb-4">Technical Indicators</h2>
            <div className="bg-white rounded-lg overflow-hidden shadow-lg" style={{backgroundColor: 'white'}}>
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Indicator</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Value</th>
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
                        <tr key={key} className={`hover:bg-gray-50 ${rowClass}`} style={{backgroundColor: value > currentPrice ? '#fef2f2' : value < currentPrice ? '#f0fdf4' : 'white'}}>
                          <td className="px-4 py-3 text-sm font-medium" style={{color: value > currentPrice ? '#dc2626' : value < currentPrice ? '#16a34a' : '#111827'}}>{label}</td>
                          <td className={`px-4 py-3 text-sm font-bold ${valueColor}`} style={{color: value > currentPrice ? '#dc2626' : value < currentPrice ? '#16a34a' : '#111827'}}>
                            {value === null ? 'N/A' : `$${value.toLocaleString()}`}
                          </td>
                        </tr>
                      );
                    });
                  })()}
                </tbody>
              </table>
            </div>
            <div className="mt-2 text-xs text-gray-400">
              Current Price: <span className="text-white font-medium">${data[0]?.close?.toLocaleString()}</span>
              <span className="ml-4 text-gray-400">• <span className="text-red-600">Red</span> = Above • <span className="text-green-600">Green</span> = Below</span>
            </div>
          </div>
        )}

        {/* Data Table */}
        <SPXTable data={data} loading={loading} />
      </div>
    </main>
  );
}
