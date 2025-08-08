// Common types
export interface FilterParams {
    dateRange: number;
    timePeriod: number;
    customStart: string | null;
    customEnd: string | null;
    daysOfWeek: string[] | null;
    startTime: string | null;
    endTime: string | null;
    zone_Group: string;
    zone: string | null;
    agency: string | null;
    county: string | null;
    city: string | null;
    corridor: string | null;
    signalId: string;
    priority: string;
    classification: string;
}

export interface WatchdogParams {
    startDate: string;
    endDate: string;
    alert: string;
    phase: string;
    intersectionFilter: string;
    streak: string;
    zoneGroup: string;
}

// Response types
export interface Signal {
    id: string;
    name: string;
    location: string;
    status: string;
    // Add other signal properties
}

export interface MetricData {
    value?: number;
    timestamp?: string;
    zoneGroup?: string;
    corridor?: string;
    month?: string;
    'percent Health'?: string | number;
    // Add other metric properties
    [key: string]: any; // Allow for dynamic properties
}

export interface TrendData {
    data: MetricData[];
    metadata: {
        measure: string;
        interval: string;
        // Add other metadata properties
    };
}

export interface MonthAverage {
    zoneGroup: string;
    month: string;
    average: number;
    // Add other properties
}

export interface MetricsAverage {
    label: string;
    avg: number;
    delta: number;
    zoneGroup: string | null;
    weight: number;
}

// Request types
export interface MetricsFilterRequest {
    source: string;
    measure: string;
    dashboard?: boolean;
}

export interface MetricsTrendRequest {
    source: string;
    level: string;
    interval: string;
    measure: string;
    start: string;
    end: string;
} 