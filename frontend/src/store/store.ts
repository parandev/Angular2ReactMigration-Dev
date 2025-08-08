import { configureStore } from '@reduxjs/toolkit';
import metricsReducer from './slices/metricsSlice';
import watchdogReducer from './slices/watchdogSlice';
import summaryTrendReducer from './slices/summaryTrendSlice';
import filterReducer from './slices/filterSlice';

export const store = configureStore({
    reducer: {
        metrics: metricsReducer,
        watchdog: watchdogReducer,
        summaryTrend: summaryTrendReducer,
        filter: filterReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 