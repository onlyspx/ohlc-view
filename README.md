# SPX Daily Data Tracker

A modern web application to track S&P 500 (SPX) daily OHLC data with interactive filtering and statistics. Built with Next.js, TypeScript, and Tailwind CSS.

## Features

- 📊 **Real-time SPX Data**: Fetches 3+ years of historical S&P 500 data
- 🎨 **Dark Theme**: Modern dark UI with custom styling
- 🔍 **Interactive Filtering**: Toggle columns on/off to customize your view
- 📈 **Key Statistics**: Latest close, daily change, and percentage change
- 📱 **Responsive Design**: Works on desktop and mobile devices
- ⚡ **Fast Performance**: Built with Next.js for optimal speed

## Data Source & Storage

This application uses the Yahoo Finance API to fetch SPX (^GSPC) data with intelligent caching:

### Data Features
- Open, High, Low, Close prices
- Volume data
- Daily change and percentage change calculations
- 3+ years of historical data

### Storage System
- **File-based caching**: Data is stored locally in JSON files
- **24-hour cache**: Data is refreshed once per day to avoid API rate limits
- **Fallback support**: If API fails, cached data is served as backup
- **Manual refresh**: Use `/api/spx/refresh` endpoint to force update

### Cache Location
- Data files are stored in `/data/spx-data.json`
- Cached files are excluded from git (see .gitignore)

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Data Fetching**: Built-in Next.js API routes
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
cd onlyspx
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
│   ├── api/spx/route.ts    # API endpoint for SPX data
│   ├── globals.css         # Global styles
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Main page component
├── components/
│   └── SPXTable.tsx        # Data table component
├── hooks/
│   └── useSPXData.ts       # Custom hook for data fetching
└── types/
    └── spx.ts              # TypeScript type definitions
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

## Customization

### Adding New Columns

1. Update the `SPXData` interface in `src/types/spx.ts`
2. Modify the API route in `src/app/api/spx/route.ts` to include new data
3. Update the table component in `src/components/SPXTable.tsx`

### Styling Changes

The application uses Tailwind CSS with a dark theme. You can customize colors and styling in:
- `src/app/globals.css`
- Component-specific Tailwind classes

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
