'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RefreshCw, TrendingUp, TrendingDown, Info, RotateCcw } from 'lucide-react';

interface SPYHolding {
  ticker: string;
  name: string;
  weight: number;
  currentPrice: number;
  week52High: number;
  week52Low: number;
  marketCap: number;
  sector: string;
  priceDate: string;
}

interface SPYData {
  currentPrice: number;
  week52High: number;
  week52Low: number;
  lastUpdated: string;
  priceDate: string;
  holdings: SPYHolding[];
  totalWeight: number;
}

export default function SPYSimulator() {
  const [spyData, setSpyData] = useState<SPYData | null>(null);
  const [stockAdjustments, setStockAdjustments] = useState<Record<string, number>>({});
  const [calculatedSPYPrice, setCalculatedSPYPrice] = useState<number>(0);
  const [priceChange, setPriceChange] = useState<number>(0);
  const [priceChangePercent, setPriceChangePercent] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [holdingsCount, setHoldingsCount] = useState<string>('30');

  // Load SPY data and holdings
  useEffect(() => {
    loadSPYData();
  }, [holdingsCount]);

  // Calculate new SPY price when adjustments change
  useEffect(() => {
    if (spyData) {
      calculateNewSPYPrice();
    }
  }, [stockAdjustments, spyData]);

  const loadSPYData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load SPY holdings from the Excel file with configurable count
      const response = await fetch(`/api/spy/holdings?count=${holdingsCount}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to load SPY data');
      }
      
      setSpyData(data);
      setCalculatedSPYPrice(data.currentPrice);
      
      // Initialize stock adjustments to 0 (no change)
      const initialAdjustments: Record<string, number> = {};
      data.holdings.forEach((holding: SPYHolding) => {
        initialAdjustments[holding.ticker] = 0;
      });
      setStockAdjustments(initialAdjustments);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const calculateNewSPYPrice = () => {
    if (!spyData) return;

    let totalWeightedChange = 0;
    
    spyData.holdings.forEach((holding) => {
      const adjustment = stockAdjustments[holding.ticker] || 0;
      const stockChangePercent = adjustment / 100; // Convert percentage to decimal
      const weightedContribution = stockChangePercent * (holding.weight / 100);
      totalWeightedChange += weightedContribution;
    });

    const newPrice = spyData.currentPrice * (1 + totalWeightedChange);
    const change = newPrice - spyData.currentPrice;
    const changePercent = (change / spyData.currentPrice) * 100;

    setCalculatedSPYPrice(newPrice);
    setPriceChange(change);
    setPriceChangePercent(changePercent);
  };

  const handleStockAdjustment = (ticker: string, value: number[]) => {
    setStockAdjustments(prev => ({
      ...prev,
      [ticker]: value[0]
    }));
  };

  const resetAllAdjustments = () => {
    const resetAdjustments: Record<string, number> = {};
    spyData?.holdings.forEach((holding) => {
      resetAdjustments[holding.ticker] = 0;
    });
    setStockAdjustments(resetAdjustments);
  };

  const setStockToATH = (ticker: string) => {
    const holding = spyData?.holdings.find(h => h.ticker === ticker);
    if (holding) {
      const athPercent = ((holding.week52High - holding.currentPrice) / holding.currentPrice) * 100;
      setStockAdjustments(prev => ({
        ...prev,
        [ticker]: athPercent
      }));
    }
  };

  const setStockToATL = (ticker: string) => {
    const holding = spyData?.holdings.find(h => h.ticker === ticker);
    if (holding) {
      const atlPercent = ((holding.week52Low - holding.currentPrice) / holding.currentPrice) * 100;
      setStockAdjustments(prev => ({
        ...prev,
        [ticker]: atlPercent
      }));
    }
  };

  const setAllToATH = () => {
    const athAdjustments: Record<string, number> = {};
    spyData?.holdings.forEach((holding) => {
      const athPercent = ((holding.week52High - holding.currentPrice) / holding.currentPrice) * 100;
      athAdjustments[holding.ticker] = athPercent;
    });
    setStockAdjustments(athAdjustments);
  };

  const setAllToATL = () => {
    const atlAdjustments: Record<string, number> = {};
    spyData?.holdings.forEach((holding) => {
      const atlPercent = ((holding.week52Low - holding.currentPrice) / holding.currentPrice) * 100;
      atlAdjustments[holding.ticker] = atlPercent;
    });
    setStockAdjustments(atlAdjustments);
  };

  const formatPrice = (price: number) => {
    return price.toFixed(2);
  };

  const formatPercent = (percent: number) => {
    return `${percent >= 0 ? '+' : ''}${percent.toFixed(2)}%`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading SPY data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <Info className="h-8 w-8 mx-auto" />
          </div>
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={loadSPYData} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!spyData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">No data available</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">SPY What-If Simulator</h1>
          <p className="text-gray-600">
            Simulate how individual stock movements would impact SPY's price
          </p>
          <div className="mt-2 text-sm text-gray-500">
            Holdings last updated: {new Date(spyData.lastUpdated).toLocaleDateString()}
          </div>
          <div className="mt-1 text-sm text-gray-500">
            Stock prices as of: {spyData.priceDate}
          </div>
        </div>

        {/* SPY Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Current Price</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${formatPrice(spyData.currentPrice)}</div>
              <div className="text-xs mt-2 space-y-1">
                <div className="text-green-600">
                  {formatPercent(((spyData.week52High - spyData.currentPrice) / spyData.currentPrice) * 100)} to YTD High
                </div>
                <div className="text-red-600">
                  {formatPercent(((spyData.week52Low - spyData.currentPrice) / spyData.currentPrice) * 100)} to YTD Low
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">YTD High</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">${formatPrice(spyData.week52High)}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">YTD Low</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">${formatPrice(spyData.week52Low)}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Simulated Price</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${formatPrice(calculatedSPYPrice)}
              </div>
              <div className={`text-sm ${priceChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatPercent(priceChangePercent)} ({formatPrice(priceChange)})
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Global Scenario Buttons */}
        <div className="mb-6 flex justify-center gap-4">
          <Button 
            onClick={setAllToATH} 
            variant="outline" 
            size="sm"
            className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            All to YTD High
          </Button>
          <Button 
            onClick={setAllToATL} 
            variant="outline" 
            size="sm"
            className="bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
          >
            <TrendingDown className="h-4 w-4 mr-2" />
            All to YTD Low
          </Button>
        </div>

        {/* Controls */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Top {holdingsCount === 'all' ? 'All' : holdingsCount} Holdings with Real Data ({spyData.holdings.length})
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Representing {spyData.totalWeight.toFixed(1)}% of SPY index
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Holdings:</label>
              <Select value={holdingsCount} onValueChange={setHoldingsCount}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                  <SelectItem value="150">150</SelectItem>
                  <SelectItem value="all">All</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button 
              onClick={resetAllAdjustments} 
              variant="outline" 
              size="sm"
              className="bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset All
            </Button>
          </div>
        </div>

        {/* Holdings Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {spyData.holdings.map((holding, index) => (
            <Card key={holding.ticker} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg font-semibold">
                      {holding.ticker}
                    </CardTitle>
                    <p className="text-sm text-gray-600 truncate">{holding.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {holding.weight.toFixed(2)}%
                      </Badge>
                    </div>
                  </div>
        <div className="text-right">
          <div className="text-sm font-medium">${formatPrice(holding.currentPrice)}</div>
          <div className="text-xs text-gray-500">
            YTD H: ${formatPrice(holding.week52High)} | YTD L: ${formatPrice(holding.week52Low)}
          </div>
          <div className="text-xs text-gray-400">
            {holding.priceDate}
          </div>
          <div className="text-xs mt-1">
            <span className="text-green-600">
              {formatPercent(((holding.week52High - holding.currentPrice) / holding.currentPrice) * 100)} to ATH
            </span>
            <span className="text-gray-400 mx-1">|</span>
            <span className="text-red-600">
              {formatPercent(((holding.week52Low - holding.currentPrice) / holding.currentPrice) * 100)} to ATL
            </span>
          </div>
        </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Price Adjustment: {formatPercent(stockAdjustments[holding.ticker] || 0)}
                    </label>
                    <Slider
                      value={[stockAdjustments[holding.ticker] || 0]}
                      onValueChange={(value) => handleStockAdjustment(holding.ticker, value)}
                      min={-25}
                      max={25}
                      step={0.1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>-25%</span>
                      <span>0%</span>
                      <span>+25%</span>
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-600">
                    <div className="flex justify-between">
                      <span>Weighted Impact:</span>
                      <span className="font-medium">
                        {formatPercent(((stockAdjustments[holding.ticker] || 0) / 100) * holding.weight)}
                      </span>
                    </div>
                  </div>
                  
                  {/* ATH/ATL/Reset Buttons */}
                  <div className="flex gap-2 pt-2">
                    <Button 
                      onClick={() => setStockToATH(holding.ticker)}
                      variant="outline" 
                      size="sm"
                      className="flex-1 text-xs bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                    >
                      <TrendingUp className="h-3 w-3 mr-1" />
                      ATH
                    </Button>
                    <Button 
                      onClick={() => setStockToATL(holding.ticker)}
                      variant="outline" 
                      size="sm"
                      className="flex-1 text-xs bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
                    >
                      <TrendingDown className="h-3 w-3 mr-1" />
                      ATL
                    </Button>
                    <Button 
                      onClick={() => setStockAdjustments(prev => ({ ...prev, [holding.ticker]: 0 }))}
                      variant="outline" 
                      size="sm"
                      className="text-xs bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
                    >
                      <RotateCcw className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Summary */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Simulation Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-gray-600">Original SPY Price</div>
                <div className="text-lg font-semibold">${formatPrice(spyData.currentPrice)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Simulated SPY Price</div>
                <div className="text-lg font-semibold">${formatPrice(calculatedSPYPrice)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Total Change</div>
                <div className={`text-lg font-semibold ${priceChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatPercent(priceChangePercent)} ({formatPrice(priceChange)})
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
