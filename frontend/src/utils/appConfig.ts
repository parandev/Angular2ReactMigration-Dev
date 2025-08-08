import { consoledebug } from "./debug";
export interface ApiConfig {
  ENV: string;
  API_BASE_URL: string;
}

export const AppConfig = {
  DEV: {
    "default": [],
    "production": false,
    "API_BASE_URL": "",
    "mapCenterLat": 33.757776,
    "mapCenterLon": -84.391578,
    "hasPageOperations": true,
    "hasPageMaintenance": true,
    "hasPageWatchdog": true,
    "hasPageTeamsTasks": true,
    "hasPageReports": false,
    "hasPageHealthMetrics": true,
    "hasPageSummaryTrend": true,
    "hasBtnContactUs": true,
    "hasBtnGdotApplications": true,
    "ttiGoal": 1.2,
    "ptiGoal": 1.3,
    "duGoal": 0.95,
    "ppuGoal": 0.95,
    "cctvGoal": 0.95,
    "cuGoal": 0.95
  },
  TEST: {
    "default": [],
    "production": true,
    "API_BASE_URL": "",
    "mapCenterLat": 33.757776,
    "mapCenterLon": -84.391578,
    "hasPageOperations": true,
    "hasPageMaintenance": true,
    "hasPageWatchdog": true,
    "hasPageTeamsTasks": true,
    "hasPageReports": false,
    "hasPageHealthMetrics": true,
    "hasPageSummaryTrend": true,
    "hasBtnContactUs": true,
    "hasBtnGdotApplications": true,
    "ttiGoal": 1.2,
    "ptiGoal": 1.3,
    "duGoal": 0.95,
    "ppuGoal": 0.95,
    "cctvGoal": 0.95,
    "cuGoal": 0.95
  },
  PROD: {
    "default": [],
    "production": true,
    "API_BASE_URL": "",
    "mapCenterLat": 33.757776,
    "mapCenterLon": -84.391578,
    "hasPageOperations": true,
    "hasPageMaintenance": true,
    "hasPageWatchdog": true,
    "hasPageTeamsTasks": true,
    "hasPageReports": false,
    "hasPageHealthMetrics": true,
    "hasPageSummaryTrend": true,
    "hasBtnContactUs": true,
    "hasBtnGdotApplications": true,
    "ttiGoal": 1.2,
    "ptiGoal": 1.3,
    "duGoal": 0.95,
    "ppuGoal": 0.95,
    "cctvGoal": 0.95,
    "cuGoal": 0.95
  }
};

const getApiConfig = (): ApiConfig => {
  // Check if running in browser with injected ENV
  consoledebug("window.ENV", window.RUNTIME_CONFIG , window.RUNTIME_CONFIG?.ENV, window);

  if (typeof window !== 'undefined' && window.RUNTIME_CONFIG) {
    return {
      ENV: window.RUNTIME_CONFIG.ENV,
      API_BASE_URL: window.RUNTIME_CONFIG.API_BASE_URL
    };
  }
  
  // Fallback for development/build time
  return {
    ENV: import.meta.env.VITE_ENV || 'DEV',
    API_BASE_URL: import.meta.env.VITE_API_BASE_URL
  };
};

// const API_CONFIG: ApiConfig = getApiConfig();
const appConfig = AppConfig['DEV']
// appConfig.API_BASE_URL = API_CONFIG.API_BASE_URL;
appConfig.API_BASE_URL = "https://sigopsmetrics-api.dot.ga.gov"
export default appConfig;
