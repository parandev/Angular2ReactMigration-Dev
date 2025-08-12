"use client"

import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { fetchAllSignals, fetchStraightAverage, fetchSignalsFilterAverage } from "../../store/slices/metricsSlice";
import { RootState, store } from "../../store/store";
import { selectFilterParams } from "../../store/selectors/filterSelectors";
import Box from "@mui/material/Box"
import Grid from "@mui/material/Grid"
import Paper from "@mui/material/Paper"
import Typography from "@mui/material/Typography"
import Table from "@mui/material/Table"
import TableBody from "@mui/material/TableBody"
import TableCell from "@mui/material/TableCell"
import TableContainer from "@mui/material/TableContainer"
import TableRow from "@mui/material/TableRow"
import FormControl from "@mui/material/FormControl"
import Select from "@mui/material/Select"
import MenuItem from "@mui/material/MenuItem"
import InputLabel from "@mui/material/InputLabel"
import CircularProgress from "@mui/material/CircularProgress"
import MapBox from "../../components/MapBox"
import { MetricsFilterRequest } from "../../types/api.types";
import mapSettings from "../../utils/mapSettings";
import { useAppSelector, useAppDispatch } from '../../hooks/useTypedSelector';
import { consoledebug } from "../../utils/debug";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import ErrorDisplay from '../ErrorDisplay';
import { useTheme } from "../../contexts/ThemeContext";

interface MetricRow {
  label: string
  value: string | number
  unit: string
  measure: string
}

// Map of measure codes to display labels
const metricLabels: Record<string, string> = {
  prd: "Progression Ratio",
  sfd: "Peak Period Split Failures",
  aogd: "Arrivals on Green",
  tp: "Throughput",
  qsd: "Queue Spillback Ratio",
  sfo: "Off Peak Split Failures",
  tti: "Travel Time Index",
  pti: "Planning Time Index",
  vpd: "Traffic Volume",
  vphpp: "PM Peak Volume",
  vphpa: "AM Peak Volume",
  papd: "Pedestrian Activations",
  du: "Vehicle Detector Uptime",
  pau: "Pedestrian Detector Uptime",
  cctv: "CCTV Uptime",
  cu: "Communications Uptime",
};

// Function to get the unit for a metric
const getMetricUnit = (measure: string): string => {
  switch (measure) {
    case "tp":
    case "vphpp":
    case "vphpa":
      return "vph";
    case "vpd":
      return "vpd";
    case "aogd":
    case "qsd":
    case "sfd":
    case "sfo":
      return "%";
    case "du":
    case "pau":
    case "cctv":
    case "cu":
      return "%";
    default:
      return "";
  }
};

// Function to format a metric value based on its type
const formatMetricValue = (value: any, measure: string): string => {
  // If the value is null, undefined, or NaN, return "N/A"
  if (value === null || value === undefined || isNaN(value)) {
    return "N/A";
  }
  
  // Format percentage values
  if (["aogd", "qsd", "sfd", "sfo", "du", "pau", "cctv", "cu"].includes(measure)) {
    return (value * 100).toFixed(1);
  }
  
  // Format volume values (round to nearest whole number and add comma separators)
  if (["tp", "vpd", "vphpp", "vphpa", "papd"].includes(measure)) {
    return Math.round(value).toLocaleString();
  }
  
  // Format index values (ratio with 2 decimals)
  return Number(value).toFixed(2);
};

// Helper function to generate tooltip text for map markers
const generateTooltipText = (
  signal: any, 
  field: string, 
  label: string, 
  formatType: string = "number", 
  formatDecimals: number = 0
): string => {
  const sigText = `<b>Signal: ${signal.signalID}</b> | ${signal.mainStreetName} @ ${signal.sideStreetName}`;
  
  if (signal[field] === undefined || signal[field] === null || signal[field] === -1) {
    return `${sigText}<br><b>${label}</b>: Unavailable`;
  }
  
  let formattedValue;
  if (formatType === "percent") {
    formattedValue = `${(signal[field] * 100).toFixed(formatDecimals)}%`;
  } else {
    formattedValue = Number(signal[field]).toFixed(formatDecimals);
  }
  
  return `${sigText}<br><b>${label}</b>: ${formattedValue}`;
};

// Lists of metrics for each category
const performanceMetricCodes = ["tp", "aogd", "prd", "qsd", "sfd", "sfo", "tti", "pti"];
const volumeMetricCodes = ["vpd", "vphpa", "vphpp", "papd", "du", "pau", "cctv", "cu"];

// Map metric dropdown values to API measure codes and display options
const displayMetricToMeasureMap: Record<string, string> = {
  dailyTrafficVolume: "vpd",
  throughput: "tp",
  arrivalsOnGreen: "aogd",
  progressionRate: "prd",
  spillbackRate: "qsd",
  peakPeriodSplitFailures: "sfd",
  offPeakSplitFailures: "sfo",
};

// Map Dashboard metric IDs to mapSettings keys
const metricToSettingsMap: Record<string, string> = {
  dailyTrafficVolume: "dailyTrafficVolume",
  throughput: "throughput",
  arrivalsOnGreen: "arrivalsOnGreen",
  progressionRate: "progressionRate",
  spillbackRate: "spillbackRate", 
  peakPeriodSplitFailures: "peakPeriodSplitFailures",
  offPeakSplitFailures: "offPeakSplitFailures",
};

export default function Dashboard() {
  useDocumentTitle();
  const { mode } = useTheme();
  const isDark = mode === 'dark';
  const [displayMetric, setDisplayMetric] = useState("dailyTrafficVolume");
  const [perfMetrics, setPerfMetrics] = useState<MetricRow[]>([]);
  const [volMetrics, setVolMetrics] = useState<MetricRow[]>([]);
  const [mapData, setMapData] = useState<any>(null);
  const [mapLoading, setMapLoading] = useState<boolean>(true);
  
  // Loading and error states for each section
  const [perfLoading, setPerfLoading] = useState<boolean>(false);
  const [perfError, setPerfError] = useState<string | null>(null);
  const [volLoading, setVolLoading] = useState<boolean>(false);
  const [volError, setVolError] = useState<string | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  
  // Individual metric loading states
  const [metricLoadingStates, setMetricLoadingStates] = useState<Record<string, boolean>>({});
  
  // Helper functions for individual metric loading states
  const setMetricLoading = (measure: string, loading: boolean) => {
    setMetricLoadingStates(prev => ({ ...prev, [measure]: loading }));
  };
  
  const isMetricLoading = (measure: string) => {
    return metricLoadingStates[measure] || false;
  };
  // const [mapLayout, setMapLayout] = useState<any>({
  //   autosize: true,
  //   hovermode: "closest",
  //   map: {
  //     style: "carto-positron",
  //     center: { lat: 33.789, lon: -84.388 },
  //     zoom: 15,
  //     pitch: 0,
  //     bearing: 0,
  //     dragmode: "zoom",
  //     accesstoken: "pk.eyJ1IjoicGxvdGx5bWFwYm94IiwiYSI6ImNrOWJqb2F4djBnMjEzbG50amg0dnJieG4ifQ.Zme1-Uzoi75IaFbieBDl3A"
  //   },
  //   margin: { r: 0, t: 0, b: 0, l: 0 },
  //   legend: {
  //     x: 1,
  //     xanchor: 'right',
  //     y: 0.9,
  //     bgcolor: 'rgba(255, 255, 255, 0.8)',
  //     bordercolor: 'rgba(0, 0, 0, 0.1)',
  //     borderwidth: 1
  //   },
  //   dragmode: "pan",
  //   updatemenus: [
  //     {
  //       buttons: [
  //         {
  //           args: [{ "map.zoom": 11, "map.center.lat": 33.789, "map.center.lon": -84.388 }],
  //           label: "Reset View",
  //           method: "relayout"
  //         },
  //         {
  //           args: [{ "map.pitch": 0, "map.bearing": 0 }],
  //           label: "2D View",
  //           method: "relayout"
  //         },
  //         {
  //           args: [{ "map.pitch": 45, "map.bearing": 0 }],
  //           label: "3D View",
  //           method: "relayout"
  //         },
  //         {
  //           args: [{ "map.bearing": 45 }],
  //           label: "Rotate Right",
  //           method: "relayout"
  //         },
  //         {
  //           args: [{ "map.bearing": -45 }],
  //           label: "Rotate Left",
  //           method: "relayout"
  //         }
  //       ],
  //       direction: "left",
  //       pad: { r: 10, t: 10 },
  //       showactive: false,
  //       type: "buttons",
  //       x: 0.05,
  //       y: 0.05,
  //       xanchor: "left",
  //       yanchor: "bottom"
  //     }
  //   ]
  // });
  const fetchedMapRef = useRef(false);
  
  // Use Redux state with useAppSelector
  const dispatch = useAppDispatch();
  const { 
    signals, 
    // straightAverage, 
    signalsFilterAverage,
    // loading: reduxLoading
  } = useAppSelector((state: RootState) => state.metrics);
  
  // Use combined loading state
  // const loading = reduxLoading || straightAverage.loading || signalsFilterAverage.loading;
  // const loading = reduxLoading;

  const commonFilterParams = useSelector(selectFilterParams);
  const filtersApplied = useSelector((state: RootState) => state.filter.filtersApplied);

  // Retry functions for each section
  const retryPerfMetrics = async () => {
    setPerfError(null);
    
    try {
      // Set loading state for all performance metrics
      performanceMetricCodes.forEach(measure => setMetricLoading(measure, true));
      
      const perfMetricsData = await Promise.all(
        performanceMetricCodes.map(async (measure) => {
          const params: MetricsFilterRequest = {
            source: "main",
            measure,
          };
          
          try {
            await dispatch(fetchStraightAverage({ params, filterParams: commonFilterParams }));
            const stateAfterDispatch = store.getState();
            const straightAverageData = stateAfterDispatch.metrics.straightAverage.data;
            
            let value: number;
            
            if (straightAverageData !== null) {
              if (typeof straightAverageData === 'number') {
                value = straightAverageData;
              } else if (typeof straightAverageData === 'object' && 'avg' in straightAverageData) {
                value = (straightAverageData as any).avg;
              } else {
                console.error(`Unexpected response structure for ${measure}:`, straightAverageData);
                value = NaN;
              }
            } else {
              console.error(`Invalid response for ${measure}:`, straightAverageData);
              value = NaN;
            }
            
            const result = {
              label: metricLabels[measure],
              value: formatMetricValue(value, measure),
              unit: getMetricUnit(measure),
              measure,
            };
            
            // Update individual metric loading state
            setMetricLoading(measure, false);
            
            return result;
          } catch (error) {
            console.error(`Error fetching ${measure}:`, error);
            setMetricLoading(measure, false);
            return {
              label: metricLabels[measure],
              value: 'N/A',
              unit: getMetricUnit(measure),
              measure,
            };
          }
        })
      );
      
      setPerfMetrics(perfMetricsData);
    } catch (error) {
      setPerfError(error instanceof Error ? error.message : 'Failed to fetch performance metrics');
      console.error("Error fetching performance metrics:", error);
      // Clear loading states for all performance metrics on error
      performanceMetricCodes.forEach(measure => setMetricLoading(measure, false));
    }
  };

  const retryVolMetrics = async () => {
    setVolError(null);
    
    try {
      // Set loading state for all volume metrics
      volumeMetricCodes.forEach(measure => setMetricLoading(measure, true));
      
      const volMetricsData = await Promise.all(
        volumeMetricCodes.map(async (measure) => {
          const params: MetricsFilterRequest = {
            source: "main",
            measure,
          };
          
          try {
            await dispatch(fetchStraightAverage({ params, filterParams: commonFilterParams }));
            const stateAfterDispatch = store.getState();
            const straightAverageData = stateAfterDispatch.metrics.straightAverage.data;
            
            let value: number;
            
            if (straightAverageData !== null) {
              if (typeof straightAverageData === 'number') {
                value = straightAverageData;
              } else if (typeof straightAverageData === 'object' && 'avg' in straightAverageData) {
                value = (straightAverageData as any).avg;
              } else {
                console.error(`Unexpected response structure for ${measure}:`, straightAverageData);
                value = NaN;
              }
            } else {
              console.error(`Invalid response for ${measure}:`, straightAverageData);
              value = NaN;
            }
            
            const result = {
              label: metricLabels[measure],
              value: formatMetricValue(value, measure),
              unit: getMetricUnit(measure),
              measure,
            };
            
            // Update individual metric loading state
            setMetricLoading(measure, false);
            
            return result;
          } catch (error) {
            console.error(`Error fetching ${measure}:`, error);
            setMetricLoading(measure, false);
            return {
              label: metricLabels[measure],
              value: 'N/A',
              unit: getMetricUnit(measure),
              measure,
            };
          }
        })
      );
      
      setVolMetrics(volMetricsData);
    } catch (error) {
      setVolError(error instanceof Error ? error.message : 'Failed to fetch volume metrics');
      console.error("Error fetching volume metrics:", error);
      // Clear loading states for all volume metrics on error
      volumeMetricCodes.forEach(measure => setMetricLoading(measure, false));
    }
  };

  const retryMapData = async () => {
    setMapLoading(true);
    setMapError(null);
    
    try {      
      const measure = displayMetricToMeasureMap[displayMetric];
      const params: MetricsFilterRequest = {
        source: "main",
        measure,
      };
      
      consoledebug(`Retrying map data for ${displayMetric} (${measure})`);
      
      await dispatch(fetchSignalsFilterAverage({ params, filterParams: commonFilterParams }));
    } catch (error) {
      setMapError(error instanceof Error ? error.message : 'Failed to fetch map data');
      console.error("Error retrying map data:", error);
    } finally {
      setMapLoading(false);
    }
  };

  useEffect(() => {
    dispatch(fetchAllSignals());
  }, []);

  useEffect(() => {
    consoledebug("signalsFilterAverage:", signals.length > 0, signalsFilterAverage.data);
    if (signals.length > 0 && signalsFilterAverage.data) {
      // setMetricData(signalsFilterAverage.data);
      
      // Get settings from mapSettings using the mapping
      const settingsKey = metricToSettingsMap[displayMetric];
      const settings = settingsKey ? mapSettings[settingsKey] : null;
      
      if (!settings) {
        console.error(`No settings found for metric: ${displayMetric}`);
        setMapLoading(false);
        return;
      }

      consoledebug("Signals:", signals);
      
      // Join signal data with metric data
      const signalFilterData = signalsFilterAverage.data || [];
      const joinedData = signals
        .map(signal => {
          const metricItem = signalFilterData.find((md: any) => md.label === signal.signalID);
          if (metricItem && metricItem.avg !== 0) {
            return {
              ...signal,
              [settings.field]: metricItem.avg
            };
          }
          return null;
        })
        .filter(Boolean);
      
      // Create different traces for each range
      const mapTraces = [];
      
      // First add the unavailable data trace so it appears at the top of the legend
      const unavailableSignals = joinedData.filter((signal: any) => 
        signal[settings.field] === undefined || signal[settings.field] === null || signal[settings.field] === -1
      );
      
      if (unavailableSignals.length > 0) {
        mapTraces.push({
          type: "scattermap",
          lat: unavailableSignals.map((signal: any) => signal.latitude),
          lon: unavailableSignals.map((signal: any) => signal.longitude),
          mode: "markers",
          marker: {
            color: settings.legendColors[0], // First color is for unavailable
            size: 6,
            opacity: 0.8,
            symbol: "circle"
          },
          text: unavailableSignals.map((signal: any) => 
            generateTooltipText(
              signal, 
              settings.field, 
              settings.label, 
              settings.formatType, 
              settings.formatDecimals
            )
          ),
          name: settings.legendLabels[0], // "Unavailable"
          showlegend: true,
          hoverinfo: "text"
        });
      }
      
      // Then add traces for each range of data
      // Skip the first range which is for unavailable data [-1, -1]
      for (let i = 1; i < settings.ranges.length; i++) {
        const range = settings.ranges[i];
        
        // Filter signals in this range
        const rangeSignals = joinedData.filter((signal: any) => 
          signal[settings.field] >= range[0] && signal[settings.field] <= range[1]
        );
        consoledebug("Range signals:", joinedData);
        
        if (rangeSignals.length > 0) {
          // Create a single trace for this range of signals
          mapTraces.push({
            type: "scattermap",
            lat: rangeSignals.map((signal: any) => signal.latitude),
            lon: rangeSignals.map((signal: any) => signal.longitude),
            mode: "markers",
            marker: {
              color: settings.legendColors[i], // Use i to match the range index
              size: 6,
              opacity: 0.8,
              symbol: "circle"
            },
            text: rangeSignals.map((signal: any) => 
              generateTooltipText(
                signal, 
                settings.field, 
                settings.label, 
                settings.formatType, 
                settings.formatDecimals
              )
            ),
            name: settings.legendLabels[i], // Use i to match the range index
            showlegend: true,
            hoverinfo: "text"
          });
        }
      }

      setMapData(mapTraces);
      // setMapLayout(mapLayout);
    }
  }, [signals, signalsFilterAverage]);

  // Handle metric selection change
  const handleDisplayMetricChange = (newMetric: string) => {
    // fetchedMapRef.current = false;
    setDisplayMetric(newMetric);
  };

  // Fetch data when component mounts or when filters are applied
  useEffect(() => {    
    const fetchData = async () => {
      // Initialize both sections
      setPerfLoading(false);
      setPerfError(null);
      setVolLoading(false);
      setVolError(null);
      
      // Initialize all metrics with loading state
      const initialPerfMetrics = performanceMetricCodes.map(measure => ({
        label: metricLabels[measure],
        value: '',
        unit: getMetricUnit(measure),
        measure,
      }));
      setPerfMetrics(initialPerfMetrics);
      
      const initialVolMetrics = volumeMetricCodes.map(measure => ({
        label: metricLabels[measure],
        value: '',
        unit: getMetricUnit(measure),
        measure,
      }));
      setVolMetrics(initialVolMetrics);
      
      // Set loading state for all metrics
      performanceMetricCodes.forEach(measure => setMetricLoading(measure, true));
      volumeMetricCodes.forEach(measure => setMetricLoading(measure, true));
      
      // Fetch performance and volume metrics in parallel
      const fetchPerfMetrics = async () => {
        try {
          const perfMetricsData = await Promise.all(
            performanceMetricCodes.map(async (measure) => {
              const params: MetricsFilterRequest = {
                source: "main",
                measure,
              };
              
              try {
                // Dispatch the action to fetch straight average
                await dispatch(fetchStraightAverage({ params, filterParams: commonFilterParams }));
                
                // Get the most current state AFTER the dispatch completes
                const stateAfterDispatch = store.getState();
                const straightAverageData = stateAfterDispatch.metrics.straightAverage.data;
                
                let value: number;
                
                // Check the response structure
                if (straightAverageData !== null) {
                  if (typeof straightAverageData === 'number') {
                    value = straightAverageData;
                  } else if (typeof straightAverageData === 'object' && 'avg' in straightAverageData) {
                    value = (straightAverageData as any).avg;
                  } else {
                    console.error(`Unexpected response structure for ${measure}:`, straightAverageData);
                    value = NaN;
                  }
                } else {
                  console.error(`Invalid response for ${measure}:`, straightAverageData);
                  value = NaN;
                }
                
                const result = {
                  label: metricLabels[measure],
                  value: formatMetricValue(value, measure),
                  unit: getMetricUnit(measure),
                  measure,
                };
                
                // Update individual metric loading state
                setMetricLoading(measure, false);
                
                return result;
              } catch (error) {
                console.error(`Error fetching ${measure}:`, error);
                setMetricLoading(measure, false);
                return {
                  label: metricLabels[measure],
                  value: 'N/A',
                  unit: getMetricUnit(measure),
                  measure,
                };
              }
            })
          );
          
          setPerfMetrics(perfMetricsData);
        } catch (error) {
          setPerfError(error instanceof Error ? error.message : 'Failed to fetch performance metrics');
          console.error("Error fetching performance metrics:", error);
          // Clear loading states for all performance metrics on error
          performanceMetricCodes.forEach(measure => setMetricLoading(measure, false));
        }
      };
      
      const fetchVolMetrics = async () => {
        try {
          const volMetricsData = await Promise.all(
            volumeMetricCodes.map(async (measure) => {
              const params: MetricsFilterRequest = {
                source: "main",
                measure,
              };
              
              try {
                await dispatch(fetchStraightAverage({ params, filterParams: commonFilterParams }));
                
                // Get the most current state AFTER the dispatch completes
                const stateAfterDispatch = store.getState();
                const straightAverageData = stateAfterDispatch.metrics.straightAverage.data;
                
                let value: number;
                
                if (straightAverageData !== null) {
                  if (typeof straightAverageData === 'number') {
                    value = straightAverageData;
                  } else if (typeof straightAverageData === 'object' && 'avg' in straightAverageData) {
                    value = (straightAverageData as any).avg;
                  } else {
                    console.error(`Unexpected response structure for ${measure}:`, straightAverageData);
                    value = NaN;
                  }
                } else {
                  console.error(`Invalid response for ${measure}:`, straightAverageData);
                  value = NaN;
                }
                
                const result = {
                  label: metricLabels[measure],
                  value: formatMetricValue(value, measure),
                  unit: getMetricUnit(measure),
                  measure,
                };
                
                // Update individual metric loading state
                setMetricLoading(measure, false);
                
                return result;
              } catch (error) {
                console.error(`Error fetching ${measure}:`, error);
                setMetricLoading(measure, false);
                return {
                  label: metricLabels[measure],
                  value: 'N/A',
                  unit: getMetricUnit(measure),
                  measure,
                };
              }
            })
          );
          
          setVolMetrics(volMetricsData);
        } catch (error) {
          setVolError(error instanceof Error ? error.message : 'Failed to fetch volume metrics');
          console.error("Error fetching volume metrics:", error);
          // Clear loading states for all volume metrics on error
          volumeMetricCodes.forEach(measure => setMetricLoading(measure, false));
        }
      };
      
      // Execute both fetch functions in parallel
      await Promise.all([fetchPerfMetrics(), fetchVolMetrics()]);
    };
    
    fetchData();
  }, [filtersApplied]);

  // Add a separate effect to fetch map data when signals become available
  useEffect(() => {
    consoledebug("values changed:", displayMetric, fetchedMapRef.current);

    // Fetch map data for selected metric
    const fetchMapData = async () => {
      setMapLoading(true);
      setMapError(null);
      
      try {      
        const measure = displayMetricToMeasureMap[displayMetric];
        const params: MetricsFilterRequest = {
          source: "main",
          measure,
        };
        
        consoledebug(`Fetching map data for ${displayMetric} (${measure})`);
        
        // Dispatch the action to fetch signal metrics
        await dispatch(fetchSignalsFilterAverage({ params, filterParams: commonFilterParams }));
      } catch (error) {
        setMapError(error instanceof Error ? error.message : 'Failed to fetch map data');
        console.error("Error fetching map data:", error);
      } finally {
        setMapLoading(false);
      }
    };

    fetchMapData();
      // fetchedMapRef.current = true;
  }, [displayMetric, filtersApplied]);

  // Return JSX
  return (
    <Box sx={{ 
      height: '93%', // Adjust based on your header height
      display: 'flex',
      flexDirection: 'column',
      p: 2 
    }}>
      <Box sx={{ display: 'flex', gap: 2, flex: 1, minHeight: 0 }}>
        {/* Main Content - Responsive Layout */}
        <Box sx={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column',
          minHeight: 0
        }}>
          <Grid container spacing={2} sx={{ flex: 1 }}>
            {/* Performance Metrics */}
            <Grid size={{xs: 12, md: 6, lg: 12}}>
              <Paper sx={{ 
                p: 2, 
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <Typography variant="h6" gutterBottom fontWeight={'bold'}>
                  Performance
                </Typography>
                {perfError ? (
                  <Box sx={{ 
                    flex: 1, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    minHeight: 200
                  }}>
                    <ErrorDisplay onRetry={retryPerfMetrics} />
                  </Box>
                ) : perfLoading ? (
                  <Box sx={{ 
                    flex: 1, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    minHeight: 200
                  }}>
                    <CircularProgress size={24} />
                  </Box>
                ) : (
                  <TableContainer sx={{ flex: 1 }}>
                      <Table size="small" sx={{ height: '100%' }}>
                        <TableBody>
                          {perfMetrics.map((row) => (
                            <TableRow key={row.label}>
                              <TableCell>{row.label}</TableCell>
                              <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                                {isMetricLoading(row.measure) ? (
                                  <CircularProgress size={16} />
                                ) : (
                                  row.value
                                )}
                              </TableCell>
                              <TableCell align="right" sx={{ width: 50, fontWeight: 'bold' }}>
                                {row.unit}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                  </TableContainer>
                )}
              </Paper>
            </Grid>

            {/* Volume & Equipment */}
            <Grid size={{xs: 12, md: 6, lg: 12}}>
              <Paper sx={{ 
                p: 2, 
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <Typography variant="h6" gutterBottom fontWeight={'bold'}>
                  Volume & Equipment
                </Typography>
                {volError ? (
                  <Box sx={{ 
                    flex: 1, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    minHeight: 200
                  }}>
                    <ErrorDisplay onRetry={retryVolMetrics} />
                  </Box>
                ) : volLoading ? (
                  <Box sx={{ 
                    flex: 1, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    minHeight: 200
                  }}>
                    <CircularProgress size={24} />
                  </Box>
                ) : (
                  <TableContainer sx={{ flex: 1 }}>
                      <Table size="small" sx={{ height: '100%' }}>
                        <TableBody>
                          {volMetrics.map((row) => (
                            <TableRow key={row.label}>
                              <TableCell>{row.label}</TableCell>
                              <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                                {isMetricLoading(row.measure) ? (
                                  <CircularProgress size={16} />
                                ) : (
                                  row.value
                                )}
                              </TableCell>
                              <TableCell align="right" sx={{ width: 50, fontWeight: 'bold' }}>
                                {row.unit}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                  </TableContainer>
                )}
              </Paper>
            </Grid>
          </Grid>
          {/* <Paper sx={{ p: 2 }}>
            <TableContainer>
              <Table size="small">
                <TableBody>
                    <TableRow>
                      <TableCell>TEAMS Tasks</TableCell>
                      <TableCell align="right">Total Outstanding: 0</TableCell>
                    </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Paper >*/}
        </Box>

        {/* Map Area */}
        <Box sx={{ flex: 2, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <Paper sx={{ 
            p: 2, 
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0
          }}>
            <Box sx={{ 
              flex: 1, 
              width: "100%", 
              position: "relative", 
              minHeight: 0
            }}>
              {mapError ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                  <ErrorDisplay onRetry={retryMapData} fullHeight />
                </Box>
              ) : mapLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                  <CircularProgress />
                </Box>
              ) : (
                <>
                  <Box sx={{ 
                    position: 'absolute', 
                    top: 10, 
                    left: 10, 
                    zIndex: 1000, 
                    backgroundColor: isDark ? 'rgba(30, 30, 30, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                    borderRadius: 1,
                    p: 1
                  }}>
                    <FormControl size="small" sx={{ minWidth: 200 }}>
                      <InputLabel id="display-metric-label">Performance Metric</InputLabel>
                      <Select
                        labelId="display-metric-label"
                        label="Performance Metric"
                        value={displayMetric}
                        onChange={(e) => handleDisplayMetricChange(e.target.value as string)}
                      >
                        <MenuItem value="dailyTrafficVolume">Daily Traffic Volume</MenuItem>
                        <MenuItem value="throughput">Throughput</MenuItem>
                        <MenuItem value="arrivalsOnGreen">Arrivals on Green</MenuItem>
                        <MenuItem value="progressionRate">Progression Rate</MenuItem>
                        <MenuItem value="spillbackRate">Spillback Rate</MenuItem>
                        <MenuItem value="peakPeriodSplitFailures">Peak Period Split Failures</MenuItem>
                        <MenuItem value="offPeakSplitFailures">Off-Peak Split Failures</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                  <MapBox
                    data={mapData}
                    isRawTraces={true}
                    loading={false}
                    height="100%"
                    showLegend={true}
                    showControls={true}
                  />
                </>
              )}
            </Box>
          </Paper>
        </Box>
      </Box>
    </Box>
  )
}