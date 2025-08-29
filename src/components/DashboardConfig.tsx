'use client';

import { useState } from 'react';
import { 
  DashboardConfig, 
  MovingAverage, 
  loadDashboardConfig, 
  saveDashboardConfig, 
  resetDashboardConfig,
  addMovingAverage,
  removeMovingAverage,
  toggleMovingAverage,
  addTicker,
  removeTicker,
  DEFAULT_MOVING_AVERAGES,
  DEFAULT_TICKERS
} from '@/lib/dashboard-config';

interface DashboardConfigProps {
  config: DashboardConfig;
  onConfigChange: (config: DashboardConfig) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function DashboardConfig({ config, onConfigChange, isOpen, onClose }: DashboardConfigProps) {
  const [newTicker, setNewTicker] = useState('');
  const [newMAPeriod, setNewMAPeriod] = useState('');
  const [newMAType, setNewMAType] = useState<'SMA' | 'EMA' | 'WMA'>('SMA');

  if (!isOpen) return null;

  const handleAddTicker = () => {
    if (newTicker.trim()) {
      try {
        const updatedConfig = addTicker(config, newTicker.trim());
        onConfigChange(updatedConfig);
        setNewTicker('');
      } catch (error) {
        console.error('Error adding ticker:', error);
        alert('Error adding ticker. Please try again.');
      }
    }
  };

  const handleRemoveTicker = (ticker: string) => {
    try {
      // Prevent removing all tickers
      if (config.tickers.filter(t => t !== ticker.toUpperCase()).length === 0) {
        alert('Cannot remove all tickers. Please keep at least one.');
        return;
      }
      
      const updatedConfig = removeTicker(config, ticker);
      onConfigChange(updatedConfig);
    } catch (error) {
      console.error('Error removing ticker:', error);
      alert('Error removing ticker. Please try again.');
    }
  };

  const handleAddMA = () => {
    const period = parseInt(newMAPeriod);
    if (period > 0) {
      try {
        const updatedConfig = addMovingAverage(config, period, newMAType);
        onConfigChange(updatedConfig);
        setNewMAPeriod('');
      } catch (error) {
        console.error('Error adding moving average:', error);
        alert('Error adding moving average. Please try again.');
      }
    }
  };

  const handleRemoveMA = (key: string) => {
    try {
      // Prevent removing all moving averages
      if (config.movingAverages.filter(ma => ma.key !== key).length === 0) {
        alert('Cannot remove all moving averages. Please keep at least one.');
        return;
      }
      
      const updatedConfig = removeMovingAverage(config, key);
      onConfigChange(updatedConfig);
    } catch (error) {
      console.error('Error removing moving average:', error);
      alert('Error removing moving average. Please try again.');
    }
  };

  const handleToggleMA = (key: string) => {
    try {
      const updatedConfig = toggleMovingAverage(config, key);
      onConfigChange(updatedConfig);
    } catch (error) {
      console.error('Error toggling moving average:', error);
      alert('Error toggling moving average. Please try again.');
    }
  };

  const handleReset = () => {
    const defaultConfig = resetDashboardConfig();
    onConfigChange(defaultConfig);
  };

  const handleSave = () => {
    saveDashboardConfig(config);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Dashboard Configuration</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            ×
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tickers Configuration */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Tickers</h3>
            
            {/* Add new ticker */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newTicker}
                onChange={(e) => setNewTicker(e.target.value)}
                placeholder="Enter ticker symbol (e.g., AAPL)"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyPress={(e) => e.key === 'Enter' && handleAddTicker()}
              />
              <button
                onClick={handleAddTicker}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add
              </button>
            </div>

            {/* Ticker list */}
            <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
              {config.tickers.map((ticker) => (
                <div key={ticker} className="flex justify-between items-center p-3 border-b border-gray-100 hover:bg-gray-50">
                  <span className="font-medium">{ticker}</span>
                  <button
                    onClick={() => handleRemoveTicker(ticker)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Moving Averages Configuration */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Moving Averages</h3>
            
            {/* Add new MA */}
            <div className="flex gap-2">
              <select
                value={newMAType}
                onChange={(e) => setNewMAType(e.target.value as 'SMA' | 'EMA' | 'WMA')}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="SMA">SMA</option>
                <option value="EMA">EMA</option>
                <option value="WMA">WMA</option>
              </select>
              <input
                type="number"
                value={newMAPeriod}
                onChange={(e) => setNewMAPeriod(e.target.value)}
                placeholder="Period (e.g., 13)"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyPress={(e) => e.key === 'Enter' && handleAddMA()}
              />
              <button
                onClick={handleAddMA}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add
              </button>
            </div>

            {/* MA list */}
            <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
              {config.movingAverages.map((ma) => (
                <div key={ma.key} className="flex justify-between items-center p-3 border-b border-gray-100 hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={ma.enabled}
                      onChange={() => handleToggleMA(ma.key)}
                      className="rounded"
                    />
                    <span className={`font-medium ${ma.enabled ? 'text-gray-900' : 'text-gray-400'}`}>
                      {ma.label}
                    </span>
                  </div>
                  <button
                    onClick={() => handleRemoveMA(ma.key)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Other Settings */}
        <div className="mt-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Display Options</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={config.showVolatility}
                onChange={(e) => onConfigChange({ ...config, showVolatility: e.target.checked })}
                className="rounded"
              />
              <span>Show Volatility (ATR, ADR)</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={config.showRSI}
                onChange={(e) => onConfigChange({ ...config, showRSI: e.target.checked })}
                className="rounded"
              />
              <span>Show RSI</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={config.showVolume}
                onChange={(e) => onConfigChange({ ...config, showVolume: e.target.checked })}
                className="rounded"
              />
              <span>Show Volume</span>
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-200">
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Reset to Defaults
          </button>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Save Configuration
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
