# Stock Technical Analysis

A modern web application to track stock OHLC data with technical indicators for any stock symbol. Built with Next.js, TypeScript, and Tailwind CSS.

## Features

- 📊 **Real-time Stock Data**: Fetches 3+ years of historical data for any stock symbol
- 🎨 **Modern UI**: Clean, responsive design with Tailwind CSS
- 🔍 **Interactive Filtering**: Toggle columns on/off to customize your view
- 📈 **Technical Indicators**: SMA, EMA, and other technical analysis tools
- 📱 **Responsive Design**: Works on desktop and mobile devices
- ⚡ **Fast Performance**: Built with Next.js for optimal speed
- 🔄 **On-demand Fetching**: Always fresh data from Yahoo Finance API

## Data Source

This application uses the Yahoo Finance API to fetch real-time stock data:

### Data Features
- Open, High, Low, Close prices
- Volume data
- Daily change and percentage change calculations
- 3+ years of historical data
- Technical indicators (SMA, EMA)

### Data Fetching
- **On-demand fetching**: Data is fetched fresh on every request
- **No local storage**: Eliminates file system dependencies for serverless deployment
- **Real-time data**: Always get the latest market information
- **Multiple symbols**: Support for any stock symbol (SPX, AAPL, TSLA, etc.)

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Data Fetching**: Yahoo Finance API via Next.js API routes
- **Date Handling**: date-fns
- **Deployment**: Vercel (recommended)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd ohlc-view
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

```bash
npm run build
npm start
```

## Deployment on Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy automatically on every push

Or deploy manually:

```bash
npm install -g vercel
vercel
```

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── spx/route.ts                    # API endpoint for SPX data
│   │   ├── spx/refresh/route.ts            # Manual refresh endpoint
│   │   └── stock/[symbol]/route.ts         # Dynamic stock data endpoint
│   ├── globals.css                         # Global styles
│   ├── layout.tsx                          # Root layout
│   └── page.tsx                            # Main page component
├── components/
│   └── SPXTable.tsx                        # Data table component
├── hooks/
│   ├── useSPXData.ts                       # Custom hook for SPX data
│   └── useStockData.ts                     # Custom hook for stock data
├── lib/
│   ├── yahoo-finance.ts                    # Yahoo Finance API integration
│   ├── technical-indicators.ts             # Technical analysis calculations
│   └── storage.ts                          # Storage utilities (no-op for serverless)
└── types/
    └── spx.ts                              # TypeScript type definitions
```

## API Endpoints

### GET /api/spx

Returns SPX daily OHLC data for the last 3+ years.

**Response:**
```json
{
  "data": [
    {
      "date": "2024-01-15",
      "open": 4785.23,
      "high": 4798.45,
      "low": 4775.12,
      "close": 4789.34,
      "volume": 1234567890,
      "change": 4.11,
      "changePercent": 0.09
    }
  ],
  "lastUpdated": "2024-01-15T16:00:00.000Z"
}
```

### GET /api/stock/[symbol]

Returns daily OHLC data for any stock symbol.

**Parameters:**
- `symbol`: Stock symbol (e.g., AAPL, TSLA, MSFT)

**Response:** Same format as SPX endpoint

### POST /api/spx/refresh

Manually refreshes SPX data (fetches fresh data from Yahoo Finance).

## Customization

### Adding New Technical Indicators

1. Add calculation functions in `src/lib/technical-indicators.ts`
2. Update the main page component to display new indicators
3. Add any new types to `src/types/spx.ts`

### Adding New Columns

1. Update the `SPXData` interface in `src/types/spx.ts`
2. Modify the API routes to include new data
3. Update the table component in `src/components/SPXTable.tsx`

### Styling Changes

The application uses Tailwind CSS. You can customize colors and styling in:
- `src/app/globals.css`
- Component-specific Tailwind classes
- `tailwind.config.js` for theme customization

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - feel free to use this project for your own purposes.

## Support

If you encounter any issues or have questions, please open an issue on GitHub.

## 🚀 **Future Development**

See [INTEGRATION_PLAN.md](./INTEGRATION_PLAN.md) for detailed plans to integrate hourly analysis, VIX correlation, and intraday market profile features from the market-lens project.
