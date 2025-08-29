'use client';

import { useState, useEffect } from 'react';
// Remove direct Yahoo Finance import - we'll use the API endpoint instead
import { calculateAllIndicators } from '@/lib/technical-indicators';
import { loadDashboardConfig, DashboardConfig } from '@/lib/dashboard-config';
import DashboardConfigComponent from '@/components/DashboardConfig';

interface StockData {
  symbol: string;
  name: string;
  category: string;
  description: string;
  data: any[];
  indicators: any;
  currentPrice: number;
  loading: boolean;
  error: string | null;
}

const AI_STOCKS = [
  // Semiconductors
  { symbol: 'AMD', name: 'AMD', category: 'Semiconductors', description: 'Leading GPU manufacturer for AI training and inference, competing with NVIDIA in data center AI chips.' },
  { symbol: 'ASML', name: 'ASML', category: 'Semiconductors', description: 'Monopoly on EUV lithography machines essential for manufacturing advanced AI chips at 3nm and below.' },
  { symbol: 'AVGO', name: 'Broadcom', category: 'Semiconductors', description: 'Major supplier of networking chips and custom AI accelerators for hyperscale data centers.' },
  { symbol: 'INTC', name: 'Intel', category: 'Semiconductors', description: 'Developing AI accelerators (Gaudi) and advanced chip manufacturing to compete in AI hardware.' },
  { symbol: 'MRVL', name: 'Marvell', category: 'Semiconductors', description: 'Specialized in networking chips and custom silicon solutions for AI infrastructure.' },
  { symbol: 'NVDA', name: 'Nvidia', category: 'Semiconductors', description: 'Dominant leader in AI GPUs and data center chips, powering most AI training and inference.' },
  { symbol: 'TSM', name: 'TSMC', category: 'Semiconductors', description: 'World\'s largest chip manufacturer, producing AI chips for NVIDIA, AMD, and other AI companies.' },
  
  // Cloud Service Providers
  { symbol: 'AMZN', name: 'Amazon', category: 'Cloud Providers', description: 'AWS provides AI/ML services, Bedrock for generative AI, and infrastructure for AI training.' },
  { symbol: 'GOOGL', name: 'Alphabet', category: 'Cloud Providers', description: 'Google Cloud AI services, Gemini models, and TPU chips for AI training and inference.' },
  { symbol: 'IBM', name: 'IBM', category: 'Cloud Providers', description: 'Watson AI platform, enterprise AI solutions, and quantum computing for AI research.' },
  { symbol: 'MSFT', name: 'Microsoft', category: 'Cloud Providers', description: 'Azure AI services, OpenAI partnership, and Copilot AI integration across products.' },
  { symbol: 'NOW', name: 'ServiceNow', category: 'Cloud Providers', description: 'AI-powered workflow automation and enterprise service management solutions.' },
  { symbol: 'ORCL', name: 'Oracle', category: 'Cloud Providers', description: 'Oracle Cloud AI services and enterprise AI applications for business automation.' },
  
  // Servers
  { symbol: 'DELL', name: 'Dell', category: 'Servers', description: 'AI-optimized servers and workstations for machine learning and data center deployments.' },
  { symbol: 'HPE', name: 'HPE', category: 'Servers', description: 'High-performance computing servers and AI infrastructure solutions for enterprise.' },
  { symbol: 'SMCI', name: 'Super Micro', category: 'Servers', description: 'Leading supplier of AI server racks and GPU-optimized systems for data centers.' },
  { symbol: 'VRT', name: 'Vertiv', category: 'Servers', description: 'Critical infrastructure and cooling systems for AI data centers and high-density computing.' },
  
  // Storage
  { symbol: 'MU', name: 'Micron', category: 'Storage', description: 'High-performance memory chips (HBM) and storage solutions for AI training and inference.' },
  { symbol: 'STX', name: 'Seagate', category: 'Storage', description: 'Enterprise storage solutions and data management for AI workloads and big data.' },
  { symbol: 'WDC', name: 'Western Digital', category: 'Storage', description: 'Advanced storage technologies for AI data centers and machine learning applications.' },
  
  // Electronics
  { symbol: 'AMSC', name: 'American Superconductor', category: 'Electronics', description: 'Superconducting materials and power systems for high-efficiency AI data center infrastructure.' },
  { symbol: 'APH', name: 'Amphenol', category: 'Electronics', description: 'High-speed connectors and interconnect solutions for AI servers and networking equipment.' },
  { symbol: 'ETN', name: 'Eaton', category: 'Electronics', description: 'Power management and electrical infrastructure for AI data centers and computing facilities.' },
  { symbol: 'NVT', name: 'nVent', category: 'Electronics', description: 'Thermal management and electrical protection systems for AI computing infrastructure.' },
  
  // Networking
  { symbol: 'ALAB', name: 'Astera Labs', category: 'Networking', description: 'High-speed interconnect chips for AI data centers and GPU-to-GPU communication.' },
  { symbol: 'ANET', name: 'Arista Networks', category: 'Networking', description: 'High-performance networking switches for AI data centers and cloud infrastructure.' },
  { symbol: 'CIEN', name: 'Ciena', category: 'Networking', description: 'Optical networking solutions for high-bandwidth AI data transmission and cloud connectivity.' },
  { symbol: 'CLS', name: 'Celestica', category: 'Networking', description: 'Electronics manufacturing services for AI networking equipment and data center hardware.' },
  { symbol: 'COHR', name: 'Coherent', category: 'Networking', description: 'Optical components and lasers for high-speed data transmission in AI networks.' },
  { symbol: 'CRDO', name: 'Credo Technology', category: 'Networking', description: 'High-speed connectivity solutions for AI data centers and networking infrastructure.' },
  { symbol: 'CSCO', name: 'Cisco Systems', category: 'Networking', description: 'Enterprise networking equipment and AI-powered network management solutions.' },
  { symbol: 'EXTR', name: 'Extreme Networks', category: 'Networking', description: 'AI-driven network analytics and enterprise networking solutions.' },
  { symbol: 'FFIV', name: 'F5 Networks', category: 'Networking', description: 'Application delivery and security solutions for AI applications and cloud services.' },
  { symbol: 'JNPR', name: 'Juniper Networks', category: 'Networking', description: 'AI-powered networking solutions and cloud infrastructure for data centers.' },
  
  // Cloud and Data Services
  { symbol: 'CFLT', name: 'Confluent', category: 'Cloud Services', description: 'Real-time data streaming platform for AI applications and machine learning pipelines.' },
  { symbol: 'DDOG', name: 'Datadog', category: 'Cloud Services', description: 'AI-powered monitoring and analytics for cloud infrastructure and applications.' },
  { symbol: 'DOCN', name: 'DigitalOcean', category: 'Cloud Services', description: 'Cloud infrastructure and developer tools for AI application deployment and scaling.' },
  { symbol: 'ESTC', name: 'Elastic', category: 'Cloud Services', description: 'Search and analytics platform with AI capabilities for data discovery and insights.' },
  { symbol: 'GTLB', name: 'GitLab', category: 'Cloud Services', description: 'DevOps platform with AI-powered code analysis and development automation tools.' },
  { symbol: 'INOD', name: 'Innodata', category: 'Cloud Services', description: 'AI data preparation and training services for machine learning model development.' },
  { symbol: 'MDB', name: 'MongoDB', category: 'Cloud Services', description: 'NoSQL database platform supporting AI applications and real-time data processing.' },
  { symbol: 'PLTR', name: 'Palantir', category: 'Cloud Services', description: 'AI-powered data analytics platform for enterprise decision-making and intelligence.' },
  { symbol: 'SNOW', name: 'Snowflake', category: 'Cloud Services', description: 'Cloud data platform for AI/ML workloads and large-scale data analytics.' },
  
  // Data Centers
  { symbol: 'AMT', name: 'American Tower', category: 'Data Centers', description: 'Telecommunications infrastructure supporting AI data transmission and edge computing.' },
  { symbol: 'APLD', name: 'Applied Digital', category: 'Data Centers', description: 'Specialized data centers for AI computing and cryptocurrency mining infrastructure.' },
  { symbol: 'CORZ', name: 'Core Scientific', category: 'Data Centers', description: 'AI computing infrastructure and data center services for machine learning workloads.' },
  { symbol: 'CRWV', name: 'Coreweave', category: 'Data Centers', description: 'Cloud computing platform specializing in AI and machine learning infrastructure.' },
  { symbol: 'EQIX', name: 'Equinix', category: 'Data Centers', description: 'Global data center operator providing infrastructure for AI applications and cloud services.' },
  { symbol: 'GDS', name: 'GDS Holdings', category: 'Data Centers', description: 'Data center services in China supporting AI and cloud computing infrastructure.' },
  { symbol: 'GLXY', name: 'Galaxy Digital', category: 'Data Centers', description: 'Digital asset infrastructure including AI computing and blockchain technology.' },
  { symbol: 'IREN', name: 'Iris Energy', category: 'Data Centers', description: 'Renewable energy-powered data centers for sustainable AI computing infrastructure.' },
  { symbol: 'NBIS', name: 'Nebius', category: 'Data Centers', description: 'Cloud computing platform with AI services and data center infrastructure.' },
  { symbol: 'VNET', name: 'VNET Group', category: 'Data Centers', description: 'Data center services in China supporting AI and enterprise cloud solutions.' },
  
  // Nuclear Energy
  { symbol: 'BWXT', name: 'BWX Tech', category: 'Nuclear Energy', description: 'Nuclear technology for clean energy to power AI data centers and computing infrastructure.' },
  { symbol: 'NNE', name: 'Nano Nuclear', category: 'Nuclear Energy', description: 'Advanced nuclear reactors for sustainable energy to support AI computing demands.' },
  { symbol: 'OKLO', name: 'Oklo', category: 'Nuclear Energy', description: 'Micro-reactor technology for clean, reliable power for AI data centers and edge computing.' },
  { symbol: 'RYCEF', name: 'Rolls Royce', category: 'Nuclear Energy', description: 'Small modular reactors for sustainable energy solutions to power AI infrastructure.' },
  { symbol: 'SMR', name: 'NuScale', category: 'Nuclear Energy', description: 'Small modular nuclear reactors for clean energy to support AI computing and data centers.' },
  
  // Data
  { symbol: 'META', name: 'Meta', category: 'Data', description: 'AI research and development, large language models, and AI-powered social media algorithms.' },
  { symbol: 'RDDT', name: 'Reddit', category: 'Data', description: 'AI-powered content moderation, recommendation algorithms, and data for AI training.' },
  
  // Energy and Utilities
  { symbol: 'CEG', name: 'Constellation Energy', category: 'Energy', description: 'Clean energy solutions to power AI data centers and sustainable computing infrastructure.' },
  { symbol: 'D', name: 'Dominion Energy', category: 'Energy', description: 'Energy infrastructure supporting AI data centers and high-performance computing facilities.' },
  { symbol: 'DUK', name: 'Duke Energy', category: 'Energy', description: 'Renewable energy and grid infrastructure for AI computing and data center operations.' },
  { symbol: 'ETR', name: 'Entergy', category: 'Energy', description: 'Energy solutions for AI data centers and industrial computing infrastructure.' },
  { symbol: 'GEV', name: 'GE Vernova', category: 'Energy', description: 'Clean energy technology and grid solutions for sustainable AI computing infrastructure.' },
  { symbol: 'NEE', name: 'NextEra Energy', category: 'Energy', description: 'Renewable energy leader providing clean power for AI data centers and computing facilities.' },
  { symbol: 'PEG', name: 'PSEG', category: 'Energy', description: 'Energy infrastructure and clean power solutions for AI computing and data center operations.' },
  { symbol: 'PNW', name: 'Pinnacle West', category: 'Energy', description: 'Energy services supporting AI data centers and high-performance computing infrastructure.' },
  { symbol: 'SO', name: 'Southern Company', category: 'Energy', description: 'Energy infrastructure and clean power solutions for AI computing and data centers.' },
  { symbol: 'SRE', name: 'Sempra Energy', category: 'Energy', description: 'Energy infrastructure and renewable power for AI data centers and computing facilities.' },
  { symbol: 'VST', name: 'Vistra', category: 'Energy', description: 'Energy generation and retail services supporting AI computing and data center operations.' },
  { symbol: 'TLN', name: 'Energy', category: 'Energy', description: 'Energy infrastructure and power solutions for AI computing and data center facilities.' },
  { symbol: 'WEC', name: 'WEC Energy Group', category: 'Energy', description: 'Energy services and infrastructure supporting AI data centers and computing operations.' },
  
  // Engineering and Construction
  { symbol: 'PWR', name: 'Quanta', category: 'Engineering', description: 'Infrastructure construction and engineering services for AI data centers and power facilities.' }
];

const CATEGORY_EMOJIS: { [key: string]: string } = {
  'Semiconductors': '💻',
  'Cloud Providers': '🌩️',
  'Servers': '🖥️',
  'Storage': '💾',
  'Electronics': '⚡',
  'Networking': '🌐',
  'Cloud Services': '☁️',
  'Data Centers': '🏢',
  'Nuclear Energy': '☢️',
  'Data': '📊',
  'Energy': '🔋',
  'Engineering': '🏗️'
};

export default function AIStocksPage() {
  const [stocks, setStocks] = useState<StockData[]>([]);
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState<DashboardConfig>(loadDashboardConfig());
  const [showConfig, setShowConfig] = useState(false);

  useEffect(() => {
    const fetchAllStocks = async () => {
      setLoading(true);
      
      const stockPromises = AI_STOCKS.map(async (stock) => {
        try {
          console.log(`Fetching data for ${stock.symbol}...`);
          
          // Use the existing API endpoint instead of direct Yahoo Finance call
          const response = await fetch(`/api/stock/${stock.symbol}`);
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          
          const result = await response.json();
          const data = result.data || [];
          console.log(`${stock.symbol} data:`, data);
          
          if (!data || data.length === 0) {
            console.warn(`No data received for ${stock.symbol}`);
            return {
              symbol: stock.symbol,
              name: stock.name,
              category: stock.category,
              description: stock.description,
              data: [],
              indicators: {},
              currentPrice: 0,
              loading: false,
              error: 'No data available'
            };
          }
          
          const indicators = calculateAllIndicators(data);
          const currentPrice = data[0]?.close || 0;
          console.log(`${stock.symbol} current price:`, currentPrice);
          
          return {
            symbol: stock.symbol,
            name: stock.name,
            category: stock.category,
            description: stock.description,
            data,
            indicators,
            currentPrice,
            loading: false,
            error: null
          };
        } catch (error) {
          console.error(`Error fetching ${stock.symbol}:`, error);
          return {
            symbol: stock.symbol,
            name: stock.name,
            category: stock.category,
            description: stock.description,
            data: [],
            indicators: {},
            currentPrice: 0,
            loading: false,
            error: error instanceof Error ? error.message : 'Failed to fetch data'
          };
        }
      });

      const results = await Promise.all(stockPromises);
      setStocks(results);
      setLoading(false);
    };

    fetchAllStocks();
  }, []);

  const getIndicatorValue = (indicators: any, key: string): number | null => {
    if (!indicators || key === 'pivotPoints') return null;
    const value = indicators[key];
    return typeof value === 'number' ? value : null;
  };

  const renderIndicatorCell = (
    value: number | null, 
    isVolatility: boolean = false, 
    isRSI: boolean = false, 
    isVolume: boolean = false,
    currentPrice?: number
  ) => {
    if (value === null) return <span className="text-gray-400">-</span>;
    
    let colorClass = 'text-gray-900';
    
    if (isRSI) {
      if (value > 70) colorClass = 'text-red-600 font-semibold';
      else if (value < 30) colorClass = 'text-green-600 font-semibold';
    } else if (currentPrice && !isVolatility && !isVolume) {
      // For moving averages, color based on price relationship
      if (currentPrice > value) colorClass = 'text-green-600 font-semibold';
      else if (currentPrice < value) colorClass = 'text-red-600 font-semibold';
    }
    
    let formattedValue: string;
    
    if (isVolume) {
      // Format volume in millions with commas
      const volumeInMillions = value / 1000000;
      formattedValue = volumeInMillions.toFixed(1) + 'M';
    } else if (isVolatility) {
      formattedValue = value.toFixed(2);
    } else {
      formattedValue = value.toFixed(2);
    }
    
    return <span className={colorClass}>{formattedValue}</span>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading AI stocks data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🤖 AI Stocks Dashboard</h1>
          <p className="text-gray-600">Technical analysis for AI infrastructure and related stocks</p>
          <div className="mt-4 flex gap-4">
            <a
              href="/"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              🏠 Home
            </a>
            <a
              href="/dashboard"
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors"
            >
              📊 Market Dashboard
            </a>
            <button
              onClick={() => setShowConfig(true)}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors"
            >
              ⚙️ Configure Indicators
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-bold text-gray-900 border-b">
                    Stock
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-bold text-gray-900 border-b">
                    Category
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-bold text-gray-900 border-b">
                    AI Relevance
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-bold text-gray-900 border-b">
                    Price
                  </th>
                  {config.movingAverages.filter(ma => ma.enabled).map(ma => (
                    <th key={ma.key} className="px-4 py-3 text-left text-sm font-bold text-gray-900 border-b">
                      {ma.label}
                    </th>
                  ))}
                  {config.showVolatility && (
                    <>
                      <th className="px-4 py-3 text-left text-sm font-bold text-gray-900 border-b">14D ATR</th>
                      <th className="px-4 py-3 text-left text-sm font-bold text-gray-900 border-b">20D ADR</th>
                    </>
                  )}
                  {config.showRSI && (
                    <th className="px-4 py-3 text-left text-sm font-bold text-gray-900 border-b">14D RSI</th>
                  )}
                  {config.showVolume && (
                    <th className="px-4 py-3 text-left text-sm font-bold text-gray-900 border-b">20D Vol</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {stocks.map((stock) => (
                  <tr key={stock.symbol} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm border-r">
                      <div>
                        <div className="font-semibold text-gray-900">{stock.symbol}</div>
                        <div className="text-xs text-gray-500">{stock.name}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm border-r">
                      <span className="inline-flex items-center gap-1">
                        <span>{CATEGORY_EMOJIS[stock.category]}</span>
                        <span className="text-gray-700">{stock.category}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm border-r max-w-xs">
                      <div className="text-xs text-gray-600 leading-relaxed">
                        {stock.description}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm border-r font-semibold">
                      {stock.error ? (
                        <span className="text-red-500 text-xs">{stock.error}</span>
                      ) : stock.currentPrice > 0 ? (
                        `$${stock.currentPrice.toFixed(2)}`
                      ) : (
                        <span className="text-gray-400">Loading...</span>
                      )}
                    </td>
                    {config.movingAverages.filter(ma => ma.enabled).map(ma => (
                      <td key={ma.key} className="px-4 py-3 text-sm border-r">
                        {renderIndicatorCell(getIndicatorValue(stock.indicators, ma.key), false, false, false, stock.currentPrice)}
                      </td>
                    ))}
                    {config.showVolatility && (
                      <>
                        <td className="px-4 py-3 text-sm border-r">
                          {renderIndicatorCell(getIndicatorValue(stock.indicators, 'atr14'), true)}
                        </td>
                        <td className="px-4 py-3 text-sm border-r">
                          {renderIndicatorCell(getIndicatorValue(stock.indicators, 'adr20'), true)}
                        </td>
                      </>
                    )}
                    {config.showRSI && (
                      <td className="px-4 py-3 text-sm border-r">
                        {renderIndicatorCell(getIndicatorValue(stock.indicators, 'rsi14'), false, true)}
                      </td>
                    )}
                    {config.showVolume && (
                      <td className="px-4 py-3 text-sm">
                        {renderIndicatorCell(getIndicatorValue(stock.indicators, 'volumeSMA20'), false, false, true)}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Configuration Modal */}
        <DashboardConfigComponent
          config={config}
          onConfigChange={setConfig}
          isOpen={showConfig}
          onClose={() => setShowConfig(false)}
        />
      </div>
    </div>
  );
}
