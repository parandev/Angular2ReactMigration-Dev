"use client"

import type React from "react"

import { useState, useEffect, useMemo, useCallback } from "react"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import Paper from "@mui/material/Paper"
import Grid from "@mui/material/Grid"
import Tabs from "@mui/material/Tabs"
import Tab from "@mui/material/Tab"
import CircularProgress from "@mui/material/CircularProgress"

import MapBox from "../../components/MapBox"
import mapSettings from "../../utils/mapSettings"
import LocationBarChart from "../charts/LocationBarChart"
import TimeSeriesChart from "../charts/TimeSeriesChart"
import ErrorDisplay from "../ErrorDisplay"
import { useAppDispatch, useAppSelector } from '../../hooks/useTypedSelector'
import { 
  fetchStraightAverage,
  fetchAllSignals,
  fetchMetricsFilter,
  fetchMetricsAverage,
  fetchSignalsFilterAverage
} from '../../store/slices/metricsSlice'
import { MetricsFilterRequest } from '../../types/api.types'
import { useSelector } from "react-redux"
import { selectFilterParams } from "../../store/slices/filterSlice"
import { chartTitles } from "../../constants/mapData"
import useDocumentTitle from "../../hooks/useDocumentTitle"

// Define the available metrics
const metrics = [
  { id: "throughput", label: "Throughput", key: "tp" },
  { id: "dailyTrafficVolumes", label: "Daily Traffic Volumes", key: "vpd" },
  { id: "arrivalsOnGreen", label: "Arrivals on Green", key: "aogd" },
  { id: "progressionRatio", label: "Progression Ratio", key: "prd" },
  { id: "spillbackRatio", label: "Spillback Rate", key: "qsd" },
  { id: "peakPeriodSplitFailures", label: "Peak Period Split Failures", key: "sfd" },
  { id: "offPeakSplitFailures", label: "Off-Peak Split Failures", key: "sfo" },
  { id: "travelTimeIndex", label: "Travel Time Index", key: "tti" },
  { id: "planningTimeIndex", label: "Planning Time Index", key: "pti" },
]

// Types for component-specific data
interface LocationMetric {
  location: string;
  value: number;
}

interface TimeSeriesData {
  date: string;
  value: number;
  location: string;
}

interface MapPoint {
  lat: number;
  lon: number;
  value: number;
  name: string;
  signalID?: string;
  mainStreet?: string;
  sideStreet?: string;
}

const metricValueKeys: Record<string, string> = {
  dailyTrafficVolumes: "vpd",
  throughput: "vph",
  arrivalsOnGreen: "aog",
  progressionRatio: "pr", 
  spillbackRatio: "qs_freq",
  peakPeriodSplitFailures: "sf_freq",
  offPeakSplitFailures: "sf_freq",
  travelTimeIndex: "tti",
  planningTimeIndex: "pti"
};

// Map metric IDs to mapSettings keys
const metricToSettingsMap: Record<string, string> = {
  dailyTrafficVolumes: "dailyTrafficVolume",
  throughput: "throughput",
  arrivalsOnGreen: "arrivalsOnGreen",
  progressionRatio: "progressionRate",
  spillbackRatio: "spillbackRate",
  peakPeriodSplitFailures: "peakPeriodSplitFailures",
  offPeakSplitFailures: "offPeakSplitFailures",
  travelTimeIndex: "",  // No map settings for this metric
  planningTimeIndex: "",  // No map settings for this metric
};

export default function Operations() {
  // State for selected metric
  const [selectedMetric, setSelectedMetric] = useState("throughput")
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null)
  const [hoveredLocation, setHoveredLocation] = useState<string | null>(null)

  const commonFilterParams = useSelector(selectFilterParams);
  
  // Create a stable key from the actual filter values that matter for API calls
  const filterKey = useMemo(() => {
    return JSON.stringify({
      dateRange: commonFilterParams.dateRange,
      timePeriod: commonFilterParams.timePeriod,
      customStart: commonFilterParams.customStart,
      customEnd: commonFilterParams.customEnd,
      startTime: commonFilterParams.startTime,
      endTime: commonFilterParams.endTime,
      zone_Group: commonFilterParams.zone_Group,
      zone: commonFilterParams.zone,
      agency: commonFilterParams.agency,
      county: commonFilterParams.county,
      city: commonFilterParams.city,
      corridor: commonFilterParams.corridor,
      signalId: commonFilterParams.signalId,
      priority: commonFilterParams.priority,
      classification: commonFilterParams.classification
    });
  }, [commonFilterParams]);
  
  // Redux state
  const dispatch = useAppDispatch();
  const { 
    signals,
    straightAverage,
    metricsFilter,
    metricsAverage,
    signalsFilterAverage,
    error: signalsError
  } = useAppSelector(state => state.metrics);
  
  // Remove global loading - we'll use section-specific loading instead

  // Memoize the current metric to prevent unnecessary recalculations
  const currentMetric = useMemo(() => 
    metrics.find(m => m.id === selectedMetric), 
    [selectedMetric]
  );

  // Memoize the selected metric key
  const selectedMetricKey = useMemo(() => 
    currentMetric?.key || "vpd", 
    [currentMetric]
  );

  useDocumentTitle({
    route: 'Operations',
    tab: currentMetric?.label
  });

  // Memoize processed location metrics
  const locationMetrics = useMemo((): LocationMetric[] => {
    if (!metricsAverage.data || !Array.isArray(metricsAverage.data)) {
      return [];
    }
    
    return metricsAverage.data
      .map((item: { label: string; avg: number }) => ({
        location: item.label,
        value: item.avg || 0
      }))
      .sort((a: LocationMetric, b: LocationMetric) => a.value - b.value);
  }, [metricsAverage.data, filterKey]);

  // Memoize processed time series data
  const timeSeriesData = useMemo((): TimeSeriesData[] => {
    if (!metricsFilter.data || !Array.isArray(metricsFilter.data)) {
      return [];
    }
    
    const formatDate = (dateString: string): string => {
      if (!dateString) return '';
      try {
        const date = new Date(dateString);
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
      } catch {
        return dateString;
      }
    };
    
    return metricsFilter.data.map((item: Record<string, string | number>) => {
      const metricValue = item[metricValueKeys[selectedMetric]] || 0;
      return {
        date: formatDate((item.month as string) || ''),
        value: parseFloat(String(metricValue)),
        location: (item.corridor as string) || 'Unknown'
      };
    });
  }, [metricsFilter.data, selectedMetric, filterKey]);

  // Memoize colors based on sorted order to prevent consecutive same colors
  const locationColors = useMemo(() => {
    const colors = [
      '#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd',
      '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf'
    ];
    const getLocationColor = (index: number) => colors[index % colors.length];
    
    if (!metricsAverage.data || !Array.isArray(metricsAverage.data)) {
      return {};
    }
    
    // Create color mapping based on sorted order (by value) to avoid consecutive same colors
    const sortedLocationColors: Record<string, string> = {};
    locationMetrics.forEach((item, index) => {
      sortedLocationColors[item.location] = getLocationColor(index);
    });

    // Get all unique locations from both data sources for time series
    const allUniqueLocations = Array.from(new Set([
      ...locationMetrics.map(item => item.location),
      ...timeSeriesData.map(item => item.location)
    ]));

    // Create comprehensive color mapping: prioritize sorted colors, fill gaps for time series locations
    const comprehensiveLocationColors: Record<string, string> = { ...sortedLocationColors };
    let nextColorIndex = locationMetrics.length; // Start after the sorted data colors
    
    allUniqueLocations.forEach(location => {
      if (!comprehensiveLocationColors[location]) {
        comprehensiveLocationColors[location] = getLocationColor(nextColorIndex);
        nextColorIndex++;
      }
    });
    
    return comprehensiveLocationColors;
  }, [locationMetrics, timeSeriesData, filterKey]);

  // Memoize processed map data
  const mapData = useMemo((): MapPoint[] => {
    if (!signals.length || !signalsFilterAverage.data || !Array.isArray(signalsFilterAverage.data)) {
      return [];
    }
    
    // Create a map of signal IDs to metric values
    const metricMap = new Map<string, number>();
    signalsFilterAverage.data.forEach((item: { label: string; avg: number }) => {
      metricMap.set(item.label, item.avg);
    });
    
    // Map signals to map points
    return signals
      .filter((signal) => signal.latitude && signal.longitude && signal.signalID)
      .map((signal) => {
        const value = metricMap.get(signal.signalID!) || 0;
        
        return {
          lat: signal.latitude,
          lon: signal.longitude,
          value,
          name: signal.mainStreetName ? (signal.sideStreetName ? 
            `${signal.mainStreetName} @ ${signal.sideStreetName}` : 
            signal.mainStreetName) : 
            `Signal ${signal.signalID}`,
          signalID: signal.signalID!,
          mainStreet: signal.mainStreetName,
          sideStreet: signal.sideStreetName
        };
      });
  }, [signals, signalsFilterAverage.data, filterKey]);

  // Fetch data when filters or selected metric changes - using stable dependencies
  useEffect(() => {
    const params: MetricsFilterRequest = {
      source: "main",
      measure: selectedMetricKey
    };
    
    // Dispatch actions to fetch data
    dispatch(fetchStraightAverage({ params, filterParams: commonFilterParams }));
    dispatch(fetchAllSignals());
    dispatch(fetchSignalsFilterAverage({ params, filterParams: commonFilterParams }));
    dispatch(fetchMetricsAverage({ 
      params: { ...params, dashboard: false }, 
      filterParams: commonFilterParams 
    }));
    dispatch(fetchMetricsFilter({ params, filterParams: commonFilterParams }));
  }, [selectedMetricKey, filterKey, dispatch]); // Use stable filterKey instead of filtersApplied

  // Handle metric tab change
  const handleMetricChange = useCallback((event: React.SyntheticEvent, newValue: string) => {
    setSelectedMetric(newValue);
    setSelectedLocation(null); // Reset location selection when changing metrics
  }, []);

  // Retry functions for each section
  const retryMetricCard = useCallback(() => {
    const params: MetricsFilterRequest = {
      source: "main",
      measure: selectedMetricKey
    };
    dispatch(fetchStraightAverage({ params, filterParams: commonFilterParams }));
  }, [selectedMetricKey, commonFilterParams, dispatch]);

  const retryMapData = useCallback(() => {
    const params: MetricsFilterRequest = {
      source: "main",
      measure: selectedMetricKey
    };
    dispatch(fetchAllSignals());
    dispatch(fetchSignalsFilterAverage({ params, filterParams: commonFilterParams }));
  }, [selectedMetricKey, commonFilterParams, dispatch]);

  const retryLocationBarChart = useCallback(() => {
    const params: MetricsFilterRequest = {
      source: "main",
      measure: selectedMetricKey
    };
    dispatch(fetchMetricsAverage({ 
      params: { ...params, dashboard: false }, 
      filterParams: commonFilterParams 
    }));
  }, [selectedMetricKey, commonFilterParams, dispatch]);

  const retryTimeSeriesChart = useCallback(() => {
    const params: MetricsFilterRequest = {
      source: "main",
      measure: selectedMetricKey
    };
    dispatch(fetchMetricsFilter({ params, filterParams: commonFilterParams }));
  }, [selectedMetricKey, commonFilterParams, dispatch]);

  // Memoize format metric value function
  const formatMetricValue = useCallback((value: number | string) => {
    if (typeof value === "number") {
      // Format based on the metric type
      if (
        selectedMetric === "arrivalsOnGreen" ||
        selectedMetric === "spillbackRatio" ||
        selectedMetric === "peakPeriodSplitFailures" ||
        selectedMetric === "offPeakSplitFailures"
      ) {
        return `${(value * 100).toFixed(1)}%`
      } else if (
        selectedMetric === "progressionRatio" ||
        selectedMetric === "travelTimeIndex" ||
        selectedMetric === "planningTimeIndex"
      ) {
        return value.toFixed(2)
      } else {
        return Math.round(value).toLocaleString()
      }
    }
    return value
  }, [selectedMetric]);

  // Memoize percentage metric check
  const isPercentMetric = useMemo(() => 
    ["arrivalsOnGreen", "spillbackRatio", "peakPeriodSplitFailures", "offPeakSplitFailures"].includes(selectedMetric),
    [selectedMetric]
  );
  
  // Memoize location bar chart data
  const locationBarData = useMemo(() => ({
    y: locationMetrics.map((item) => item.location),
    x: locationMetrics.map((item) => {
      // For percentage metrics, ensure values are in decimal format for proper display
      return isPercentMetric && item.value > 1 ? item.value / 100 : item.value;
    }),
    type: "bar",
    orientation: "h",
    marker: {
      color: locationMetrics.map(item => locationColors[item.location]),
      opacity: locationMetrics.map(item => 
        selectedLocation ? (item.location === selectedLocation ? 1 : 0.5) : 1
      )
    },
    hovertemplate: isPercentMetric
      ? '<b>%{y}</b><br>Value: %{x:.1%}<extra></extra>'
      : '<b>%{y}</b><br>Value: %{x}<extra></extra>',
  }), [locationMetrics, locationColors, selectedLocation, isPercentMetric]);

  // Handle bar hover in location chart
  const handleLocationHover = useCallback((location: string | null) => {
    setHoveredLocation(location);
  }, []);

  // Memoize time series chart data
  const timeSeriesChartData = useMemo(() => {
    // Group by location
    const locationGroups: { [key: string]: { x: string[]; y: number[] } } = {}
    
    timeSeriesData.forEach((item) => {
      // Always process all data - don't filter by selectedLocation
      if (!locationGroups[item.location]) {
        locationGroups[item.location] = { x: [], y: [] }
      }
      locationGroups[item.location].x.push(item.date)
      
      // For percentage metrics, ensure values are in decimal format for proper display
      const value = isPercentMetric && item.value > 1 ? item.value / 100 : item.value;
      locationGroups[item.location].y.push(value)
    })

    // Convert to Plotly format
    return Object.keys(locationGroups).map((location) => ({
      x: locationGroups[location].x,
      y: locationGroups[location].y,
      type: "scatter",
      mode: "lines",
      name: location,
      line: { 
        width: 2,
        color: locationColors[location]
      },
      hovertemplate: isPercentMetric
        ? '<b>%{text}</b><br>Date: %{x}<br>Value: %{y:.1%}<extra></extra>'
        : '<b>%{text}</b><br>Date: %{x}<br>Value: %{y}<extra></extra>',
      text: Array(locationGroups[location].x.length).fill(location),
    }))
  }, [timeSeriesData, isPercentMetric, locationColors]); // Removed selectedLocation dependency

  // Memoize map plot data
  const mapPlotData = useMemo(() => {
    if (mapData.length === 0) {
      return {
        type: "scattermapbox",
        lat: [33.789], // Default center point for Atlanta
        lon: [-84.388],
        mode: "markers",
        marker: {
          size: 0, // Invisible marker
          opacity: 0
        },
        text: ["No data available"],
        hoverinfo: "none",
      };
    }

    const filteredMapData = mapData.filter(point => point.value !== 0);
    
    return {
      type: "scattermapbox",
      lat: filteredMapData.map((point) => point.lat),
      lon: filteredMapData.map((point) => point.lon),
      mode: "markers",
      marker: {
        size: 6,
        color: filteredMapData.map((point) => {
          // Color based on value using mapSettings
          const settingsKey = metricToSettingsMap[selectedMetric];
          const settings = settingsKey ? mapSettings[settingsKey] : null;
          
          if (settings) {
            const value = point.value;
            
            // Handle unavailable data
            if (value === -1) {
              return settings.legendColors[0]; // First color is for unavailable data
            }
            
            // Find which range the value falls into, starting from index 1 to skip the unavailable range
            for (let i = 1; i < settings.ranges.length; i++) {
              const [min, max] = settings.ranges[i];
              if (value >= min && value <= max) {
                return settings.legendColors[i];
              }
            }
            // Default to last color if outside all ranges
            return settings.legendColors[settings.legendColors.length - 1];
          }
          
          // Fallback to default blue if no settings found
          return "#3b82f6";
        }),
        opacity: 0.8,
      },
      text: filteredMapData.map((point) => {
        // Check if data is unavailable
        if (point.value === -1) {
          return `${point.signalID}<br>${point.name}<br>No data available`;
        }
        return `${point.signalID}<br>${point.name}<br>${selectedMetric}: ${formatMetricValue(point.value)}`;
      }),
      hoverinfo: "text",
    };
  }, [mapData, selectedMetric, formatMetricValue]);

  // Memoize map legend
  const mapLegend = useMemo(() => {
    const settingsKey = metricToSettingsMap[selectedMetric];
    const settings = settingsKey ? mapSettings[settingsKey] : null;

    if (settings) {
      return (
        <>
          {settings.ranges.map((range, index) => (
            <Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }} key={index}>
              <Box sx={{ width: 8, height: 8, bgcolor: settings.legendColors[index], mr: 1, borderRadius: 4 }} />
              <Typography variant="caption">{settings.legendLabels[index]}</Typography>
            </Box>
          ))}
        </>
      );
    } else {
      // Fallback for metrics without map settings
      return (
        <Typography variant="subtitle2" gutterBottom>
          No legend available for this metric
        </Typography>
      );
    }
  }, [selectedMetric]);

  // Memoize chart titles
  const timeSeriesTitle = useMemo(() => {
    return chartTitles[selectedMetric as keyof typeof chartTitles]["bottomChartTitle"]
  }, [selectedMetric]);

  const metricSubtitle = useMemo(() => {
    return chartTitles[selectedMetric as keyof typeof chartTitles]["metricCardTitle"]
  }, [selectedMetric]);

  // Fix the metric data type issue
  const metricData = straightAverage.data;
  const hideMap = selectedMetric === "travelTimeIndex" || selectedMetric === "planningTimeIndex";

  return (
    <Box sx={{ p: 2 }}>
      {/* Metric Tabs */}
      <Tabs
        value={selectedMetric}
        onChange={handleMetricChange}
        variant="fullWidth"
        scrollButtons="auto"
        sx={{
          mb: 2,
          borderBottom: 1,
          borderColor: "divider",
          width: '100%',
          "& .MuiTab-root": {
            textTransform: "none",
            minWidth: "auto",
            px: 2,
            flex: 1,
          },
        }}
      >
        {metrics.map((metric) => (
          <Tab key={metric.id} label={metric.label} value={metric.id} sx={{ flex: 1 }} />
        ))}
      </Tabs>
      {/* Main Content */}
          <Grid container spacing={2}>
            {/* Metric Display */}
            <Grid size={{xs: 12, md: hideMap ? 6 : 4}}>
              <Box sx={{ 
                display: 'flex', 
                flexDirection: hideMap ? 'row' : 'column', 
                gap: 2, 
                height: '100%'
              }}>
                {/* Metric Card */}
                <Paper sx={{ 
                  p: 3, 
                  display: "flex", 
                  flexDirection: "column", 
                  justifyContent: "center", 
                  alignItems: "center",
                  flex: 1,
                  minHeight: "130px"
                }}>
                  {straightAverage.error ? (
                    <ErrorDisplay onRetry={retryMetricCard} height="100px" />
                  ) : straightAverage.loading ? (
                    <CircularProgress size={24} />
                  ) : (
                    <>
                      <Typography variant="h6" component="div" gutterBottom sx={{ fontWeight: '500', fontSize: '24px' }}>
                        {metricData && typeof metricData === 'object' && metricData !== null && 'avg' in metricData && formatMetricValue((metricData as any).avg)}
                      </Typography>
                      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                        {metricSubtitle}
                      </Typography>
                    </>
                  )}
                </Paper>

                {/* Trend Indicator Card */}
                <Paper sx={{ 
                  p: 3, 
                  display: "flex", 
                  flexDirection: "column", 
                  justifyContent: "center", 
                  alignItems: "center",
                  flex: 1,
                  minHeight: "130px"
                }}>
                  {straightAverage.error ? (
                    <ErrorDisplay onRetry={retryMetricCard} height="100px" />
                  ) : straightAverage.loading ? (
                    <CircularProgress size={24} />
                  ) : (
                    <>
                      <Typography variant="h6" component="div" sx={{ fontWeight: '500', fontSize: '24px' }}>
                        {metricData && typeof metricData === 'object' && metricData !== null && 'delta' in metricData && Math.abs((metricData as any).delta * 100).toFixed(1)}%
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Change from prior period
                      </Typography>
                    </>
                  )}
                </Paper>
              </Box>
            </Grid>

            {/* Map */}
            {hideMap ? null : (
            <Grid size={{xs: 12, md: 8}}>
              <Paper sx={{ 
                p: 2, 
                height: "100%", 
                display: "flex", 
                flexDirection: "column"
              }}>
                <Box sx={{ 
                  flexGrow: 1, 
                  width: "100%", 
                  position: "relative", 
                  minHeight: { xs: "350px", md: "284px" } /* 2*130px (cards) + 2*12px (gap) */
                }}>
                  {signalsError || signalsFilterAverage.error ? (
                    <ErrorDisplay onRetry={retryMapData} fullHeight />
                  ) : (signalsFilterAverage.loading || straightAverage.loading) ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                      <CircularProgress />
                    </Box>
                  ) : (
                    <MapBox 
                      data={mapData.length > 0 ? [mapPlotData as any] : []}
                      isRawTraces={true}
                      loading={false}
                      height="100%"
                      zoom={11}
                      renderLegend={() => mapLegend}
                    />
                  )}
                </Box>
              </Paper>
            </Grid>
            )}

            {/* Bottom Charts */}
            <Grid size={{xs: 12}}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom sx={{ textAlign: 'center' }}>
                  {timeSeriesTitle}
                </Typography>
                <Grid container spacing={2}>
                  {/* Location Bar Chart */}
                  <Grid size={{xs: 12, md: 4}}>
                    <Box sx={{ 
                      height: "500px", 
                      display: "flex", 
                      flexDirection: "column"
                    }}>
                      {metricsAverage.error ? (
                        <ErrorDisplay onRetry={retryLocationBarChart} height="500px" />
                      ) : metricsAverage.loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '500px' }}>
                          <CircularProgress />
                        </Box>
                      ) : (
                        <LocationBarChart 
                          data={locationBarData}
                          selectedMetric={selectedMetric}
                          onLocationHover={handleLocationHover}
                          height={500} // Match TimeSeriesChart height for x-axis alignment
                        />
                      )}
                    </Box>
                  </Grid>

                  {/* Time Series Chart */}
                  <Grid size={{xs: 12, md: 8}}>
                    {metricsFilter.error ? (
                      <Box sx={{ height: "500px", display: "flex" }}>
                        <ErrorDisplay onRetry={retryTimeSeriesChart} height="500px" />
                      </Box>
                    ) : metricsFilter.loading ? (
                      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '500px' }}>
                        <CircularProgress />
                      </Box>
                    ) : (
                      <TimeSeriesChart 
                        data={timeSeriesChartData}
                        selectedMetric={selectedMetric}
                        height={500} // Consistent height for x-axis alignment
                        hoveredLocation={hoveredLocation}
                        // showLegend={!selectedLocation}
                      />
                    )}
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
    </Box>
  )
}