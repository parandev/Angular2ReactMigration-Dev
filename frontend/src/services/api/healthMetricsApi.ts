import axios from 'axios';
import { HEALTH_METRICS_ENDPOINTS } from '../../constants/apiEndpoints'
import appConfig from '../../utils/appConfig'
import { consoledebug } from '../../utils/debug';

// Create a simple apiClient for this file
const axiosInstance = axios.create({
    baseURL: appConfig.API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    }
});

// Signal interface to match the one in metricsSlice.ts
export interface Signal {
    id: number;
    signalID?: string;
    intersection: string;
    latitude: number;
    longitude: number;
    region: string;
    status: string;
    mainStreetName?: string;
    sideStreetName?: string;
}

export interface MaintenanceMetric {
    zone_Group: string;
    corridor: string;
    month: string;
    'percent Health': number;
    'missing Data': number | null;
    'detection Uptime Score': number | null;
    'ped Actuation Uptime Score': number | null;
    'comm Uptime Score': number | null;
    'cctv Uptime Score': number | null;
    'flash Events Score': number | null;
    'detection Uptime': number | null;
    'ped Actuation Uptime': number | null;
    'comm Uptime': number | null;
    'cctv Uptime': number | null;
    'flash Events': number | null;
    description: string | null;
    id: number;
}

export interface OperationsMetric {
    zone_Group: string;
    corridor: string;
    month: string;
    'percent Health': number;
    'missing Data': number | null;
    'platoon Ratio Score': number | null;
    'ped Delay Score': number | null;
    'split Failures Score': number | null;
    'travel Time Index Score': number | null;
    'buffer Index Score': number | null;
    'platoon Ratio': number | null;
    'ped Delay': number | null;
    'split Failures': number | null;
    'travel Time Index': number | null;
    'buffer Index': number | null;
    description: string | null;
    id: number;
}

export interface SafetyMetric {
    zone_Group: string;
    corridor: string;
    month: string;
    'percent Health': number;
    'missing Data': number | null;
    'crash Rate Index Score': number | null;
    'kabco Crash Severity Index Score': number | null;
    'high Speed Index Score': number | null;
    'ped Injury Exposure Index Score': number | null;
    'crash Rate Index': number | null;
    'kabco Crash Severity Index': number | null;
    'high Speed Index': number | null;
    'ped Injury Exposure Index': number | null;
    description: string | null;
    id: number;
}

export interface RegionAverage {
    operations: number;
    maintenance: number;
    safety: number;
}

export interface FetchMetricsParams {
    source?: string;
    level?: string;
    interval?: string;
    measure: string;
    start: string;
    end: string;
}

export interface FetchRegionParams {
    zoneGroup: string;
    month: string;
}

export const fetchMetrics = async (params: FetchMetricsParams): Promise<MaintenanceMetric[] | OperationsMetric[] | SafetyMetric[]> => {
    try {
        const response = await axiosInstance.get(HEALTH_METRICS_ENDPOINTS.METRICS, {
            params: {
                source: params.source || 'main',
                level: params.level || 'cor',
                interval: params.interval || 'mo',
                measure: params.measure,
                start: params.start,
                end: params.end
            }
        });
        consoledebug("fetchMetrics response", response.data);
        return response.data;
    } catch (error) {
        console.error('Error fetching metrics:', error);
        throw error;
    }
};

export const fetchRegionAverage = async (params: FetchRegionParams): Promise<RegionAverage> => {
    try {
        const response = await axiosInstance.get(HEALTH_METRICS_ENDPOINTS.MONTH_AVERAGES, {
            params: {
                zoneGroup: params.zoneGroup,
                month: params.month
            }
        });
        
        // API returns array of [operations, maintenance, safety]
        const [operationsValue, maintenanceValue, safetyValue] = response.data;
        
        return {
            operations: operationsValue === -1 ? 0 : operationsValue * 100,
            maintenance: maintenanceValue === -1 ? 0 : maintenanceValue * 100,
            safety: safetyValue === -1 ? 0 : safetyValue * 100
        };
    } catch (error) {
        console.error('Error fetching region average:', error);
        throw error;
    }
};

// Add getAllSignals method for compatibility
export const getAllSignals = async (): Promise<Signal[]> => {
    // Return mock data since the original implementation is not available
    return [
        { id: 1, intersection: "Main St & 1st Ave", latitude: 33.7490, longitude: -84.3880, region: "Central Metro", status: "Online" },
        { id: 2, intersection: "Peachtree St & 10th St", latitude: 33.7815, longitude: -84.3830, region: "Central Metro", status: "Online" },
        { id: 3, intersection: "Roswell Rd & Abernathy Rd", latitude: 33.9665, longitude: -84.3578, region: "North", status: "Offline" }
    ];
};

export const healthMetricsApi = {
    fetchMetrics,
    fetchRegionAverage,
    getAllSignals
};

export default healthMetricsApi;