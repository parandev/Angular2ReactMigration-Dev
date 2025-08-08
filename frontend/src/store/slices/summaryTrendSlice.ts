import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { FilterParams } from '../../types/api.types';
import { SummaryTrendResponse, summaryTrendApi } from '../../services/api/summaryTrendApi';
// Define the state interface
interface SummaryTrendState {
  data: SummaryTrendResponse | null;
  loading: boolean;
  error: string | null;
  currentFilter: FilterParams | null;
}

// Define the initial state
const initialState: SummaryTrendState = {
  data: null,
  loading: false,
  error: null,
  currentFilter: null
};

// Create the async thunk for fetching summary trend data
export const fetchSummaryTrends = createAsyncThunk<
  SummaryTrendResponse, // return type
  FilterParams, // argument type
  { rejectValue: string } // reject type
>(
  'summaryTrend/fetchSummaryTrends',
  async (filterParams, { rejectWithValue }) => {
    try {
      const data = await summaryTrendApi.getSummaryTrends(filterParams);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch summary trends');
    }
  }
);

// Create the slice
const summaryTrendSlice = createSlice({
  name: 'summaryTrend',
  initialState,
  reducers: {
    // Add any additional reducers if needed
    setCurrentFilter: (state, action: PayloadAction<FilterParams>) => {
      state.currentFilter = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Handle fetchSummaryTrends pending
      .addCase(fetchSummaryTrends.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      // Handle fetchSummaryTrends fulfilled
      .addCase(fetchSummaryTrends.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      // Handle fetchSummaryTrends rejected
      .addCase(fetchSummaryTrends.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch summary trends';
      });
  }
});

// Export actions and reducer
export const { setCurrentFilter } = summaryTrendSlice.actions;
export default summaryTrendSlice.reducer; 