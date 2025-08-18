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

        {/* Technical Indicators */}
        {data.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-white mb-4">Technical Indicators</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
              {(() => {
                const indicators = calculateAllIndicators(data);
                const currentPrice = data[0]?.close || 0;
                
                return [
                  { key: 'sma5', label: '5D SMA', value: indicators.sma5 },
                  { key: 'ema8', label: '8D EMA', value: indicators.ema8 },
                  { key: 'sma10', label: '10D SMA', value: indicators.sma10 },
                  { key: 'sma20', label: '20D SMA', value: indicators.sma20 },
                  { key: 'ema21', label: '21D EMA', value: indicators.ema21 },
                  { key: 'sma50', label: '50D SMA', value: indicators.sma50 },
                  { key: 'sma100', label: '100D SMA', value: indicators.sma100 },
                  { key: 'sma200', label: '200D SMA', value: indicators.sma200 }
                ].map(({ key, label, value }) => (
                  <div key={key} className="bg-gray-800 p-3 rounded-lg">
                    <h3 className="text-gray-400 text-xs font-medium mb-1">{label}</h3>
                    <p className={`text-lg font-bold ${
                      value === null ? 'text-gray-500' :
                      value > currentPrice ? 'text-green-400' :
                      value < currentPrice ? 'text-red-400' : 'text-white'
                    }`}>
                      {value === null ? 'N/A' : `$${value.toLocaleString()}`}
                    </p>
                  </div>
                ));
              })()}
            </div>
          </div>
        )}

        {/* Data Table */}
        <SPXTable data={data} loading={loading} />
      </div>
    </main>
  );
}
