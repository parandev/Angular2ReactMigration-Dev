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