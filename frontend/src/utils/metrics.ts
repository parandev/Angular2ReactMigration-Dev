export interface MetricsOptions {
  measure: string;
  field?: string;
  label: string;
  formatType?: string;
  formatDecimals?: number;
  source?: string;
  interval?: string;
  level?: string;
  isMapMetrics?: boolean;
  start?: string;
  end?: string;
  dashboard?: boolean;
  signalId?: string;
  goal?: number;
  dt?: Date;
}

export class Metrics {
  measure: string;
  field: string;
  label: string;
  formatType: string;
  formatDecimals: number;
  source: string;
  interval: string;
  level: string;
  isMapMetrics: boolean;
  start: string;
  end: string;
  dashboard: boolean = false;
  signalId: string = "";
  goal?: number;
  dt: Date = new Date();

  constructor(options: MetricsOptions) {
    this.dt = options.dt || new Date();
    this.measure = options.measure;
    this.field = options.field || '';
    this.label = options.label;
    this.formatType = options.formatType || 'number';
    this.formatDecimals = options.formatDecimals !== undefined ? options.formatDecimals : 0;
    this.source = options.source || 'main';
    this.interval = options.interval || 'mo';
    this.level = options.level || 'sig';
    this.isMapMetrics = options.isMapMetrics || false;
    
    // Set default start/end dates like in Angular version
    const currentMonth = this.dt.getMonth() + 1;
    const currentYear = this.dt.getFullYear();
    this.start = options.start || `${currentMonth}/${currentYear - 1}`;
    this.end = options.end || `${currentMonth}/${currentYear}`;
    
    this.dashboard = options.dashboard || false;
    this.signalId = options.signalId || '';
    this.goal = options.goal;
  }
}

export interface TrendDataPoint {
  timestamp: string;
  value: number;
}

export interface MetricsTrendRequest {
  metricName: string;
  startDate: string;
  endDate: string;
}

export interface MetricsTrendResponse {
  data: TrendDataPoint[];
} 

export default Metrics; 