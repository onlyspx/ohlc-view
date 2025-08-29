'use client';

import { useState, useEffect } from 'react';
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
  
  // Local state for configuration changes (not applied until save)
  const [localConfig, setLocalConfig] = useState<DashboardConfig>(config);
  const [hasChanges, setHasChanges] = useState(false);

  // Update local config when prop changes
  useEffect(() => {
    if (isOpen) {
      setLocalConfig(config);
      setHasChanges(false);
    }
  }, [config, isOpen]);

  if (!isOpen) return null;

  const handleAddTicker = () => {
    if (newTicker.trim()) {
      const upperTicker = newTicker.trim().toUpperCase();
      if (!localConfig.tickers.includes(upperTicker)) {
        const updatedConfig = {
          ...localConfig,
          tickers: [...localConfig.tickers, upperTicker]
        };
        setLocalConfig(updatedConfig);
        setHasChanges(true);
        setNewTicker('');
      }
    }
  };

  const handleToggleTicker = (ticker: string) => {
    const updatedTickers = localConfig.tickers.filter(t => t !== ticker);
    // Prevent removing all tickers
    if (updatedTickers.length === 0) {
      alert('Cannot remove all tickers. Please keep at least one.');
      return;
    }
    
    const updatedConfig = {
      ...localConfig,
      tickers: updatedTickers
    };
    setLocalConfig(updatedConfig);
    setHasChanges(true);
  };

  const handleAddMA = () => {
    const period = parseInt(newMAPeriod);
    if (period > 0) {
      const key = `${newMAType.toLowerCase()}${period}`;
      const label = `${period}D ${newMAType}`;
      
      const newMA = {
        key,
        label,
        period,
        type: newMAType,
        enabled: true
      };

      const updatedConfig = {
        ...localConfig,
        movingAverages: [...localConfig.movingAverages, newMA]
      };
      setLocalConfig(updatedConfig);
      setHasChanges(true);
      setNewMAPeriod('');
    }
  };

  const handleToggleMA = (key: string) => {
    const updatedMAs = localConfig.movingAverages.map(ma => 
      ma.key === key ? { ...ma, enabled: !ma.enabled } : ma
    );
    
    // Prevent disabling all moving averages
    if (updatedMAs.filter(ma => ma.enabled).length === 0) {
      alert('Cannot disable all moving averages. Please keep at least one enabled.');
      return;
    }
    
    const updatedConfig = {
      ...localConfig,
      movingAverages: updatedMAs
    };
    setLocalConfig(updatedConfig);
    setHasChanges(true);
  };

  const handleReset = () => {
    const defaultConfig = getDefaultConfig();
    setLocalConfig(defaultConfig);
    setHasChanges(true);
  };

  const handleSave = () => {
    saveDashboardConfig(localConfig);
    onConfigChange(localConfig);
    setHasChanges(false);
    onClose();
  };

  const handleCancel = () => {
    setLocalConfig(config);
    setHasChanges(false);
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
              {localConfig.tickers.map((ticker) => (
                <div key={ticker} className="flex justify-between items-center p-3 border-b border-gray-100 hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={true}
                      onChange={() => handleToggleTicker(ticker)}
                      className="rounded"
                    />
                    <span className="font-medium">{ticker}</span>
                  </div>
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
              {localConfig.movingAverages.map((ma) => (
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
                checked={localConfig.showVolatility}
                onChange={(e) => {
                  setLocalConfig({ ...localConfig, showVolatility: e.target.checked });
                  setHasChanges(true);
                }}
                className="rounded"
              />
              <span>Show Volatility (ATR, ADR)</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={localConfig.showRSI}
                onChange={(e) => {
                  setLocalConfig({ ...localConfig, showRSI: e.target.checked });
                  setHasChanges(true);
                }}
                className="rounded"
              />
              <span>Show RSI</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={localConfig.showVolume}
                onChange={(e) => {
                  setLocalConfig({ ...localConfig, showVolume: e.target.checked });
                  setHasChanges(true);
                }}
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
              onClick={handleCancel}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!hasChanges}
              className={`px-4 py-2 rounded-lg transition-colors ${
                hasChanges 
                  ? 'bg-green-600 text-white hover:bg-green-700' 
                  : 'bg-gray-400 text-gray-200 cursor-not-allowed'
              }`}
            >
              {hasChanges ? 'Save Configuration' : 'No Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
