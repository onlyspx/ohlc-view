export interface SPXData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
  change?: number;
  changePercent?: number;
  
  // Gap Analysis
  gapPoints?: number;
  gapFill?: string; // "Yes" or "No (X.XX points left)"
  
  // Trading Analysis
  dayOfWeek?: string;
  rthRange?: number;
  
  // Price Level Analysis
  pointNegativeOpen?: number;
  pointPositiveOpen?: number;
  abovePDH?: string; // "Yes (X.XX points up)" or "No"
  belowPDL?: string; // "Yes (X.XX points down)" or "No"
  
  // Previous day reference data
  prevDayHigh?: number;
  prevDayLow?: number;
  prevDayClose?: number;
}

export interface SPXResponse {
  data: SPXData[];
  lastUpdated: string;
}

