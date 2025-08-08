import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { 
    MaintenanceMetric, 
    OperationsMetric, 
    SafetyMetric, 
    RegionAverage,
    FetchMetricsParams,
    healthMetricsApi 
} from '../../services/api/healthMetricsApi';
import { FilterParams, MetricData, MetricsFilterRequest } from '../../types/api.types';
import { metricsApi } from '../../services/api/metricsApi';
import { consoledebug } from '../../utils/debug';

export interface TrendDataPoint {
    timestamp: string;
    value: number;
    trend?: number;
}

export interface MetricsTrendRequest {
    metricType: 'maintenance' | 'operation' | 'safety';
    startDate: string;
    endDate: string;
}

// Signal interface
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

export interface SummaryTrendData {
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
}

interface MetricsState {
    signals: Signal[];
    maintenance: {
        data: MaintenanceMetric[];
        loading: boolean;
        error: string | null;
    };
    operations: {
        data: OperationsMetric[];
        loading: boolean;
        error: string | null;
    };
    safety: {
        data: SafetyMetric[];
        loading: boolean;
        error: string | null;
    };
    regions: {
        north: RegionAverage | null;
        southeast: RegionAverage | null;
        southwest: RegionAverage | null;
        centralMetro: RegionAverage | null;
        westernMetro: RegionAverage | null;
        easternMetro: RegionAverage | null;
        statewide: RegionAverage | null;
        loading: boolean;
        error: string | null;
    };
    trendData: TrendDataPoint[];
    loading: boolean;
    error: string | null;
    summaryTrends: {
        data: SummaryTrendData | null;
        loading: boolean;
        error: string | null;
    };
    // New state properties for API calls
    metricsFilter: {
        data: MetricData[] | null;
        loading: boolean;
        error: string | null;
    };
    metricsAverage: {
        data: number | null;
        loading: boolean;
        error: string | null;
    };
    straightAverage: {
        data: number | null;
        loading: boolean;
        error: string | null;
    };
    signalsFilterAverage: {
        data: any[] | null;
        loading: boolean;
        error: string | null;
    };
}

const initialState: MetricsState = {
    signals: [],
    maintenance: {
        data: [],
        loading: false,
        error: null
    },
    operations: {
        data: [],
        loading: false,
        error: null
    },
    safety: {
        data: [],
        loading: false,
        error: null
    },
    regions: {
        north: null,
        southeast: null,
        southwest: null,
        centralMetro: null,
        westernMetro: null,
        easternMetro: null,
        statewide: null,
        loading: false,
        error: null
    },
    trendData: [],
    loading: false,
    error: null,
    summaryTrends: {
        data: null,
        loading: false,
        error: null
    },
    // Initialize new state properties
    metricsFilter: {
        data: null,
        loading: false,
        error: null
    },
    metricsAverage: {
        data: null,
        loading: false,
        error: null
    },
    straightAverage: {
        data: null,
        loading: false,
        error: null
    },
    signalsFilterAverage: {
        data: null,
        loading: false,
        error: null
    }
};

// Add fetchAllSignals thunk
export const fetchAllSignals = createAsyncThunk<Signal[], void, { rejectValue: string }>(
    'metrics/fetchAllSignals',
    async (_, { rejectWithValue }) => {
        try {
            // Call the existing API method from MetricsApi
            return await metricsApi.getAllSignals();
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to fetch signals');
        }
    }
);

// Fetch maintenance metrics
export const fetchMaintenanceMetrics = createAsyncThunk<
    MaintenanceMetric[],
    { start: string, end: string },
    { rejectValue: string }
>(
    'metrics/fetchMaintenance',
    async ({ start, end }, { rejectWithValue }) => {
        try {
            const params: FetchMetricsParams = {
                measure: 'maint_plot',
                start,
                end
            };
            const data = await healthMetricsApi.fetchMetrics(params) as MaintenanceMetric[];
            return data;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to fetch maintenance metrics');
        }
    }
);

// Fetch operations metrics
export const fetchOperationsMetrics = createAsyncThunk<
    OperationsMetric[],
    { start: string, end: string },
    { rejectValue: string }
>(
    'metrics/fetchOperations',
    async ({ start, end }, { rejectWithValue }) => {
        try {
            const params: FetchMetricsParams = {
                measure: 'ops_plot',
                start,
                end
            };
            const data = await healthMetricsApi.fetchMetrics(params) as OperationsMetric[];
            return data;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to fetch operations metrics');
        }
    }
);

// Fetch safety metrics
export const fetchSafetyMetrics = createAsyncThunk<
    SafetyMetric[],
    { start: string, end: string },
    { rejectValue: string }
>(
    'metrics/fetchSafety',
    async ({ start, end }, { rejectWithValue }) => {
        try {
            const params: FetchMetricsParams = {
                measure: 'safety_plot',
                start,
                end
            };
            const data = await healthMetricsApi.fetchMetrics(params) as SafetyMetric[];
            return data;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to fetch safety metrics');
        }
    }
);

// Fetch region averages
export const fetchRegionAverages = createAsyncThunk<
    {
        north: RegionAverage;
        southeast: RegionAverage;
        southwest: RegionAverage;
        centralMetro: RegionAverage;
        westernMetro: RegionAverage;
        easternMetro: RegionAverage;
        statewide: RegionAverage;
    },
    string,
    { rejectValue: string }
>(
    'metrics/fetchRegionAverages',
    async (month, { rejectWithValue }) => {
        try {
            const regions = {
                north: await healthMetricsApi.fetchRegionAverage({ zoneGroup: 'North', month }),
                southeast: await healthMetricsApi.fetchRegionAverage({ zoneGroup: 'Southeast', month }),
                southwest: await healthMetricsApi.fetchRegionAverage({ zoneGroup: 'Southwest', month }),
                centralMetro: await healthMetricsApi.fetchRegionAverage({ zoneGroup: 'Central Metro', month }),
                westernMetro: await healthMetricsApi.fetchRegionAverage({ zoneGroup: 'Western Metro', month }),
                easternMetro: await healthMetricsApi.fetchRegionAverage({ zoneGroup: 'Eastern Metro', month }),
                statewide: await healthMetricsApi.fetchRegionAverage({ zoneGroup: '', month })
            };
            return regions;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to fetch region averages');
        }
    }
);

// Existing fetchMetricsTrendData thunk
export const fetchMetricsTrendData = createAsyncThunk<
    TrendDataPoint[],
    MetricsTrendRequest,
    { rejectValue: string }
>(
    'metrics/fetchTrendData',
    async (_params, { rejectWithValue }) => {
        try {
            // This is a placeholder for actual API implementation
            // Would call an API endpoint for trend data
            const mockData: TrendDataPoint[] = Array.from({ length: 7 }, (_, i) => ({
                timestamp: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString(),
                value: Math.floor(Math.random() * 100),
                trend: Math.floor(Math.random() * 50)
            }));
            
            return mockData;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to fetch trend data');
        }
    }
);

// Fetch summary trends
export const fetchSummaryTrends = createAsyncThunk<
    SummaryTrendData,
    FilterParams,
    { rejectValue: string }
>(
    'metrics/fetchSummaryTrends',
    async (filterParams, { rejectWithValue }) => {
        try {
            const data = await metricsApi.getSummaryTrends(filterParams);
            return data;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to fetch summary trends');
        }
    }
);

// New thunk for getMetricsFilter
export const fetchMetricsFilter = createAsyncThunk<
    MetricData[],
    { params: MetricsFilterRequest, filterParams: FilterParams },
    { rejectValue: string }
>(
    'metrics/fetchMetricsFilter',
    async ({ params, filterParams }, { rejectWithValue }) => {
        try {
            const data = await metricsApi.getMetricsFilter(params, filterParams);
            return data;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to fetch metrics filter');
        }
    }
);

// New thunk for getMetricsAverage
export const fetchMetricsAverage = createAsyncThunk<
    number,
    { params: MetricsFilterRequest, filterParams: FilterParams },
    { rejectValue: string }
>(
    'metrics/fetchMetricsAverage',
    async ({ params, filterParams }, { rejectWithValue }) => {
        try {
            const data = await metricsApi.getMetricsAverage(params, filterParams);
            return data;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to fetch metrics average');
        }
    }
);

// New thunk for getStraightAverage
export const fetchStraightAverage = createAsyncThunk<
    number,
    { params: MetricsFilterRequest, filterParams: FilterParams },
    { rejectValue: string }
>(
    'metrics/fetchStraightAverage',
    async ({ params, filterParams }, { rejectWithValue }) => {
        try {
            const data = await metricsApi.getStraightAverage(params, filterParams);
            return data;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to fetch straight average');
        }
    }
);

// New thunk for getSignalsFilterAverage
export const fetchSignalsFilterAverage = createAsyncThunk<
    any[],
    { params: MetricsFilterRequest, filterParams: FilterParams },
    { rejectValue: string }
>(
    'metrics/fetchSignalsFilterAverage',
    async ({ params, filterParams }, { rejectWithValue }) => {
        try {
            const data = await metricsApi.getSignalsFilterAverage(params, filterParams);
            return data;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to fetch signals filter average');
        }
    }
);

const metricsSlice = createSlice({
    name: 'metrics',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        // Add fetchAllSignals cases
        builder.addCase(fetchAllSignals.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(fetchAllSignals.fulfilled, (state, action) => {
            state.loading = false;
            state.signals = action.payload;
        });
        builder.addCase(fetchAllSignals.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });

        // Maintenance metrics
        builder.addCase(fetchMaintenanceMetrics.pending, (state) => {
            state.maintenance.loading = true;
            state.maintenance.error = null;
        });
        builder.addCase(fetchMaintenanceMetrics.fulfilled, (state, action) => {
            state.maintenance.loading = false;
            state.maintenance.data = action.payload;
        });
        builder.addCase(fetchMaintenanceMetrics.rejected, (state, action) => {
            state.maintenance.loading = false;
            state.maintenance.error = action.payload as string;
        });

        // Operations metrics
        builder.addCase(fetchOperationsMetrics.pending, (state) => {
            state.operations.loading = true;
            state.operations.error = null;
        });
        builder.addCase(fetchOperationsMetrics.fulfilled, (state, action) => {
            state.operations.loading = false;
            state.operations.data = action.payload;
        });
        builder.addCase(fetchOperationsMetrics.rejected, (state, action) => {
            state.operations.loading = false;
            state.operations.error = action.payload as string;
        });

        // Safety metrics
        builder.addCase(fetchSafetyMetrics.pending, (state) => {
            state.safety.loading = true;
            state.safety.error = null;
        });
        builder.addCase(fetchSafetyMetrics.fulfilled, (state, action) => {
            state.safety.loading = false;
            state.safety.data = action.payload;
        });
        builder.addCase(fetchSafetyMetrics.rejected, (state, action) => {
            state.safety.loading = false;
            state.safety.error = action.payload as string;
        });

        // Region averages
        builder.addCase(fetchRegionAverages.pending, (state) => {
            state.regions.loading = true;
            state.regions.error = null;
        });
        builder.addCase(fetchRegionAverages.fulfilled, (state, action) => {
            state.regions.loading = false;
            state.regions = {
                ...state.regions,
                ...action.payload,
                loading: false,
                error: null
            };
        });
        builder.addCase(fetchRegionAverages.rejected, (state, action) => {
            state.regions.loading = false;
            state.regions.error = action.payload as string;
        });

        // Trend data
        builder.addCase(fetchMetricsTrendData.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(fetchMetricsTrendData.fulfilled, (state, action) => {
            state.loading = false;
            state.trendData = action.payload;
        });
        builder.addCase(fetchMetricsTrendData.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });

        // Summary trends
        builder.addCase(fetchSummaryTrends.pending, (state) => {
            state.summaryTrends.loading = true;
            state.summaryTrends.error = null;
        });
        builder.addCase(fetchSummaryTrends.fulfilled, (state, action) => {
            state.summaryTrends.loading = false;
            state.summaryTrends.data = action.payload;
        });
        builder.addCase(fetchSummaryTrends.rejected, (state, action) => {
            state.summaryTrends.loading = false;
            state.summaryTrends.error = action.payload as string;
        });

        // Metrics Filter
        builder.addCase(fetchMetricsFilter.pending, (state) => {
            state.metricsFilter.loading = true;
            state.metricsFilter.error = null;
        });
        builder.addCase(fetchMetricsFilter.fulfilled, (state, action) => {
            state.metricsFilter.loading = false;
            state.metricsFilter.data = action.payload;
        });
        builder.addCase(fetchMetricsFilter.rejected, (state, action) => {
            state.metricsFilter.loading = false;
            state.metricsFilter.error = action.payload as string;
        });

        // Metrics Average
        builder.addCase(fetchMetricsAverage.pending, (state) => {
            state.metricsAverage.loading = true;
            state.metricsAverage.error = null;
        });
        builder.addCase(fetchMetricsAverage.fulfilled, (state, action) => {
            state.metricsAverage.loading = false;
            state.metricsAverage.data = action.payload;
        });
        builder.addCase(fetchMetricsAverage.rejected, (state, action) => {
            state.metricsAverage.loading = false;
            state.metricsAverage.error = action.payload as string;
        });

        // Straight Average
        builder.addCase(fetchStraightAverage.pending, (state) => {
            state.straightAverage.loading = true;
            state.straightAverage.error = null;
        });
        builder.addCase(fetchStraightAverage.fulfilled, (state, action) => {
            state.straightAverage.loading = false;
            state.straightAverage.data = action.payload;
        });
        builder.addCase(fetchStraightAverage.rejected, (state, action) => {
            state.straightAverage.loading = false;
            state.straightAverage.error = action.payload as string;
        });

        // Signals Filter Average
        builder.addCase(fetchSignalsFilterAverage.pending, (state) => {
            state.signalsFilterAverage.loading = true;
            state.signalsFilterAverage.error = null;
        });
        builder.addCase(fetchSignalsFilterAverage.fulfilled, (state, action) => {
            state.signalsFilterAverage.loading = false;
            consoledebug("action.payload:", action.payload);
            state.signalsFilterAverage.data = action.payload;
        });
        builder.addCase(fetchSignalsFilterAverage.rejected, (state, action) => {
            state.signalsFilterAverage.loading = false;
            state.signalsFilterAverage.error = action.payload as string;
        });
    }
});

export default metricsSlice.reducer; 