import { apiClient } from './apiClient';
import {
    FilterParams,
    MetricData,
    MetricsAverage,
    MetricsFilterRequest,
    MetricsTrendRequest,
    MonthAverage,
    Signal,
    TrendData,
} from '../../types/api.types';

export const metricsApi = {
    // Signals
    getAllSignals: () => {
        return apiClient.get<Signal[]>(`/signals/all`);
    },

    // Month Averages
    getMonthAverages: (zoneGroup: string, month: string) => {
        return apiClient.get<MonthAverage[]>(`/metrics/monthaverages?zoneGroup=${encodeURIComponent(zoneGroup)}&month=${month}`);
    },

    // Metrics Filter - POST request to /metrics/filter
    getMetricsFilter: (params: MetricsFilterRequest, filterParams: FilterParams) => {
        const { source, measure } = params;
        return apiClient.post<MetricData[]>(
            `/metrics/filter?source=${source}&measure=${measure}`,
            filterParams
        );
    },

    // Metrics Average - POST request to /metrics/average
    getMetricsAverage: (params: MetricsFilterRequest, filterParams: FilterParams) => {
        const { source, measure, dashboard = false } = params;
        return apiClient.post<MetricsAverage[]>(
            `/metrics/average?source=${source}&measure=${measure}&dashboard=${dashboard}`,
            filterParams
        );
    },

    // Straight Average - POST request to /metrics/straightaverage
    getStraightAverage: (params: MetricsFilterRequest, filterParams: FilterParams) => {
        const { source, measure } = params;
        return apiClient.post<number>(
            `/metrics/straightaverage?source=${source}&measure=${measure}`,
            filterParams
        );
    },

    // Signals Filter Average
    getSignalsFilterAverage: (params: MetricsFilterRequest, filterParams: FilterParams) => {
        const { source, measure } = params;
        return apiClient.post<number>(
            `/metrics/signals/filter/average?source=${source}&measure=${measure}`,
            filterParams
        );
    },

    // Trend Data
    getTrendData: (params: MetricsTrendRequest) => {
        const { source, level, interval, measure, start, end } = params;
        return apiClient.get<TrendData>(
            `/metrics?source=${source}&level=${level}&interval=${interval}&measure=${measure}&start=${start}&end=${end}`
        );
    },

    // Summary Trends
    getSummaryTrends: (filterParams: FilterParams) => {
        return apiClient.post<any>(`/metrics/summarytrends?source=main`, filterParams);
    },
}; 