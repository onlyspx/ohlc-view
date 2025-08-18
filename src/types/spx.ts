export interface SPXData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
  change?: number;
  changePercent?: number;
}

export interface SPXResponse {
  data: SPXData[];
  lastUpdated: string;
}

