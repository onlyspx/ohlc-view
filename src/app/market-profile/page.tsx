'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { SPXIntradayData } from '@/types/spx';
import { calculateMarketProfile, getCandlestickSummary, MarketProfileAnalysis, CandlestickPattern } from '@/lib/market-profile';

export default function MarketProfilePage() {
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [intradayData, setIntradayData] = useState<SPXIntradayData[]>([]);
  const [marketProfile, setMarketProfile] = useState<MarketProfileAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchIntradayData = async (date: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/spx/intraday/${date}`);
      if (!response.ok) {
        throw new Error('Failed to fetch intraday data');
      }
      
      const data = await response.json();
      setIntradayData(data.data);
      
      // Calculate market profile analysis
      if (data.data.length > 0) {
        try {
          const analysis = calculateMarketProfile(data.data);
          setMarketProfile(analysis);
        } catch (analysisError) {
          console.error('Error calculating market profile:', analysisError);
          setMarketProfile(null);
        }
      } else {
        setMarketProfile(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setIntradayData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIntradayData(selectedDate);
  }, [selectedDate]);

  // Calculate basic statistics
  const stats = intradayData.length > 0 ? {
    high: Math.max(...intradayData.map(d => d.high)),
    low: Math.min(...intradayData.map(d => d.low)),
    volume: intradayData.reduce((sum, d) => sum + d.volume, 0),
    firstPrice: intradayData[0]?.open || 0,
    lastPrice: intradayData[intradayData.length - 1]?.close || 0,
  } : null;

  return (
    <main className="min-h-screen bg-white text-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            SPX Market Profile
          </h1>
          <p className="text-gray-600 text-lg mb-4">
            Intraday analysis and market profile for S&P 500 (5-minute intervals)
          </p>
          
          {/* Navigation */}
          <div className="mb-6">
            <a
              href="/"
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              ← Back to Daily Analysis
            </a>
          </div>
          
          <div className="mb-4">
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
              Select Date
            </label>
            <input
              type="date"
              id="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {loading && (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-300 rounded-lg">
            <h3 className="text-red-800 font-semibold mb-2">Error Loading Data</h3>
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {stats && (
          <div className="mb-6 grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-blue-600">Day High</h3>
              <p className="text-xl font-bold text-blue-900">${stats.high.toFixed(2)}</p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-red-600">Day Low</h3>
              <p className="text-xl font-bold text-red-900">${stats.low.toFixed(2)}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-green-600">Range</h3>
              <p className="text-xl font-bold text-green-900">{(stats.high - stats.low).toFixed(2)} pts</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-purple-600">Total Volume</h3>
              <p className="text-xl font-bold text-purple-900">{(stats.volume / 1000000).toFixed(1)}M</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-yellow-600">Net Change</h3>
              <p className={`text-xl font-bold ${stats.lastPrice >= stats.firstPrice ? 'text-green-900' : 'text-red-900'}`}>
                {(stats.lastPrice - stats.firstPrice).toFixed(2)} pts
              </p>
            </div>
          </div>
        )}

        {/* Market Profile Analysis */}
        {marketProfile && (
          <div className="mb-8 space-y-6">
            {/* Market Profile Summary */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-semibold mb-4">Market Profile Analysis</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-indigo-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-indigo-600 mb-2">Point of Control</h3>
                  <p className="text-2xl font-bold text-indigo-900">${marketProfile.pointOfControl.toFixed(2)}</p>
                  <p className="text-sm text-indigo-700">Highest volume price level</p>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-green-600 mb-2">Value Area</h3>
                  <p className="text-lg font-bold text-green-900">
                    ${marketProfile.valueArea.high.toFixed(2)} - ${marketProfile.valueArea.low.toFixed(2)}
                  </p>
                  <p className="text-sm text-green-700">70% of volume traded</p>
                </div>
                
                <div className="bg-orange-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-orange-600 mb-2">Profile Type</h3>
                  <p className="text-lg font-bold text-orange-900 capitalize">{marketProfile.profileType}</p>
                  <p className="text-sm text-orange-700">
                    {marketProfile.profileType === 'trend' && 'Tight value area, trending day'}
                    {marketProfile.profileType === 'neutral' && 'Wide value area, balanced day'}
                    {marketProfile.profileType === 'double' && 'Multiple poor highs/lows, double distribution'}
                    {marketProfile.profileType === 'normal' && 'Standard distribution'}
                  </p>
                </div>
              </div>

              {/* Poor Highs and Lows */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-red-600">Poor Highs ({marketProfile.poorHighs.length})</h3>
                  {marketProfile.poorHighs.length > 0 ? (
                    <div className="space-y-2">
                      {marketProfile.poorHighs.map((level, index) => (
                        <div key={index} className="bg-red-50 p-3 rounded border border-red-200">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">${level.price.toFixed(2)}</span>
                            <span className="text-sm text-red-600">Volume: {level.volume.toLocaleString()}</span>
                          </div>
                          <div className="text-xs text-red-500 mt-1">
                            Time: {level.timeSlots.join(', ')}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No poor highs identified</p>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3 text-blue-600">Poor Lows ({marketProfile.poorLows.length})</h3>
                  {marketProfile.poorLows.length > 0 ? (
                    <div className="space-y-2">
                      {marketProfile.poorLows.map((level, index) => (
                        <div key={index} className="bg-blue-50 p-3 rounded border border-blue-200">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">${level.price.toFixed(2)}</span>
                            <span className="text-sm text-blue-600">Volume: {level.volume.toLocaleString()}</span>
                          </div>
                          <div className="text-xs text-blue-500 mt-1">
                            Time: {level.timeSlots.join(', ')}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No poor lows identified</p>
                  )}
                </div>
              </div>

              {/* Single Prints */}
              {marketProfile.singlePrints.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-3 text-purple-600">Single Prints ({marketProfile.singlePrints.length})</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {marketProfile.singlePrints.map((level, index) => (
                      <div key={index} className="bg-purple-50 p-3 rounded border border-purple-200">
                        <div className="text-center">
                          <div className="font-medium">${level.price.toFixed(2)}</div>
                          <div className="text-xs text-purple-600 mt-1">
                            {level.timeSlots[0]}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Candlestick Analysis */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-semibold mb-4">Candlestick Pattern Analysis</h2>
              
              {(() => {
                const summary = getCandlestickSummary(marketProfile.candlestickPatterns);
                return (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-gray-50 p-3 rounded text-center">
                      <div className="text-lg font-bold text-gray-900">{summary.doji}</div>
                      <div className="text-sm text-gray-600">Doji</div>
                    </div>
                    <div className="bg-green-50 p-3 rounded text-center">
                      <div className="text-lg font-bold text-green-900">{summary.hammer}</div>
                      <div className="text-sm text-green-600">Hammer</div>
                    </div>
                    <div className="bg-red-50 p-3 rounded text-center">
                      <div className="text-lg font-bold text-red-900">{summary.shootingStar}</div>
                      <div className="text-sm text-red-600">Shooting Star</div>
                    </div>
                    <div className="bg-yellow-50 p-3 rounded text-center">
                      <div className="text-lg font-bold text-yellow-900">{summary.spinningTop}</div>
                      <div className="text-sm text-yellow-600">Spinning Top</div>
                    </div>
                    <div className="bg-blue-50 p-3 rounded text-center">
                      <div className="text-lg font-bold text-blue-900">{summary.marubozu}</div>
                      <div className="text-sm text-blue-600">Marubozu</div>
                    </div>
                    <div className="bg-green-50 p-3 rounded text-center">
                      <div className="text-lg font-bold text-green-900">{summary.bullish}</div>
                      <div className="text-sm text-green-600">Bullish</div>
                    </div>
                    <div className="bg-red-50 p-3 rounded text-center">
                      <div className="text-lg font-bold text-red-900">{summary.bearish}</div>
                      <div className="text-sm text-red-600">Bearish</div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded text-center">
                      <div className="text-lg font-bold text-gray-900">{marketProfile.candlestickPatterns.length}</div>
                      <div className="text-sm text-gray-600">Total Bars</div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {intradayData.length > 0 && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-semibold mb-4">
                Intraday Data for {format(new Date(selectedDate), 'MMMM dd, yyyy')}
              </h2>
              
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 px-4 py-2 text-left">Time</th>
                      <th className="border border-gray-300 px-4 py-2 text-right">Open</th>
                      <th className="border border-gray-300 px-4 py-2 text-right">High</th>
                      <th className="border border-gray-300 px-4 py-2 text-right">Low</th>
                      <th className="border border-gray-300 px-4 py-2 text-right">Close</th>
                      <th className="border border-gray-300 px-4 py-2 text-right">Volume</th>
                      <th className="border border-gray-300 px-4 py-2 text-right">Range</th>
                      <th className="border border-gray-300 px-4 py-2 text-center">Pattern</th>
                    </tr>
                  </thead>
                  <tbody>
                    {intradayData.map((item, index) => {
                      const range = item.high - item.low;
                      const isGreen = item.close >= item.open;
                      const pattern = marketProfile?.candlestickPatterns[index];
                      
                      const getPatternColor = (type: string) => {
                        switch (type) {
                          case 'doji': return 'bg-gray-100 text-gray-700';
                          case 'hammer': return 'bg-green-100 text-green-700';
                          case 'shooting_star': return 'bg-red-100 text-red-700';
                          case 'spinning_top': return 'bg-yellow-100 text-yellow-700';
                          case 'marubozu': return 'bg-blue-100 text-blue-700';
                          default: return 'bg-gray-50 text-gray-600';
                        }
                      };
                      
                      return (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="border border-gray-300 px-4 py-2 font-mono">{item.timeSlot}</td>
                          <td className="border border-gray-300 px-4 py-2 text-right">${item.open.toFixed(2)}</td>
                          <td className="border border-gray-300 px-4 py-2 text-right">${item.high.toFixed(2)}</td>
                          <td className="border border-gray-300 px-4 py-2 text-right">${item.low.toFixed(2)}</td>
                          <td className={`border border-gray-300 px-4 py-2 text-right font-medium ${isGreen ? 'text-green-600' : 'text-red-600'}`}>
                            ${item.close.toFixed(2)}
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-right text-sm">
                            {item.volume.toLocaleString()}
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-right">
                            {range.toFixed(2)}
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-center">
                            {pattern && (
                              <span 
                                className={`inline-block px-2 py-1 rounded text-xs font-medium ${getPatternColor(pattern.type)}`}
                                title={pattern.description}
                              >
                                {pattern.type.replace('_', ' ')}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              
              <div className="mt-4 text-sm text-gray-600">
                Total Records: {intradayData.length} | Data covers regular trading hours (9:30 AM - 4:00 PM ET)
              </div>
            </div>
          </div>
        )}

        {intradayData.length === 0 && !loading && !error && (
          <div className="text-center py-12">
            <p className="text-gray-500">No intraday data available for this date. Please select a trading day.</p>
          </div>
        )}
      </div>
    </main>
  );
}
