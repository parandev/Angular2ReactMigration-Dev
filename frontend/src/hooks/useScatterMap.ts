import { useState, useCallback } from 'react';
import { MapConfig } from '../utils/mapSettings';
import { consoledebug } from '../utils/debug';

interface Signal {
  signalID: string;
  latitude: number;
  longitude: number;
  mainStreetName: string;
  sideStreetName: string;
  [key: string]: any;
}

interface MetricDataItem {
  label: string;
  avg: number;
  delta?: number;
  zoneGroup?: string | null;
  weight?: number;
}

export const useScatterMap = () => {
  const [mapData, setMapData] = useState<any[]>([]);
  const [mapLayout, setMapLayout] = useState<any>({
    autosize: true,
    hovermode: "closest",
    map: {
      style: "carto-positron",
      center: { lat: 33.789, lon: -84.388 },
      zoom: 11,
      pitch: 0,
      bearing: 0,
      dragmode: "zoom",
      accesstoken: "pk.eyJ1IjoicGxvdGx5bWFwYm94IiwiYSI6ImNrOWJqb2F4djBnMjEzbG50amg0dnJieG4ifQ.Zme1-Uzoi75IaFbieBDl3A"
    },
    margin: { r: 0, t: 0, b: 0, l: 0 },
    legend: {
      x: 1,
      xanchor: 'right',
      y: 0.9,
      bgcolor: 'rgba(255, 255, 255, 0.8)',
      bordercolor: 'rgba(0, 0, 0, 0.1)',
      borderwidth: 1
    },
    dragmode: "pan",
  });
  const [loading, setLoading] = useState<boolean>(false);

  // Calculate average of a field in an array of objects
  const calculateAverage = useCallback((data: any[], field: string): number => {
    if (!data || data.length === 0) return 0;
    
    const values = data.map(item => item[field]);
    const sum = values.reduce((a, b) => a + b, 0);
    return sum / values.length;
  }, []);

  // Calculate zoom level based on data points
  const calculateZoom = useCallback((data: any[]): number => {
    if (!data || data.length <= 1) return 12;
    
    const latitudes = data.map(item => item.latitude);
    const longitudes = data.map(item => item.longitude);
    
    const minLat = Math.min(...latitudes);
    const maxLat = Math.max(...latitudes);
    const minLng = Math.min(...longitudes);
    const maxLng = Math.max(...longitudes);
    
    const widthY = maxLat - minLat;
    const widthX = maxLng - minLng;
    
    const zoomY = -1.446 * Math.log(widthY) + 8.2753;
    const zoomX = -1.415 * Math.log(widthX) + 9.7068;
    
    return Math.min(zoomY, zoomX);
  }, []);

  // Generate tooltip text
  const generateTooltipText = useCallback((signal: any, field: string, label: string, formatType: string, decimals: number): string => {
    const signalInfo = `ID: ${signal.signalID}<br>${signal.mainStreetName} @ ${signal.sideStreetName}`;
    let value;
    
    if (signal[field] === -1 || signal[field] === undefined) {
      value = "Unavailable";
    } else {
      if (formatType === "percent") {
        value = `${(signal[field] * 100).toFixed(decimals)}%`;
      } else {
        value = Math.round(signal[field]).toLocaleString();
      }
    }
    
    return `${signalInfo}<br>${label}: ${value}`;
  }, []);

  const processMapData = useCallback((signals: Signal[], metricData: MetricDataItem[], mapConfig: MapConfig) => {
    setLoading(true);
    try {
      consoledebug("Processing map data with config:", mapConfig);
      consoledebug("Signals:", signals.length, "Metric data:", metricData.length);
      
      // Join signal data with metric data
      const joinedData = signals
        .map(signal => {
          const metricItem = metricData.find(md => md.label === signal.signalID);
          if (metricItem) {
            return {
              ...signal,
              [mapConfig.field]: metricItem.avg
            };
          }
          return null;
        })
        .filter(Boolean);
      
      consoledebug("Joined data:", joinedData.length);
      
      // Create different traces for each range
      const mapTraces = [];
      
      for (let i = 0; i < mapConfig.ranges.length; i++) {
        const range = mapConfig.ranges[i];
        
        // Filter signals in this range
        const rangeSignals = joinedData.filter((signal: any) => 
          signal[mapConfig.field] >= range[0] && signal[mapConfig.field] <= range[1]
        );
        
        consoledebug(`Range ${i} (${range[0]}-${range[1]}):`, rangeSignals.length, "signals");
        
        if (rangeSignals.length > 0) {
          // Create a trace for this range of signals
          mapTraces.push({
            type: "scattermap",
            lat: rangeSignals.map((signal: any) => signal.latitude),
            lon: rangeSignals.map((signal: any) => signal.longitude),
            mode: "markers",
            marker: {
              color: mapConfig.legendColors[i],
              size: 10,
              opacity: 0.8,
              symbol: "circle"
            },
            text: rangeSignals.map((signal: any) => 
              generateTooltipText(
                signal, 
                mapConfig.field, 
                mapConfig.label, 
                mapConfig.formatType, 
                mapConfig.formatDecimals
              )
            ),
            name: mapConfig.legendLabels[i],
            showlegend: true,
            hoverinfo: "text"
          });
        }
      }
      
      consoledebug("Created traces:", mapTraces.length);
      
      if (mapTraces.length > 0) {
        // Calculate map center and zoom
        const centerLat = calculateAverage(joinedData, 'latitude');
        const centerLon = calculateAverage(joinedData, 'longitude');
        const zoom = calculateZoom(joinedData);
        
        // Create layout with proper center and zoom
        const newMapLayout = {
          ...mapLayout,
          map: {
            ...mapLayout.map,
            center: { lat: centerLat, lon: centerLon },
            zoom: zoom
          },
          updatemenus: [
            {
              buttons: [
                {
                  args: [{ "map.zoom": zoom, "map.center.lat": centerLat, "map.center.lon": centerLon }],
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
        };
        
        setMapData(mapTraces);
        setMapLayout(newMapLayout);
        return true;
      } else {
        console.warn("No map traces created from the data");
        return false;
      }
    } catch (error) {
      console.error("Error processing map data:", error);
      return false;
    } finally {
      setLoading(false);
    }
  }, [calculateAverage, calculateZoom, generateTooltipText, mapLayout]);

  return {
    mapData,
    mapLayout,
    loading,
    processMapData
  };
};

export default useScatterMap; 