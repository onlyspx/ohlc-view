# Market-Lens Integration Plan for OHLC-View

## 📊 **Market-Lens Repository Summary**

### **🎯 Core Functionality:**
- **SPX First Hour Analysis**: Analyzes the first hour of trading for S&P 500
- **VIX Correlation**: Correlates first hour ranges with VIX levels
- **Intraday Range Tables**: Color-coded hourly range analysis
- **30-Minute Market Profile**: Detailed intraday analysis
- **Static Site Generation**: Python-based static HTML generation

### **🔧 Technical Stack:**
- **Backend**: Python with pandas, yfinance, plotly
- **Data Sources**: Yahoo Finance API (hourly SPX data, daily VIX)
- **Visualization**: Plotly charts and interactive HTML tables
- **Deployment**: Static site generation with Vercel

### **📁 Key Components:**
1. **`hourly_range_analyzer.py`**: Core analysis engine
2. **`build.py`**: Static site generator
3. **`thirty_min_analyzer.py`**: 30-minute market profile
4. **Templates**: HTML templates for visualization
5. **Data Processing**: VIX correlation, day-of-week patterns

---

## 🚀 **Integration Plan for OHLC-View**

### **Phase 1: Backend Integration (Python API)**

1. **Create Python API Endpoints**:
   ```typescript
   // New API routes in ohlc-view
   /api/hourly-analysis/spx
   /api/hourly-analysis/vix-correlation
   /api/intraday-table
   /api/thirty-min-profile
   ```

2. **Add Python Dependencies**:
   ```json
   // package.json additions
   "python": {
     "dependencies": [
       "pandas==2.2.0",
       "yfinance==0.2.54", 
       "plotly>=5.0.0",
       "numpy>=1.16.5"
     ]
   }
   ```

3. **Port Key Functions**:
   - `HourlyRangeAnalyzer` → TypeScript/JavaScript
   - `calculate_hourly_metrics()` → New technical indicators
   - `generate_intraday_table()` → React component

### **Phase 2: Frontend Integration**

1. **New React Components**:
   ```typescript
   // New components
   src/components/HourlyAnalysis.tsx
   src/components/IntradayTable.tsx
   src/components/VixCorrelation.tsx
   src/components/ThirtyMinProfile.tsx
   ```

2. **Enhanced Technical Indicators**:
   ```typescript
   // Add to technical-indicators.ts
   calculateFirstHourRange()
   calculateVixCorrelation()
   calculateIntradayPatterns()
   ```

3. **New Data Types**:
   ```typescript
   // Add to types/spx.ts
   interface HourlyAnalysis {
     firstHourRange: number;
     vixCorrelation: number;
     dayOfWeek: string;
     intradayPattern: string;
   }
   ```

### **Phase 3: UI/UX Enhancement**

1. **New Navigation Tabs**:
   ```
   Daily Analysis (current)
   Hourly Analysis (new)
   Intraday Table (new)
   VIX Correlation (new)
   ```

2. **Interactive Charts**:
   - Plotly.js integration for charts
   - Color-coded intraday tables
   - VIX correlation heatmaps

3. **Enhanced Data Display**:
   - First hour range statistics
   - Day-of-week patterns
   - VIX volatility categories

### **Phase 4: Advanced Features**

1. **Real-time Updates**:
   - WebSocket integration for live data
   - Auto-refresh during market hours

2. **Export Functionality**:
   - CSV export for analysis data
   - PDF reports generation

3. **Customization**:
   - User preferences for timeframes
   - Custom indicator combinations

---

## 🎯 **Immediate Next Steps**

### **1. Start with Hourly Analysis API**
```typescript
// Create new API endpoint
// src/app/api/hourly-analysis/route.ts
export async function GET() {
  // Port Python logic to TypeScript
  // Return hourly analysis data
}
```

### **2. Add Hourly Analysis Component**
```typescript
// src/components/HourlyAnalysis.tsx
export default function HourlyAnalysis({ symbol }: { symbol: string }) {
  // Display first hour ranges, VIX correlation
  // Interactive charts and statistics
}
```

### **3. Integrate with Existing UI**
```typescript
// Add to src/app/page.tsx
const [activeTab, setActiveTab] = useState('daily');

// Tab navigation between Daily/Hourly/Intraday views
```

### **4. Enhanced Data Fetching**
```typescript
// Extend useStockData hook
const { hourlyData, intradayData } = useStockData(symbol);
```

---

## 🔄 **Migration Strategy**

### **Option A: Gradual Integration**
- Keep both projects running
- Gradually port features to ohlc-view
- Maintain market-lens as reference

### **Option B: Full Migration**
- Port all market-lens functionality to ohlc-view
- Create unified dashboard
- Deprecate market-lens

### **Option C: Hybrid Approach**
- Use ohlc-view for daily analysis
- Use market-lens for hourly/intraday
- Cross-link between applications

---

## 💡 **Recommended Approach**

I recommend **Option A (Gradual Integration)** starting with:

1. **Week 1**: Port hourly analysis API and basic component
2. **Week 2**: Add intraday table functionality  
3. **Week 3**: Integrate VIX correlation analysis
4. **Week 4**: Add 30-minute market profile
5. **Week 5**: Polish UI/UX and add advanced features

This approach allows us to:
- ✅ Maintain existing functionality
- ✅ Test each integration step
- ✅ Get user feedback early
- ✅ Build incrementally
- ✅ Keep both projects stable

---

## 📋 **Key Files to Reference**

### **Market-Lens Source Files:**
- `../market-lens/src/hourly_analysis/hourly_range_analyzer.py` - Core analysis logic
- `../market-lens/src/hourly_analysis/build.py` - Static site generation
- `../market-lens/src/hourly_analysis/templates/index.html` - Main template
- `../market-lens/src/hourly_analysis/templates/intraday_table.html` - Table template

### **OHLC-View Target Files:**
- `src/app/api/` - New API endpoints
- `src/components/` - New React components
- `src/lib/technical-indicators.ts` - Enhanced indicators
- `src/types/spx.ts` - New data types
- `src/app/page.tsx` - Main UI integration

---

## 🎯 **Success Metrics**

- [ ] Hourly analysis API endpoint working
- [ ] First hour range data displayed
- [ ] VIX correlation analysis integrated
- [ ] Intraday table component functional
- [ ] 30-minute market profile added
- [ ] UI navigation between views
- [ ] Performance optimized
- [ ] User feedback collected

---

*Last Updated: December 2024*
*Status: Planning Phase*
