'use client';

import { useSPXData } from '@/hooks/useSPXData';
import SPXTable from '@/components/SPXTable';
import { format } from 'date-fns';

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
            Historical OHLC data with interactive column filtering
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

        {/* Stats Summary */}
        {data.length > 0 && (
          <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gray-800 p-4 rounded-lg">
              <h3 className="text-gray-400 text-sm font-medium">Latest Close</h3>
              <p className="text-2xl font-bold text-white">
                ${data[0]?.close?.toLocaleString()}
              </p>
            </div>
                         <div className="bg-gray-800 p-4 rounded-lg">
               <h3 className="text-gray-400 text-sm font-medium">Today&apos;s Change</h3>
              <p className={`text-2xl font-bold ${
                data[0]?.change && data[0].change > 0 ? 'text-green-400' : 
                data[0]?.change && data[0].change < 0 ? 'text-red-400' : 'text-white'
              }`}>
                {data[0]?.change && data[0].change > 0 ? '+' : ''}{data[0]?.change?.toFixed(2)}
              </p>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg">
              <h3 className="text-gray-400 text-sm font-medium">Change %</h3>
              <p className={`text-2xl font-bold ${
                data[0]?.changePercent && data[0].changePercent > 0 ? 'text-green-400' : 
                data[0]?.changePercent && data[0].changePercent < 0 ? 'text-red-400' : 'text-white'
              }`}>
                {data[0]?.changePercent && data[0].changePercent > 0 ? '+' : ''}{data[0]?.changePercent?.toFixed(2)}%
              </p>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg">
              <h3 className="text-gray-400 text-sm font-medium">Data Points</h3>
              <p className="text-2xl font-bold text-white">
                {data.length.toLocaleString()}
              </p>
            </div>
          </div>
        )}

        {/* Data Table */}
        <SPXTable data={data} loading={loading} />
      </div>
    </main>
  );
}
