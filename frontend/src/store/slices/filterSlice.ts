import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import filterApi from '../../services/api/filterApi';
import { RootState } from '../../store';
import { FilterParams } from '../../types/api.types';
import { consoledebug } from '../../utils/debug';

export interface FilterState {
  // Filter selections
  selectedDateOption: string;
  startDate: string | null;
  endDate: string | null;
  startTime: string;
  endTime: string;
  selectedAggregationOption: string;
  signalId: string;
  selectedSignalGroup: string;
  selectedDistrict: string;
  selectedAgency: string;
  selectedCounty: string;
  selectedCity: string;
  selectedCorridor: string;
  selectedSubcorridor: string;
  selectedPriority: string;
  selectedClassification: string;
  allDayChecked: boolean;

  // Dropdown options
  zoneGroups: string[];
  zones: string[];
  agencies: string[];
  counties: string[];
  cities: string[];
  corridors: string[];
  subcorridors: string[];
  priorities: string[];
  classifications: string[];
  
  // Loading states
  loading: {
    [key: string]: boolean;
  };
  
  // Error state
  errorState: number; // 1 = normal, 2 = warning, 3 = error
  
  // Is filtering active
  isFiltering: boolean;
  
  // Filters have been applied
  filtersApplied: boolean;
}

const initialState: FilterState = {
  // Filter selections - defaults match Angular component
  selectedDateOption: "4", // Prior Year
  startDate: null,
  endDate: null,
  startTime: "00:00",
  endTime: "23:59",
  selectedAggregationOption: "4", // Monthly
  signalId: "",
  selectedSignalGroup: "Central Metro",
  selectedDistrict: "",
  selectedAgency: "",
  selectedCounty: "",
  selectedCity: "",
  selectedCorridor: "",
  selectedSubcorridor: "",
  selectedPriority: "",
  selectedClassification: "",
  allDayChecked: true,
  
  // Dropdown options
  zoneGroups: [],
  zones: [],
  agencies: [],
  counties: [],
  cities: [],
  corridors: [],
  subcorridors: [],
  priorities: [],
  classifications: [],
  
  // Loading states
  loading: {
    zoneGroups: false,
    zones: false,
    agencies: false,
    counties: false,
    cities: false,
    corridors: false,
    subcorridors: false,
    priorities: false,
    classifications: false,
  },
  
  // Error state
  errorState: 1, // Normal
  
  // Is filtering active
  isFiltering: false,
  
  // Filters have been applied
  filtersApplied: false,
};

// Async thunks for API calls
export const fetchZoneGroups = createAsyncThunk(
  'filter/fetchZoneGroups',
  async (_, { rejectWithValue }) => {
    try {
      return await filterApi.getZoneGroups();
    } catch (error) {
      return rejectWithValue('Failed to fetch zone groups: ' + error);
    }
  }
);

export const fetchZones = createAsyncThunk(
  'filter/fetchZones',
  async (_, { rejectWithValue }) => {
    try {
      return await filterApi.getZones();
    } catch (error) {
      return rejectWithValue('Failed to fetch zones groups: ' + error);
    }
  }
);

export const fetchZonesByZoneGroup = createAsyncThunk(
  'filter/fetchZonesByZoneGroup',
  async (zoneGroup: string, { rejectWithValue }) => {
    try {
      consoledebug(`Fetching zones for zone group: ${zoneGroup}`);
      const result = await filterApi.getZonesByZoneGroup(zoneGroup);
      consoledebug(`Zones by zone group response:`, result);
      // If we get an empty array back, reject to prevent overwriting existing zones
      if (Array.isArray(result) && result.length === 0) {
        console.warn(`No zones found for zone group: ${zoneGroup}, keeping existing zones`);
        return rejectWithValue('No zones found for this zone group');
      }
      return result;
    } catch (error) {
      console.error(`Failed to fetch zones for zone group: ${zoneGroup}`, error);
      return rejectWithValue(`Failed to fetch zones for zone group: ${zoneGroup}`);
    }
  }
);

export const fetchAgencies = createAsyncThunk(
  'filter/fetchAgencies',
  async (_, { rejectWithValue }) => {
    try {
      return await filterApi.getAgencies();
    } catch (error) {
      return rejectWithValue('Failed to fetch agencies:' + error);
    }
  }
);

export const fetchCounties = createAsyncThunk(
  'filter/fetchCounties',
  async (_, { rejectWithValue }) => {
    try {
      return await filterApi.getCounties();
    } catch (error) {
      return rejectWithValue('Failed to fetch counties :' + error);
    }
  }
);

export const fetchCities = createAsyncThunk(
  'filter/fetchCities',
  async (_, { rejectWithValue }) => {
    try {
      return await filterApi.getCities();
    } catch (error) {
      return rejectWithValue('Failed to fetch cities :' + error);
    }
  }
);

export const fetchCorridors = createAsyncThunk(
  'filter/fetchCorridors',
  async (_, { rejectWithValue }) => {
    try {
      return await filterApi.getCorridors();
    } catch (error) {
      return rejectWithValue('Failed to fetch corridors :' + error);
    }
  }
);

export const fetchCorridorsByFilter = createAsyncThunk(
  'filter/fetchCorridorsByFilter',
  async (filter: { 
    zoneGroup?: string; 
    zone?: string; 
    agency?: string; 
    county?: string; 
    city?: string;
  }, { rejectWithValue }) => {
    try {
      return await filterApi.getCorridorsByFilter(filter);
    } catch (error) {
      return rejectWithValue('Failed to fetch filtered corridors :' + error);
    }
  }
);

export const fetchSubcorridors = createAsyncThunk(
  'filter/fetchSubcorridors',
  async (_, { rejectWithValue }) => {
    try {
      return await filterApi.getSubcorridors();
    } catch (error) {
      return rejectWithValue('Failed to fetch subcorridors :' + error);
    }
  }
);

export const fetchSubcorridorsByCorridor = createAsyncThunk(
  'filter/fetchSubcorridorsByCorridor',
  async (corridor: string, { rejectWithValue }) => {
    try {
      return await filterApi.getSubcorridorsByCorridor(corridor);
    } catch (error) {
      return rejectWithValue(`Failed to fetch subcorridors for corridor ${corridor} : ${error}`);
    }
  }
);

export const fetchPriorities = createAsyncThunk(
  'filter/fetchPriorities',
  async (_, { rejectWithValue }) => {
    try {
      return await filterApi.getPriorities();
    } catch (error) {
      return rejectWithValue('Failed to fetch priorities:' + error);
    }
  }
);

export const fetchClassifications = createAsyncThunk(
  'filter/fetchClassifications',
  async (_, { rejectWithValue }) => {
    try {
      return await filterApi.getClassifications();
    } catch (error) {
      return rejectWithValue('Failed to fetch classifications:' + error);
    }
  }
);

// Main filter slice
const filterSlice = createSlice({
  name: 'filter',
  initialState,
  reducers: {
    // Update filter values
    setDateOption: (state, action: PayloadAction<string>) => {
      state.selectedDateOption = action.payload;
      // Reset custom dates/times if not "Custom"
      if (action.payload !== "5") {
        state.startDate = null;
        state.endDate = null;
        state.startTime = "00:00";
        state.endTime = "23:59";
        state.allDayChecked = true;
      } else {
        // Set default dates for custom
        const today = new Date();
        state.startDate = today.toISOString().split('T')[0];
        state.endDate = today.toISOString().split('T')[0];
      }
      // Mark as filtering active when date range changes (like Angular)
      state.isFiltering = true;
    },
    setStartDate: (state, action: PayloadAction<string | null>) => {
      state.startDate = action.payload;
      state.isFiltering = true;
    },
    setEndDate: (state, action: PayloadAction<string | null>) => {
      state.endDate = action.payload;
      state.isFiltering = true;
    },
    setStartTime: (state, action: PayloadAction<string>) => {
      state.startTime = action.payload;
      // Uncheck "All Day" if time is manually changed
      if (action.payload !== "00:00") {
        state.allDayChecked = false;
      }
      state.isFiltering = true;
    },
    setEndTime: (state, action: PayloadAction<string>) => {
      state.endTime = action.payload;
      // Uncheck "All Day" if time is manually changed
      if (action.payload !== "23:59") {
        state.allDayChecked = false;
      }
      state.isFiltering = true;
    },
    setAllDayChecked: (state, action: PayloadAction<boolean>) => {
      state.allDayChecked = action.payload;
      if (action.payload) {
        state.startTime = "00:00";
        state.endTime = "23:59";
      }
      state.isFiltering = true;
    },
    setAggregationOption: (state, action: PayloadAction<string>) => {
      state.selectedAggregationOption = action.payload;
      state.isFiltering = true;
    },
    setSignalId: (state, action: PayloadAction<string>) => {
      state.signalId = action.payload;
      // Clear attribute filters if Signal ID is entered
      if (action.payload) {
        state.selectedSignalGroup = "";
        state.selectedDistrict = "";
        state.selectedAgency = "";
        state.selectedCounty = "";
        state.selectedCity = "";
        state.selectedCorridor = "";
        state.selectedSubcorridor = "";
        state.selectedPriority = "";
        state.selectedClassification = "";
      }
    },
    setSignalGroup: (state, action: PayloadAction<string>) => {
      state.selectedSignalGroup = action.payload;
      // When zone group changes, reset dependent filters
      state.selectedDistrict = "";
      // Set filtering flag to true when value changes
      state.isFiltering = true;
    },
    setDistrict: (state, action: PayloadAction<string>) => {
      state.selectedDistrict = action.payload;
      state.isFiltering = true;
    },
    setAgency: (state, action: PayloadAction<string>) => {
      state.selectedAgency = action.payload;
      state.isFiltering = true;
    },
    setCounty: (state, action: PayloadAction<string>) => {
      state.selectedCounty = action.payload;
      state.isFiltering = true;
    },
    setCity: (state, action: PayloadAction<string>) => {
      state.selectedCity = action.payload;
      state.isFiltering = true;
    },
    setCorridor: (state, action: PayloadAction<string>) => {
      state.selectedCorridor = action.payload;
      // When corridor changes, reset subcorridor
      state.selectedSubcorridor = "";
      state.isFiltering = true;
    },
    setSubcorridor: (state, action: PayloadAction<string>) => {
      state.selectedSubcorridor = action.payload;
      state.isFiltering = true;
    },
    setPriority: (state, action: PayloadAction<string>) => {
      state.selectedPriority = action.payload;
      state.isFiltering = true;
    },
    setClassification: (state, action: PayloadAction<string>) => {
      state.selectedClassification = action.payload;
      state.isFiltering = true;
    },
    setErrorState: (state, action: PayloadAction<number>) => {
      state.errorState = action.payload;
    },
    setIsFiltering: (state, action: PayloadAction<boolean>) => {
      consoledebug(`Setting isFiltering to: ${action.payload}`);
      state.isFiltering = action.payload;
    },
    setFiltersApplied: (state, action: PayloadAction<boolean>) => {
      consoledebug(`Setting filtersApplied to: ${action.payload}`);
      state.filtersApplied = !state.filtersApplied;
    },
    // Reset all filters to default values
    resetFilters: (state) => {
      consoledebug('Resetting all filters to defaults');
      state.selectedDateOption = "4";
      state.startDate = null;
      state.endDate = null;
      state.startTime = "00:00";
      state.endTime = "23:59";
      state.selectedAggregationOption = "4";
      state.signalId = "";
      state.selectedSignalGroup = "Central Metro";
      state.selectedDistrict = "";
      state.selectedAgency = "";
      state.selectedCounty = "";
      state.selectedCity = "";
      state.selectedCorridor = "";
      state.selectedSubcorridor = "";
      state.selectedPriority = "";
      state.selectedClassification = "";
      state.allDayChecked = true;
      state.errorState = 1;
      
      // Reset isFiltering to false when filters are reset
      // This matches the Angular behavior
      state.isFiltering = false;
      
      // Reset filtersApplied when filters are reset
      state.filtersApplied = !state.filtersApplied;
    },
    // Save filters as default in local storage
    saveAsDefaults: (state) => {
      consoledebug('Saving current filters as defaults');
      const filters = {
        selectedDateOption: state.selectedDateOption,
        startDate: state.startDate,
        endDate: state.endDate,
        startTime: state.startTime,
        endTime: state.endTime,
        selectedAggregationOption: state.selectedAggregationOption,
        signalId: state.signalId,
        selectedSignalGroup: state.selectedSignalGroup,
        selectedDistrict: state.selectedDistrict,
        selectedAgency: state.selectedAgency,
        selectedCounty: state.selectedCounty,
        selectedCity: state.selectedCity,
        selectedCorridor: state.selectedCorridor,
        selectedSubcorridor: state.selectedSubcorridor,
        selectedPriority: state.selectedPriority,
        selectedClassification: state.selectedClassification,
        allDayChecked: state.allDayChecked,
      };
      localStorage.setItem('filters', JSON.stringify(filters));
      
      // Set isFiltering to false when saving defaults
      // This matches the Angular behavior where filter changes are "applied" when saving defaults
      state.isFiltering = false;
      
      // Set filtersApplied to true to trigger data refresh
      state.filtersApplied = !state.filtersApplied;
    },
    // Load saved filters from local storage
    loadSavedFilters: (state) => {
      const savedFilters = localStorage.getItem('filters');
      if (savedFilters) {
        const filters = JSON.parse(savedFilters);
        state.selectedDateOption = filters.selectedDateOption || "4";
        state.startDate = filters.startDate || null;
        state.endDate = filters.endDate || null;
        state.startTime = filters.startTime || "00:00";
        state.endTime = filters.endTime || "23:59";
        state.selectedAggregationOption = filters.selectedAggregationOption || "4";
        state.signalId = filters.signalId || "";
        state.selectedSignalGroup = filters.selectedSignalGroup || "Central Metro";
        state.selectedDistrict = filters.selectedDistrict || "";
        state.selectedAgency = filters.selectedAgency || "";
        state.selectedCounty = filters.selectedCounty || "";
        state.selectedCity = filters.selectedCity || "";
        state.selectedCorridor = filters.selectedCorridor || "";
        state.selectedSubcorridor = filters.selectedSubcorridor || "";
        state.selectedPriority = filters.selectedPriority || "";
        state.selectedClassification = filters.selectedClassification || "";
        state.allDayChecked = filters.allDayChecked !== undefined ? filters.allDayChecked : true;
      }
    },
  },
  extraReducers: (builder) => {
    // Handle zone groups
    builder.addCase(fetchZoneGroups.pending, (state) => {
      state.loading.zoneGroups = true;
    });
    builder.addCase(fetchZoneGroups.fulfilled, (state, action) => {
      state.loading.zoneGroups = false;
      state.zoneGroups = action.payload;
    });
    builder.addCase(fetchZoneGroups.rejected, (state) => {
      state.loading.zoneGroups = false;
      state.errorState = 2; // Warning
    });

    // Handle zones
    builder.addCase(fetchZones.pending, (state) => {
      state.loading.zones = true;
      consoledebug('Loading all zones - pending');
    });
    builder.addCase(fetchZones.fulfilled, (state, action) => {
      state.loading.zones = false;
      // Only update if we actually got data back
      if (Array.isArray(action.payload) && action.payload.length > 0) {
        state.zones = action.payload;
        consoledebug('All zones loaded successfully:', action.payload.length, 'zones');
      } else {
        console.warn('Received empty zones list from API');
      }
    });
    builder.addCase(fetchZones.rejected, (state, action) => {
      state.loading.zones = false;
      state.errorState = 2;
      console.error('Failed to load zones:', action.error);
    });

    // Handle zones by zone group
    builder.addCase(fetchZonesByZoneGroup.pending, (state) => {
      state.loading.zones = true;
      consoledebug('Loading filtered zones - pending');
    });
    builder.addCase(fetchZonesByZoneGroup.fulfilled, (state, action) => {
      state.loading.zones = false;
      // Only update zones if we got a non-empty array back
      if (Array.isArray(action.payload) && action.payload.length > 0) {
        state.zones = action.payload;
        consoledebug('Filtered zones loaded successfully:', action.payload.length, 'zones');
      } else {
        console.warn('Received empty filtered zones list, keeping existing zones');
      }
    });
    builder.addCase(fetchZonesByZoneGroup.rejected, (state, action) => {
      state.loading.zones = false;
      console.warn('Failed to load filtered zones:', action.error);
      // Don't change error state here as we're keeping existing zones
      // state.errorState = 2;
    });

    // Handle agencies
    builder.addCase(fetchAgencies.pending, (state) => {
      state.loading.agencies = true;
    });
    builder.addCase(fetchAgencies.fulfilled, (state, action) => {
      state.loading.agencies = false;
      state.agencies = action.payload;
    });
    builder.addCase(fetchAgencies.rejected, (state) => {
      state.loading.agencies = false;
      state.errorState = 2;
    });

    // Handle counties
    builder.addCase(fetchCounties.pending, (state) => {
      state.loading.counties = true;
    });
    builder.addCase(fetchCounties.fulfilled, (state, action) => {
      state.loading.counties = false;
      state.counties = action.payload;
    });
    builder.addCase(fetchCounties.rejected, (state) => {
      state.loading.counties = false;
      state.errorState = 2;
    });

    // Handle cities
    builder.addCase(fetchCities.pending, (state) => {
      state.loading.cities = true;
    });
    builder.addCase(fetchCities.fulfilled, (state, action) => {
      state.loading.cities = false;
      state.cities = action.payload;
    });
    builder.addCase(fetchCities.rejected, (state) => {
      state.loading.cities = false;
      state.errorState = 2;
    });

    // Handle corridors
    builder.addCase(fetchCorridors.pending, (state) => {
      state.loading.corridors = true;
    });
    builder.addCase(fetchCorridors.fulfilled, (state, action) => {
      state.loading.corridors = false;
      state.corridors = action.payload;
    });
    builder.addCase(fetchCorridors.rejected, (state) => {
      state.loading.corridors = false;
      state.errorState = 2;
    });

    // Handle corridors by filter
    builder.addCase(fetchCorridorsByFilter.pending, (state) => {
      state.loading.corridors = true;
    });
    builder.addCase(fetchCorridorsByFilter.fulfilled, (state, action) => {
      state.loading.corridors = false;
      state.corridors = action.payload;
    });
    builder.addCase(fetchCorridorsByFilter.rejected, (state) => {
      state.loading.corridors = false;
      state.errorState = 2;
    });

    // Handle subcorridors
    builder.addCase(fetchSubcorridors.pending, (state) => {
      state.loading.subcorridors = true;
    });
    builder.addCase(fetchSubcorridors.fulfilled, (state, action) => {
      state.loading.subcorridors = false;
      state.subcorridors = action.payload;
    });
    builder.addCase(fetchSubcorridors.rejected, (state) => {
      state.loading.subcorridors = false;
      state.errorState = 2;
    });

    // Handle subcorridors by corridor
    builder.addCase(fetchSubcorridorsByCorridor.pending, (state) => {
      state.loading.subcorridors = true;
    });
    builder.addCase(fetchSubcorridorsByCorridor.fulfilled, (state, action) => {
      state.loading.subcorridors = false;
      state.subcorridors = action.payload;
    });
    builder.addCase(fetchSubcorridorsByCorridor.rejected, (state) => {
      state.loading.subcorridors = false;
      state.errorState = 2;
    });

    // Handle priorities
    builder.addCase(fetchPriorities.pending, (state) => {
      state.loading.priorities = true;
    });
    builder.addCase(fetchPriorities.fulfilled, (state, action) => {
      state.loading.priorities = false;
      state.priorities = action.payload;
    });
    builder.addCase(fetchPriorities.rejected, (state) => {
      state.loading.priorities = false;
      state.errorState = 2;
    });

    // Handle classifications
    builder.addCase(fetchClassifications.pending, (state) => {
      state.loading.classifications = true;
    });
    builder.addCase(fetchClassifications.fulfilled, (state, action) => {
      state.loading.classifications = false;
      state.classifications = action.payload;
    });
    builder.addCase(fetchClassifications.rejected, (state) => {
      state.loading.classifications = false;
      state.errorState = 2;
    });
  },
});

export const {
  setDateOption,
  setStartDate,
  setEndDate,
  setStartTime,
  setEndTime,
  setAllDayChecked,
  setAggregationOption,
  setSignalId,
  setSignalGroup,
  setDistrict,
  setAgency,
  setCounty,
  setCity,
  setCorridor,
  setSubcorridor,
  setPriority,
  setClassification,
  setErrorState,
  setIsFiltering,
  setFiltersApplied,
  resetFilters,
  saveAsDefaults,
  loadSavedFilters,
} = filterSlice.actions;

export default filterSlice.reducer;

export const selectFilterParams = (state: RootState): FilterParams => {
  const filter = state.filter;
  return {
    dateRange: parseInt(filter.selectedDateOption),
    timePeriod: parseInt(filter.selectedAggregationOption),
    customStart: filter.startDate,
    customEnd: filter.endDate,
    daysOfWeek: null, // Add if needed
    startTime: filter.allDayChecked ? null : filter.startTime,
    endTime: filter.allDayChecked ? null : filter.endTime,
    zone_Group: filter.selectedSignalGroup,
    zone: filter.selectedDistrict || null,
    agency: filter.selectedAgency || null,
    county: filter.selectedCounty || null,
    city: filter.selectedCity || null,
    corridor: filter.selectedCorridor || null,
    signalId: filter.signalId,
    priority: filter.selectedPriority,
    classification: filter.selectedClassification
  };
}; 