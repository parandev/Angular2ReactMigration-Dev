import { apiClient } from './apiClient';
import { FILTER_ENDPOINTS } from '../../constants/apiEndpoints';
import { consoledebug } from '../../utils/debug';

/**
 * Filter API service for fetching filter options data
 */
const filterApi = {
  /**
   * Get all available zone groups (regions)
   */
  getZoneGroups: async () => {
    return await apiClient.get<string[]>(FILTER_ENDPOINTS.ZONE_GROUPS);
  },

  /**
   * Get all available zones (districts)
   */
  getZones: async () => {
    try {
      const result = await apiClient.get<string[]>(FILTER_ENDPOINTS.ZONES);
      consoledebug('Zones API response:', result);
      return result;
    } catch (error) {
      consoledebug('Error fetching zones:', error);
      throw error;
    }
  },

  /**
   * Get zones filtered by zone group
   */
  getZonesByZoneGroup: async (zoneGroup: string) => {
    return await apiClient.get<string[]>(FILTER_ENDPOINTS.ZONES_BY_ZONE_GROUP(zoneGroup));
  },

  /**
   * Get all available agencies
   */
  getAgencies: async () => {
    return await apiClient.get<string[]>(FILTER_ENDPOINTS.AGENCIES);
  },

  /**
   * Get all available counties
   */
  getCounties: async () => {
    return await apiClient.get<string[]>(FILTER_ENDPOINTS.COUNTIES);
  },

  /**
   * Get all available cities
   */
  getCities: async () => {
    return await apiClient.get<string[]>(FILTER_ENDPOINTS.CITIES);
  },

  /**
   * Get all available corridors
   */
  getCorridors: async () => {
    return await apiClient.get<string[]>(FILTER_ENDPOINTS.CORRIDORS);
  },

  /**
   * Get corridors filtered by other filter options
   */
  getCorridorsByFilter: async (
    filter: { 
      zoneGroup?: string; 
      zone?: string; 
      agency?: string; 
      county?: string; 
      city?: string;
    }
  ) => {
    const { zoneGroup, zone, agency, county, city } = filter;
    const url = `${FILTER_ENDPOINTS.CORRIDORS_BY_FILTER}?zoneGroup=${zoneGroup || ''}&zone=${zone || ''}&agency=${agency || ''}&county=${county || ''}&city=${city || ''}`;
    return await apiClient.get<string[]>(url);
  },

  /**
   * Get all available subcorridors
   */
  getSubcorridors: async () => {
    return await apiClient.get<string[]>(FILTER_ENDPOINTS.SUBCORRIDORS);
  },

  /**
   * Get subcorridors filtered by corridor
   */
  getSubcorridorsByCorridor: async (corridor: string) => {
    return await apiClient.get<string[]>(FILTER_ENDPOINTS.SUBCORRIDORS_BY_CORRIDOR(corridor));
  },

  /**
   * Get all available priorities
   */
  getPriorities: async () => {
    return await apiClient.get<string[]>(FILTER_ENDPOINTS.PRIORITIES);
  },

  /**
   * Get all available classifications
   */
  getClassifications: async () => {
    return await apiClient.get<string[]>(FILTER_ENDPOINTS.CLASSIFICATIONS);
  }
};

export default filterApi; 