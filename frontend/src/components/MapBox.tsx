import { FC, useState, useEffect, useRef } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import CircularProgress from "@mui/material/CircularProgress";
import Plot from "react-plotly.js";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllSignals } from "../store/slices/metricsSlice";
import { AppDispatch } from "../store/store";
import { format } from "date-fns";
import { useTheme } from "../contexts/ThemeContext";
import { mergeWithPlotlyTheme } from "../utils/plotlyTheme";

export interface MapPoint {
  lat: number;
  lon: number;
  value: number;
  name?: string;
  signalID?: string;
  mainStreet?: string;
  sideStreet?: string;
  [key: string]: any;
}

export interface MapTrace {
  type: "scattermap" | "scattermap";
  lat: number[];
  lon: number[];
  mode: string;
  marker: {
    size: number | number[];
    color?: string | string[];
    opacity?: number;
    symbol?: string;
  };
  text?: string[];
  name?: string;
  showlegend?: boolean;
  hoverinfo?: string;
  hovertemplate?: string;
  [key: string]: any;
}

export interface MapBoxProps {
  mapSettings?: {
    metrics: {
      field: string;
      label: string;
      formatType?: string;
      formatDecimals?: number;
      source?: string;
      start?: string;
      end?: string;
    };
    ranges?: number[][];
    legendColors?: string[];
    legendLabels?: string[];
  };
  data?: MapPoint[] | MapTrace[];
  isRawTraces?: boolean;
  loading?: boolean;
  center?: { lat: number; lon: number };
  zoom?: number;
  height?: string | number;
  width?: string | number;
  mapStyle?: string;
  showLegend?: boolean;
  showControls?: boolean;
  emptyMessage?: string;
  renderLegend?: () => React.ReactNode;
  mapOptions?: any;
  filter?: any;
}

const defaultCenter = { lat: 33.789, lon: -84.388 }; // Atlanta
const defaultZoom = 11;

// Default layout properties for consistent width handling
const defaultLayoutProps = {
  dragmode: "zoom" as const,
  margin: { r: 0, t: 0, b: 0, l: 0 },
  autosize: true,
  xaxis: {
    zeroline: false,
  },
  yaxis: {
    zeroline: false,
  }
};

// Helper function to safely resize Plotly charts
const safeResizePlotly = (element: any) => {
  if (element && window.Plotly && element.nodeType === Node.ELEMENT_NODE) {
    window.Plotly.Plots.resize(element);
  }
};

const MapBox: FC<MapBoxProps> = ({
  mapSettings = {
    metrics: {
      field: "",
      label: "",
      formatType: "number",
      formatDecimals: 0,
      source: "main",
      start: format(new Date(), "yyyy-MM-dd"),
      end: format(new Date(), "yyyy-MM-dd")
    },
    ranges: [[0, 25], [26, 50], [51, 75], [76, 100]],
    legendColors: ["#ff0000", "#ffa500", "#ffff00", "#008000"],
    legendLabels: ["0-25%", "26-50%", "51-75%", "76-100%"]
  },
  data = [],
  isRawTraces = false,
  loading = false,
  center = defaultCenter,
  zoom = defaultZoom,
  height = "100%",
  width = "100%",
  mapStyle = "carto-positron",
  showLegend = true,
  showControls = true,
  emptyMessage = "No map data available for this selection",
  renderLegend,
  mapOptions = {},
  // filter = {}
}) => {
  const { mode } = useTheme();
  const isDark = mode === 'dark';
  
  // Use theme-appropriate map style
  const themeMapStyle = isDark ? "carto-darkmatter" : mapStyle;

  const containerRef = useRef<HTMLDivElement>(null);
  const plotRef = useRef<any>(null);
  const dispatch: AppDispatch = useDispatch();
  const signals = useSelector((state: any) => state.metrics.signals);
  const [mapData, setMapData] = useState<MapTrace[]>([]);
  
  // Initialize map layout with theme - using same structure as old version
  const [mapLayout, setMapLayout] = useState<any>(() => {
    const initialThemeConfig = mergeWithPlotlyTheme({}, {}, isDark);
    return {
      // Apply theme-specific properties
      plot_bgcolor: initialThemeConfig.layout.plot_bgcolor,
      paper_bgcolor: initialThemeConfig.layout.paper_bgcolor,
      font: initialThemeConfig.layout.font,
      colorway: initialThemeConfig.layout.colorway,
      legend: initialThemeConfig.layout.legend,
      hoverlabel: initialThemeConfig.layout.hoverlabel,
      // Apply critical layout properties for width handling
      dragmode: defaultLayoutProps.dragmode,
      margin: defaultLayoutProps.margin,
      autosize: defaultLayoutProps.autosize,
      // Handle axis properties with theme colors but preserve structure
      xaxis: {
        ...defaultLayoutProps.xaxis,
        ...initialThemeConfig.layout.xaxis,
        zeroline: false,
      },
      yaxis: {
        ...defaultLayoutProps.yaxis,
        ...initialThemeConfig.layout.yaxis,
        zeroline: false,
      },
      map: {
        style: themeMapStyle,
        center: center,
        zoom: zoom
      }
    };
  });

  // Separate useEffect for calculating center and zoom to avoid infinite loops
  const [autoCenter, setAutoCenter] = useState<{lat: number, lon: number} | null>(null);
  const [autoZoom, setAutoZoom] = useState<number | null>(null);

  // Add legend if needed
  useEffect(() => {
    if (showLegend) {
      setMapLayout((prev: any) => ({
        ...prev,
        legend: {
          x: 1,
          xanchor: 'right',
          y: 0.9,
          bgcolor: isDark ? 'rgba(30, 30, 30, 1)' : 'rgba(255, 255, 255, 1)',
          bordercolor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
          borderwidth: 1
        }
      }));
    } else {
      setMapLayout((prev: any) => ({
        ...prev,
        legend: undefined
      }));
    }

    // Add controls if needed
    if (showControls) {
      setMapLayout((prev: any) => ({
        ...prev,
        updatemenus: [
          {
            buttons: [
              {
                args: [{ "map.zoom": zoom, "map.center.lat": center.lat, "map.center.lon": center.lon }],
                label: "Reset View",
                method: "relayout"
              },
              {
                args: [{ "map.pitch": 0, "map.bearing": 0 }],
                label: "2D View",
                method: "relayout"
              },
              {
                args: [{ "map.pitch": 45, "map.bearing": 0 }],
                label: "3D View",
                method: "relayout"
              }
            ],
            direction: "left",
            pad: { r: 10, t: 10 },
            showactive: false,
            type: "buttons",
            x: 0.05,
            y: 0.05,
            xanchor: "left",
            yanchor: "bottom"
          }
        ]
      }));
    } else {
      setMapLayout((prev: any) => ({
        ...prev,
        updatemenus: undefined
      }));
    }
  }, [showLegend, showControls, center, zoom, isDark]);

  // Update map style when theme changes
  useEffect(() => {
    const currentThemeConfig = mergeWithPlotlyTheme({}, {}, isDark);
    setMapLayout((prev: any) => ({
      ...prev,
      // Apply only theme-specific properties, not layout structure
      plot_bgcolor: currentThemeConfig.layout.plot_bgcolor,
      paper_bgcolor: currentThemeConfig.layout.paper_bgcolor,
      font: currentThemeConfig.layout.font,
      colorway: currentThemeConfig.layout.colorway,
      legend: {
        ...prev.legend,
        ...currentThemeConfig.layout.legend,
        bgcolor: isDark ? 'rgba(30, 30, 30, 1)' : 'rgba(255, 255, 255, 1)',
      },
      hoverlabel: currentThemeConfig.layout.hoverlabel,
      // Ensure critical layout properties are preserved (excluding xaxis/yaxis to avoid conflicts)
      dragmode: defaultLayoutProps.dragmode,
      margin: defaultLayoutProps.margin,
      autosize: defaultLayoutProps.autosize,
      // Handle axis properties separately to apply theme colors while preserving structure
      xaxis: {
        ...defaultLayoutProps.xaxis,
        ...currentThemeConfig.layout.xaxis,
        zeroline: false, // Preserve original
      },
      yaxis: {
        ...defaultLayoutProps.yaxis,
        ...currentThemeConfig.layout.yaxis,
        zeroline: false, // Preserve original
      },
      map: {
        ...prev.map,
        style: themeMapStyle,
      }
    }));
  }, [isDark, themeMapStyle]);

  // Update layout if props change
  useEffect(() => {
    setMapLayout((prevLayout: any) => ({
      ...prevLayout,
      map: {
        ...prevLayout.map,
        style: themeMapStyle,
        center: center,
        zoom: zoom
      },
      // Ensure critical properties are maintained
      dragmode: defaultLayoutProps.dragmode,
      margin: defaultLayoutProps.margin,
      autosize: defaultLayoutProps.autosize,
    }));
  }, [center, zoom, themeMapStyle]);

  // Fetch signals data if needed
  useEffect(() => {
    if (!signals || signals.length === 0) {
      dispatch(fetchAllSignals());
    }
  }, [dispatch, signals]);

  // Process data for the map
  useEffect(() => {
    if (loading || !signals || signals.length === 0) return;

    if (isRawTraces && data?.length > 0) {
      // Just use the provided traces directly
      setMapData((prevMapData) => {
        const newData = (data as MapTrace[]).map(trace => ({ 
          ...trace, 
          type: "scattermap" as const
        }));
        
        // Check if data actually changed before updating state
        if (JSON.stringify(prevMapData) === JSON.stringify(newData)) {
          return prevMapData;
        }
        return newData;
      });
      return;
    }

    // Filter signals to only include those with valid coordinates
    const validSignals = signals.filter((signal: any) => 
      signal && 
      signal.latitude !== 0 && 
      signal.longitude !== 0
    );

    if (validSignals.length === 0) {
      setMapData((prevMapData) => {
        const newData = [{
          type: "scattermap" as const,
          lat: [defaultCenter.lat],
          lon: [defaultCenter.lon],
          mode: "markers",
          marker: {
            size: 1,
            opacity: 0
          },
          hoverinfo: "none"
        }];
        
        // Check if data actually changed before updating state
        if (JSON.stringify(prevMapData) === JSON.stringify(newData)) {
          return prevMapData;
        }
        return newData;
      });
      return;
    }

    // Join signal data with metrics data
    const joinedData = validSignals.map((signal: any) => {
      // Look for the signal's metrics in the provided data
      const metricData = Array.isArray(data) ? 
        data.find(d => d.signalID === signal.signalID) : 
        null;
      
      if (metricData) {
        return {
          ...signal,
          value: metricData.value || 0,
        };
      }
      
      return {
        ...signal,
        value: -1  // Unavailable data
      };
    }).filter((item: any) => item); // Remove any undefined items
    
    // Create trace data based on value ranges
    const traces: MapTrace[] = [];
    
    for (let i = 0; i < (mapSettings.ranges?.length || 0); i++) {
      const range = mapSettings.ranges?.[i];
      if (!range) continue;
      
      const rangeSignals = joinedData.filter((signal: any) => 
        signal.value >= range[0] && signal.value <= range[1]
      );
      
      if (rangeSignals.length > 0) {
        traces.push({
          type: "scattermap" as const,
          lat: rangeSignals.map((signal: any) => signal.latitude),
          lon: rangeSignals.map((signal: any) => signal.longitude),
          text: rangeSignals.map((signal: any) => generateTooltipText(signal)),
          marker: {
            color: mapSettings.legendColors?.[i] || "#000000",
            size: 6
          },
          mode: "markers",
          name: mapSettings.legendLabels?.[i] || `Range ${i+1}`,
          showlegend: true,
          hovertemplate: '%{text}' + '<extra></extra>'
        });
      }
    }
    
    // If no traces were created (no data in ranges), add default trace
    if (traces.length === 0) {
      traces.push({
        type: "scattermap" as const,
        lat: [defaultCenter.lat],
        lon: [defaultCenter.lon],
        mode: "markers",
        marker: {
          size: 1,
          opacity: 0
        },
        hoverinfo: "none"
      });
    }
    
    setMapData((prevMapData: MapTrace[]) => {
      // Check if data actually changed before updating state
      if (JSON.stringify(prevMapData) === JSON.stringify(traces)) {
        return prevMapData;
      }
      return traces;
    });
  }, [signals, data, isRawTraces, loading, mapSettings]);

  // Calculate auto center and zoom based on data points
  useEffect(() => {
    if (mapData.length === 0 || 
        mapData[0].lat.length === 0 || 
        mapData[0].lat[0] === defaultCenter.lat) {
      return;
    }

    const allLats = mapData.flatMap(trace => trace.lat);
    const allLons = mapData.flatMap(trace => trace.lon);

    if (allLats.length > 0 && allLons.length > 0) {
      const centerLat = average(allLats);
      const centerLon = average(allLons);
      const calculatedZoom = calculateZoom(allLats, allLons);
      
      // Only update if values actually changed
      setAutoCenter((prev: {lat: number, lon: number} | null) => {
        if (prev && prev.lat === centerLat && prev.lon === centerLon) {
          return prev;
        }
        return { lat: centerLat, lon: centerLon };
      });
      
      setAutoZoom((prev: number | null) => {
        if (prev === calculatedZoom) {
          return prev;
        }
        return calculatedZoom;
      });
    }
  }, [mapData]);

  // Update layout when auto center/zoom or props change
  useEffect(() => {
    const newCenter = center.lat === defaultCenter.lat && center.lon === defaultCenter.lon && autoCenter 
      ? autoCenter 
      : center;
      
    const newZoom = zoom === defaultZoom && autoZoom !== null 
      ? autoZoom 
      : zoom;

    setMapLayout((prevLayout: any) => {
      // Prevent unnecessary updates by checking if values have actually changed
      if (prevLayout.map.center.lat === newCenter.lat && 
          prevLayout.map.center.lon === newCenter.lon && 
          prevLayout.map.zoom === newZoom && 
          prevLayout.map.style === mapStyle) {
        return prevLayout;
      }
      
      return {
        ...prevLayout,
        map: {
          ...prevLayout.map,
          style: mapStyle,
          center: newCenter,
          zoom: newZoom
        },
        // Ensure critical properties are maintained
        dragmode: defaultLayoutProps.dragmode,
        margin: defaultLayoutProps.margin,
        autosize: defaultLayoutProps.autosize,
      };
    });
  }, [autoCenter, autoZoom, center, zoom, mapStyle]);

  // Add ResizeObserver to handle container size changes
  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver(() => {
      // Debounce the resize to avoid too many calls
      setTimeout(() => {
        safeResizePlotly(plotRef.current);
      }, 100);
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // Force resize when layout changes (sidebar expand/collapse)
  useEffect(() => {
    const timer = setTimeout(() => {
      safeResizePlotly(plotRef.current);
    }, 350); // Wait for transition to complete

    return () => clearTimeout(timer);
  }, [width, height]);

  // Listen for window resize events (triggered by sidebar changes)
  useEffect(() => {
    const handleResize = () => {
      // Small delay to ensure DOM has updated
      setTimeout(() => {
        safeResizePlotly(plotRef.current);
      }, 50);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Helper function to format number values
  const formatNumber = (val: number, decimals: number = 0): string => {
    if (isNaN(val) || val === null) {
      return 'N/A';
    }
    return Number(val.toFixed(decimals)).toLocaleString();
  };

  // Helper function to format percent values
  const formatPercent = (val: number, decimals: number = 0): string => {
    if (isNaN(val) || val === null) {
      return 'N/A';
    }
    return formatNumber(val * 100, decimals) + '%';
  };

  // Helper function to format values based on type
  const formatValue = (val: number, formatType: string, decimals: number = 0): string => {
    if (formatType === "percent") {
      return formatPercent(val, decimals);
    }
    return formatNumber(val, decimals);
  };

  // Generate tooltip text for map markers
  const generateTooltipText = (signal: any): string => {
    const sigText = `<b>Signal: ${signal.signalID}</b> | ${signal.mainStreetName} @ ${signal.sideStreetName}`;
    let value = "";

    if (signal.value === -1) {
      value = "Unavailable";
    } else {
      value = formatValue(
        signal.value, 
        mapSettings.metrics.formatType || "number",
        mapSettings.metrics.formatDecimals || 0
      );
    }

    const metricText = `<br><b>${mapSettings.metrics.label}: ${value}</b>`;
    return sigText + metricText;
  };

  // Helper function to calculate average
  const average = (arr: number[]): number => {
    const sum = arr.reduce((a, b) => a + b, 0);
    return sum / arr.length;
  };

  // Helper function to calculate appropriate zoom level
  const calculateZoom = (lats: number[], lons: number[]): number => {
    if (lats.length <= 1) return defaultZoom;
    
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLon = Math.min(...lons);
    const maxLon = Math.max(...lons);
    
    const widthY = maxLat - minLat;
    const widthX = maxLon - minLon;
    
    const zoomY = -1.446 * Math.log(widthY) + 8.2753;
    const zoomX = -1.415 * Math.log(widthX) + 9.7068;
    
    const zoomMin = Math.min(zoomY, zoomX);
    return Math.max(zoomMin, 7);
  };

  return (
    <Box 
      ref={containerRef}
      sx={{ 
        height: height, 
        width: width, 
        position: "relative",
        minHeight: typeof height === 'number' ? height : 350,
        flexGrow: 1,
        display: "flex",
        flexDirection: "column"
      }}
    >
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, position: 'relative', height: '100%' }}>
          <Plot
            ref={plotRef}
            data={mapData as any}
            layout={mapLayout as any}
            style={{ width: "100%", height: "100%", flexGrow: 1 }}
            config={{ 
              displayModeBar: true,
              modeBarButtonsToAdd: [
                'resetViewMapbox',
                'zoomInMapbox',
                'zoomOutMapbox',
              ],
              scrollZoom: true,
              responsive: true,
              doubleClick: 'reset+autosize',
              showTips: true,
              mapAccessToken: "pk.eyJ1IjoicGxvdGx5bWFwYm94IiwiYSI6ImNrOWJqb2F4djBnMjEzbG50amg0dnJieG4ifQ.Zme1-Uzoi75IaFbieBDl3A",
              toImageButtonOptions: {
                format: 'png',
                filename: 'traffic_map',
                height: 1200,
                width: 1800,
                scale: 2
              },
              ...mapOptions
            }}
            useResizeHandler={true}
            onInitialized={(_figure, graphDiv) => {
              // Store reference to the graph div for resize operations
              plotRef.current = graphDiv;
              safeResizePlotly(graphDiv);
            }}
            onUpdate={(_figure, graphDiv) => {
              // Force resize when component updates
              safeResizePlotly(graphDiv);
            }}
          />
          {(!mapData || mapData.length === 0 || (mapData[0]?.lat?.length === 0) || (mapData[0]?.lat?.[0] === defaultCenter.lat && mapData[0]?.lon?.[0] === defaultCenter.lon)) && (
            <Box 
              sx={{ 
                position: 'absolute', 
                top: '50%', 
                left: '50%', 
                transform: 'translate(-50%, -50%)', 
                backgroundColor: isDark ? 'rgba(30, 30, 30, 0.8)' : 'rgba(255, 255, 255, 0.8)', 
                p: 2, 
                borderRadius: 1,
                textAlign: 'center'
              }}
            >
              <Typography variant="subtitle1">{emptyMessage}</Typography>
            </Box>
          )}
          
          {/* Custom legend if provided */}
          {renderLegend && (
            <Paper
              sx={{
                position: "absolute",
                top: 10,
                right: 10,
                p: 1,
                zIndex: 1000,
                width: 150,
                bgcolor: isDark ? 'rgba(30, 30, 30, 0.9)' : 'rgba(255, 255, 255, 0.9)',
              }}
            >
              {renderLegend()}
            </Paper>
          )}
        </Box>
      )}
    </Box>
  );
};

export default MapBox; 