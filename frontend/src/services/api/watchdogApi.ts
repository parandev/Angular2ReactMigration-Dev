import { apiClient } from './apiClient';
import { WatchdogParams } from '../../types/api.types';

export interface WatchdogTableData {
    zoneGroup: string;
    zone: string;
    corridor: string;
    signalID: string;
    name: string;
    alert: string;
    occurrences: number;
    streak: number;
    date: string;
}

export interface WatchdogData {
    id?: string;
    timestamp?: string;
    alert?: string;
    status?: string;
    location?: string;
    x: string[];
    y: string[];
    z: number[][];
    tableData: WatchdogTableData[];
}

export const watchdogApi = {
    getWatchdogData: async (params: WatchdogParams): Promise<WatchdogData[]> => {
        const response = await apiClient.post<WatchdogData[]>('/watchdog/data', params);
        return response;
    },
}; 