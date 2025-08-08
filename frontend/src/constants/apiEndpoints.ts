/**
 * API endpoint constants for all services
 */

// Filter API endpoints
export const FILTER_ENDPOINTS = {
    ZONE_GROUPS: 'signals/zonegroups',
    ZONES: 'signals/zones',
    ZONES_BY_ZONE_GROUP: (zoneGroup: string) => `signals/zonesbyzonegroup/${zoneGroup}`,
    AGENCIES: 'signals/agencies',
    COUNTIES: 'signals/counties',
    CITIES: 'signals/cities',
    CORRIDORS: 'signals/corridors',
    CORRIDORS_BY_FILTER: 'signals/corridorsbyfilter',
    SUBCORRIDORS: 'signals/subcorridors',
    SUBCORRIDORS_BY_CORRIDOR: (corridor: string) => `signals/subcorridorsbycorridor/${encodeURIComponent(corridor)}`,
    PRIORITIES: 'signals/priorities',
    CLASSIFICATIONS: 'signals/classifications'
  };
  
  // Health Metrics API endpoints
  export const HEALTH_METRICS_ENDPOINTS = {
    METRICS: 'metrics',
    MONTH_AVERAGES: 'metrics/monthaverages'
  };
  
  // Summary Trend API endpoints
  export const SUMMARY_TREND_ENDPOINTS = {
    SUMMARY_TRENDS: 'metrics/summarytrends'
  }; 