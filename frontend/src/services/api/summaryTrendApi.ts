import { FilterParams } from '../../types/api.types';
import { SUMMARY_TREND_ENDPOINTS } from '../../constants/apiEndpoints';
import { apiClient } from './apiClient';

export interface SummaryTrendResponse {
  tp: Array<{ month: string, average: number }>;
  aogd: Array<{ month: string, average: number }>;
  prd: Array<{ month: string, average: number }>;
  qsd: Array<{ month: string, average: number }>;
  sfd: Array<{ month: string, average: number }>;
  sfo: Array<{ month: string, average: number }>;
  tti: Array<{ month: string, average: number }>;
  pti: Array<{ month: string, average: number }>;
  vpd: Array<{ month: string, average: number }>;
  vphpa: Array<{ month: string, average: number }>;
  vphpp: Array<{ month: string, average: number }>;
  papd: Array<{ month: string, average: number }>;
  du: Array<{ month: string, average: number }>;
  pau: Array<{ month: string, average: number }>;
  cctv: Array<{ month: string, average: number }>;
  cu: Array<{ month: string, average: number }>;
  [key: string]: Array<{ month: string, average: number }>;
}

export const summaryTrendApi = {
  getSummaryTrends: (filterParams: FilterParams): Promise<SummaryTrendResponse> => {
    return apiClient.post<SummaryTrendResponse>(
      `${SUMMARY_TREND_ENDPOINTS.SUMMARY_TRENDS}?source=main`, 
      filterParams
    );
  }
}; 