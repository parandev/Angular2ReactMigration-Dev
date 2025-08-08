import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { watchdogApi, WatchdogData } from '../../services/api/watchdogApi';
import { WatchdogParams } from '../../types/api.types';

interface WatchdogState {
    data: WatchdogData[];
    loading: boolean;
    error: string | null;
}

const initialState: WatchdogState = {
    data: [],
    loading: false,
    error: null,
};

export const fetchWatchdogData = createAsyncThunk(
    'watchdog/fetchData',
    async (params: WatchdogParams) => {
        return await watchdogApi.getWatchdogData(params);
    }
);

const watchdogSlice = createSlice({
    name: 'watchdog',
    initialState,
    reducers: {
        clearWatchdogData: (state) => {
            state.data = [];
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchWatchdogData.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchWatchdogData.fulfilled, (state, action: PayloadAction<WatchdogData[]>) => {
                state.loading = false;
                state.data = action.payload;
            })
            .addCase(fetchWatchdogData.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch watchdog data';
            });
    },
});

export const { clearWatchdogData } = watchdogSlice.actions;
export default watchdogSlice.reducer; 