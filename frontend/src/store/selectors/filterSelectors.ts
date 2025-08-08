import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { FilterParams } from '../../types/api.types';

// Select the entire filter state
export const selectFilter = (state: RootState) => state.filter;

// Transform the filter state into a FilterParams object for API calls
export const selectFilterParams = createSelector(
  [selectFilter],
  (filter): FilterParams => {
    return {
      dateRange: parseInt(filter.selectedDateOption),
      timePeriod: parseInt(filter.selectedAggregationOption),
      customStart: filter.startDate,
      customEnd: filter.endDate,
      daysOfWeek: null, // Not currently used in the filter UI
      startTime: filter.startTime || null,
      endTime: filter.endTime || null,
      zone_Group: filter.selectedSignalGroup || '',
      zone: filter.selectedDistrict || null,
      agency: filter.selectedAgency || null,
      county: filter.selectedCounty || null,
      city: filter.selectedCity || null,
      corridor: filter.selectedCorridor || null,
      signalId: filter.signalId || '',
      priority: filter.selectedPriority || '',
      classification: filter.selectedClassification || '',
    };
  }
); 