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
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward"
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward"
import RemoveIcon from "@mui/icons-material/Remove"
import MapBox from "../../components/MapBox"
import LocationBarChart from "../../components/charts/LocationBarChart"
import TimeSeriesChart from "../../components/charts/TimeSeriesChart"
import ErrorDisplay from "../ErrorDisplay"
import { metricApiKeys, chartTitles } from "../../constants/mapData"
import mapSettings from "../../utils/mapSettings"
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
import useDocumentTitle from "../../hooks/useDocumentTitle"

// Define the available metrics
const metrics = [
  { id: "detectorUptime", label: "Detector Uptime", key: metricApiKeys.detectorUptime },
  { id: "pedestrianPushbuttonActivity", label: "Daily Pedestrian Pushbutton Activity", key: metricApiKeys.pedestrianPushbuttonActivity },
  { id: "pedestrianPushbuttonUptime", label: "Pedestrian Pushbutton Uptime", key: metricApiKeys.pedestrianPushbuttonUptime },
  { id: "cctvUptime", label: "CCTV Uptime", key: metricApiKeys.cctvUptime },
  { id: "communicationUptime", label: "Communication Uptime", key: metricApiKeys.communicationUptime },
]


interface LocationMetric {
  label: string;
  avg: number;
  delta: number;
  zoneGroup: string | null;
  weight: number;
}

interface TimeSeriesData {
  corridor: string;
  zone_Group: string | null;
  month: string;
  uptime: string;
  delta: string;
  [key: string]: string | number | null;
}

interface MapPoint {
  signalID: string;
  lat: number;
  lon: number;
  name: string;
  value: number;
}

// Map metric IDs to mapSettings keys
const metricToSettingsMap: Record<string, string> = {
  detectorUptime: "detectorUptime",
  pedestrianPushbuttonActivity: "pedestrianPushbuttonActivity",
  pedestrianPushbuttonUptime: "pedestrianPushbuttonUptime",
  cctvUptime: "cctvUptime",
  communicationUptime: "communicationUptime",
};

export default function Maintenance() {
  // State for selected metric
  const [selectedMetric, setSelectedMetric] = useState("detectorUptime");
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [hoveredLocation, setHoveredLocation] = useState<string | null>(null);

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
    currentMetric?.key || "du", 
    [currentMetric]
  );

  useDocumentTitle({
    route: 'Maintenance',
    tab: currentMetric?.label
  });
  
  const metricData = straightAverage.data;

  // Memoize processed location metrics
  const locationMetrics = useMemo((): LocationMetric[] => {
    if (!metricsAverage.data || !Array.isArray(metricsAverage.data)) {
      return [];
    }
    
    return metricsAverage.data
      .map((item: { label: string; avg: number }) => ({
        label: item.label,
        avg: item.avg || 0,
        delta: 0,
        zoneGroup: null,
        weight: 1
      }))
      .sort((a: LocationMetric, b: LocationMetric) => a.avg - b.avg);
  }, [metricsAverage.data, filterKey]);

  // Memoize processed time series data
  const timeSeriesData = useMemo((): TimeSeriesData[] => {
    if (!metricsFilter.data || !Array.isArray(metricsFilter.data)) {
      return [];
    }
    
    return metricsFilter.data as TimeSeriesData[];
  }, [metricsFilter.data, filterKey]);

  // Memoize processed map data
  const mapData = useMemo((): MapPoint[] => {
    if (!signals.length || !signalsFilterAverage.data || !Array.isArray(signalsFilterAverage.data)) {
      return [];
    }
    
    // Create a map of signal IDs to metric values
    const metricsMap: { [key: string]: number } = {};
    signalsFilterAverage.data.forEach((item: { label: string; avg: number }) => {
      if (item.avg !== 0) { // Only include non-zero values
        metricsMap[item.label] = item.avg;
      }
    });
    
    // Prepare map data
    return signals
      .filter((signal) => signal.latitude && signal.longitude)
      .map((signal) => ({
        signalID: signal.signalID || '',
        lat: signal.latitude,
        lon: signal.longitude,
        name: `${signal.mainStreetName || ''} ${signal.sideStreetName ? '@ ' + signal.sideStreetName : ''}`,
        value: metricsMap[signal.signalID || ''] || 0
      }))
      .filter(point => point.value !== 0); // Filter out points with value 0
  }, [signals, signalsFilterAverage.data, filterKey]);

  // Fetch data when filters or selected metric changes
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
  }, [selectedMetricKey, filterKey, dispatch]);

  // Handle metric tab change
  const handleMetricChange = useCallback((event: React.SyntheticEvent, newValue: string) => {
    setSelectedMetric(newValue);
    setSelectedLocation(null); // Reset location selection when changing metrics
  }, []);

  // Handle location hover
  const handleLocationHover = useCallback((location: string | null) => {
    setHoveredLocation(location);
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

  // Memoize colors based on sorted order to prevent consecutive same colors
  const locationColors = useMemo(() => {
    const colors = [
      '#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd',
      '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf'
    ];
    const getLocationColor = (index: number) => colors[index % colors.length];
    
    // Create color mapping based on sorted order (by value) to avoid consecutive same colors
    const sortedLocationColors: Record<string, string> = {};
    locationMetrics.forEach((item, index) => {
      sortedLocationColors[item.label] = getLocationColor(index);
    });

    // Get all unique locations from both data sources for time series
    const allUniqueLocations = Array.from(new Set([
      ...locationMetrics.map(item => item.label),
      ...timeSeriesData.map(item => item.corridor)
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
  }, [locationMetrics, timeSeriesData]);

  // Memoize format metric value function
  const formatMetricValue = useCallback((value: number | string | null) => {
    if (typeof value === "number") {
      // Format based on the metric type
      if (selectedMetric === "detectorUptime" || 
          selectedMetric === "pedestrianPushbuttonUptime" || 
          selectedMetric === "cctvUptime" || 
          selectedMetric === "communicationUptime") {
        return `${(value * 100).toFixed(1)}%`
      } else if (selectedMetric === "pedestrianPushbuttonActivity") {
        return Math.round(value).toLocaleString()
      } else {
        return Math.round(value).toLocaleString()
      }
    }
    return value || "N/A"
  }, [selectedMetric]);

  // Memoize percentage metric check
  const isPercentMetric = useMemo(() => 
    ["detectorUptime", "pedestrianPushbuttonUptime", "cctvUptime", "communicationUptime"].includes(selectedMetric),
    [selectedMetric]
  );
  
  // Memoize location bar chart data
  const locationBarData = useMemo(() => ({
    y: locationMetrics.map((item) => item.label),
    x: locationMetrics.map((item) => {
      // For percentage metrics, ensure values are in decimal format for proper display
      return isPercentMetric && item.avg > 1 ? item.avg / 100 : item.avg;
    }),
    type: "bar",
    orientation: "h",
    marker: {
      color: locationMetrics.map(item => locationColors[item.label]),
      opacity: locationMetrics.map(item => 
        selectedLocation ? (item.label === selectedLocation ? 1 : 0.5) : 1
      )
    },
    hovertemplate: isPercentMetric
      ? '<b>%{y}</b><br>Value: %{x:.1%}<extra></extra>'
      : '<b>%{y}</b><br>Value: %{x}<extra></extra>',
  }), [locationMetrics, locationColors, selectedLocation, isPercentMetric]);

  // Memoize time series chart data
  const timeSeriesChartData = useMemo(() => {
    // Group by location
    const locationGroups: { [key: string]: { x: string[]; y: number[] } } = {}
    
    timeSeriesData.forEach((item) => {
      // Always process all data - don't filter by selectedLocation
      if (!locationGroups[item.corridor]) {
        locationGroups[item.corridor] = { x: [], y: [] }
      }
      
      // Parse date from the month field and format it
      const dateObj = new Date(item.month);
      const formattedDate = `${dateObj.toLocaleString('default', { month: 'short' })} ${dateObj.getFullYear()}`;
      locationGroups[item.corridor].x.push(formattedDate);
      
      // Extract value using the appropriate key for this metric
      let rawValue: number;
      
      if (item[selectedMetricKey] !== undefined && item[selectedMetricKey] !== null) {
        rawValue = parseFloat(String(item[selectedMetricKey]));
      } else if (item.uptime !== undefined) {
        rawValue = parseFloat(item.uptime);
      } else {
        rawValue = 0;
      }
      
      // For percentage metrics, ensure values are in decimal format for proper display
      const value = isPercentMetric && rawValue > 1 ? rawValue / 100 : rawValue;
      locationGroups[item.corridor].y.push(value);
    });

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
  }, [timeSeriesData, selectedMetricKey, isPercentMetric, locationColors]); // Removed selectedLocation dependency

  // Prepare map data
  const mapPlotData = mapData.length === 0 ? 
  {
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
  } : 
  {
    type: "scattermapbox",
    lat: mapData.map((point) => point.lat),
    lon: mapData.map((point) => point.lon),
    mode: "markers",
    marker: {
      size: mapData.map((point) => {
        // Scale marker size based on value
        const min = 5
        const max = 15
        const value = point.value

        // Make sure we don't scale unavailable data points
        if (value === -1) {
          return min;
        }

        if (selectedMetric === "pedestrianPushbuttonActivity") {
          // Scale for pushbutton activity (10-1000)
          return min + Math.min(((value - 10) / 990) * (max - min), max)
        } else if (isPercentMetric) {
          // Scale for percentage (0-100)
          return min + Math.min((value / 100) * (max - min), max)
        } else {
          return 8 // Default size
        }
      }),
      color: mapData.map((point) => {
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
        
        // Fallback to default colors if no settings found
        if (isPercentMetric) {
          // High values are good for uptime metrics
          if (point.value < 50) return "#fee2e2"
          if (point.value < 70) return "#fecaca"
          if (point.value < 85) return "#fca5a5"
          if (point.value < 95) return "#f87171"
          return "#ef4444"
        } else if (selectedMetric === "pedestrianPushbuttonActivity") {
          if (point.value < 100) return "#93c5fd"
          if (point.value < 250) return "#60a5fa"
          if (point.value < 500) return "#3b82f6"
          if (point.value < 750) return "#2563eb"
          return "#1d4ed8"
        } else {
          return "#3b82f6"
        }
      }),
      opacity: 0.8,
    },
    text: mapData.map((point) => {
      const metric = metrics.find(m => m.id === selectedMetric);
      const metricName = metric ? metric.label : selectedMetric;
      // Handle unavailable data
      if (point.value === -1) {
        return `${point.signalID}<br>${point.name}<br>No data available`;
      }
      const valueText = point.value ? formatMetricValue(point.value) : "Unavailable";
      return `${point.signalID}<br>${point.name}<br>${metricName}: ${valueText}`;
    }),
    hoverinfo: "text",
  };

  // Get the appropriate legend for the map based on the selected metric
  const getMapLegend = () => {
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
      // Fallback to original legends if settings not found
      if (selectedMetric === "pedestrianPushbuttonActivity") {
        return (
          <>
            <Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
              <Box sx={{ width: 8, height: 8, bgcolor: "#93c5fd", mr: 1, borderRadius: 4 }} />
              <Typography variant="caption">0 - 100</Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
              <Box sx={{ width: 8, height: 8, bgcolor: "#60a5fa", mr: 1, borderRadius: 4 }} />
              <Typography variant="caption">101 - 250</Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
              <Box sx={{ width: 8, height: 8, bgcolor: "#3b82f6", mr: 1, borderRadius: 4 }} />
              <Typography variant="caption">251 - 500</Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
              <Box sx={{ width: 8, height: 8, bgcolor: "#2563eb", mr: 1, borderRadius: 4 }} />
              <Typography variant="caption">501 - 750</Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Box sx={{ width: 8, height: 8, bgcolor: "#1d4ed8", mr: 1, borderRadius: 4 }} />
              <Typography variant="caption">750+</Typography>
            </Box>
          </>
        )
      } else if (isPercentMetric) {
        return (
          <>
            <Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
              <Box sx={{ width: 8, height: 8, bgcolor: "#fee2e2", mr: 1, borderRadius: 4 }} />
              <Typography variant="caption">0% - 50%</Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
              <Box sx={{ width: 8, height: 8, bgcolor: "#fecaca", mr: 1, borderRadius: 4 }} />
              <Typography variant="caption">51% - 70%</Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
              <Box sx={{ width: 8, height: 8, bgcolor: "#fca5a5", mr: 1, borderRadius: 4 }} />
              <Typography variant="caption">71% - 85%</Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
              <Box sx={{ width: 8, height: 8, bgcolor: "#f87171", mr: 1, borderRadius: 4 }} />
              <Typography variant="caption">86% - 95%</Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Box sx={{ width: 8, height: 8, bgcolor: "#ef4444", mr: 1, borderRadius: 4 }} />
              <Typography variant="caption">96% - 100%</Typography>
            </Box>
          </>
        )
      } else {
        return (
          <Typography variant="subtitle2" gutterBottom>
            No legend available
          </Typography>
        )
      }
    }
  }

  // Memoize chart titles
  const timeSeriesTitle = useMemo(() => {
    return chartTitles[selectedMetric as keyof typeof chartTitles]["bottomChartTitle"]
  }, [selectedMetric]);

  const metricSubtitle = useMemo(() => {
    return chartTitles[selectedMetric as keyof typeof chartTitles]["metricCardTitle"]
  }, [selectedMetric]);

  const hideMap = selectedMetric === "cctvUptime";

  return (
    <Box sx={{ p: 2 }}>
      {/* Metric Tabs */}
      <Tabs
        value={selectedMetric}
        onChange={handleMetricChange}
        variant="fullWidth"
        sx={{
          mb: 2,
          borderBottom: 1,
          borderColor: "divider",
          "& .MuiTab-root": {
            textTransform: "none",
            minWidth: "auto",
            px: 2,
          },
        }}
      >
        {metrics.map((metric) => (
          <Tab key={metric.id} label={metric.label} value={metric.id} />
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
                    metricData && typeof metricData === 'object' && metricData !== null && 'delta' in metricData && (
                      <>
                        <Typography
                          variant="h5"
                          component="div"
                          sx={{
                            color:
                              (metricData as any).delta > 0
                                ? "success.main"
                                : (metricData as any).delta < 0
                                  ? "error.main"
                                  : "text.secondary",
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          {(metricData as any).delta < 0 && "-"}
                          {Math.abs((metricData as any).delta * 100).toFixed(1)}%
                          {(metricData as any).delta > 0 ? (
                            <ArrowUpwardIcon fontSize="small" sx={{ ml: 0.5 }} />
                          ) : (metricData as any).delta < 0 ? (
                            <ArrowDownwardIcon fontSize="small" sx={{ ml: 0.5 }} />
                          ) : (
                            <RemoveIcon fontSize="small" sx={{ ml: 0.5 }} />
                          )}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          Change from prior period
                        </Typography>
                      </>
                    )
                  )}
                </Paper>
              </Box>
            </Grid>

            {/* Map */}
            {hideMap ? null : <Grid size={{xs: 12, md: 8}}>
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
                      center={{ lat: 33.789, lon: -84.388 }}
                      zoom={11}
                      renderLegend={getMapLegend}
                    />
                  )}
                </Box>
              </Paper>
            </Grid>}

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
                      flexDirection: "column",
                      overflow: "hidden"
                    }}>
                      {metricsAverage.error ? (
                        <ErrorDisplay onRetry={retryLocationBarChart} height="500px" />
                      ) : metricsAverage.loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '500px' }}>
                          <CircularProgress />
                        </Box>
                      ) : (
                        <LocationBarChart
                          data={locationBarData as any}
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
                        height={500}
                        hoveredLocation={hoveredLocation}
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