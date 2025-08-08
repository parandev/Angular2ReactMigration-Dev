import React, { useRef, useState, useEffect } from 'react';
import Plot from 'react-plotly.js';
import { chartTitles } from '../../constants/mapData';

interface LocationBarData {
  x: number[];
  y: string[];
  type: string;
  orientation: string;
  marker: {
    color: string[];
    opacity: number[];
  };
  hovertemplate: string;
}

interface LocationBarChartProps {
  data: LocationBarData;
  selectedMetric: string;
  height?: number;
  width?: string | number;
  onLocationHover?: (location: string | null) => void;
}

const LocationBarChart: React.FC<LocationBarChartProps> = ({
  data,
  selectedMetric,
  height = 450, // Default height matches TimeSeriesChart default
  width = "100%",
  onLocationHover
}) => {
  const mainChartRef = useRef(null);
  const xAxisRef = useRef(null);
  const [xRange, setXRange] = useState<[number, number]>([0, 100]);

  const getAxisTitle = () => {
    switch (selectedMetric) {
      case "throughput":
        return "Throughput (vph)";
      case "arrivalsOnGreen":
        return "Arrivals on Green";
      default:
        return "Value";
    }
  };

  const getDtick = () => {
    switch (selectedMetric) {
      case "throughput": return 500;
      case "arrivalsOnGreen": return 0.2;
      case "progressionRatio": return 0.5;
      case "spillbackRatio": return 0.2;
      case "peakPeriodSplitFailures": return 0.1;
      case "offPeakSplitFailures": return 0.05;
      case "travelTimeIndex": return 0.2;
      case "planningTimeIndex": return 0.5;
      default: return undefined;
    }
  };

  const getTickFormat = () => {
    if (["arrivalsOnGreen", "spillbackRatio", "peakPeriodSplitFailures", "offPeakSplitFailures"].includes(selectedMetric)) {
      return '.1%';
    }
    return undefined;
  };

  const getRange = () => {
    if (selectedMetric === "travelTimeIndex") {
      return [1, 2.2];
    } else if (selectedMetric === "planningTimeIndex") {
      return [1, 3];
    }
    return undefined;
  };

  // Align x-axis with TimeSeriesChart dynamically based on height
  // TimeSeriesChart: height=height, bottom margin=50px → x-axis at (height - 50)px from top
  // LocationBarChart: Need x-axis to also appear at (height - 50)px from top
  const timeSeriesAxisPosition = height - 50; // Dynamic based on passed height
  const xAxisHeight = 50; // Height for x-axis section (same as TimeSeriesChart bottom margin)
  const totalHeight = height; // Use the passed height
  const scrollableHeight = timeSeriesAxisPosition; // height - 50 for scrollable area

  // Calculate dimensions - responsive width
  const barHeight = 10;
  const chartHeight = data.y.length * barHeight + 100;

  // Set x-axis range based on data and metric settings
  useEffect(() => {
    const customRange = getRange();
    if (customRange) {
      setXRange(customRange as [number, number]);
    } else {
      const min = Math.min(...data.x);
      const max = Math.max(...data.x);
      const padding = (max - min) * 0.1; // 10% padding
      setXRange([Math.max(0, min - padding), max + padding]);
    }
  }, [data.x, selectedMetric]);

  const plotData = {
    ...data,
    marker: {
      ...data.marker,
    },
    width: Array(data.y.length).fill(0.8) as number[]
  } as Plotly.Data;

  const handleHover = (event: Readonly<Plotly.PlotMouseEvent>) => {
    if (event.points && event.points[0] && onLocationHover) {
      const point = event.points[0] as Plotly.PlotDatum;
      if (point.y && typeof point.y === 'string') {
        onLocationHover(point.y);
      }
    }
  };

  const handleUnhover = () => {
    if (onLocationHover) {
      onLocationHover(null);
    }
  };

  return (
    <div style={{ 
      width: width, 
      height: totalHeight, // Use passed height (450px for Operations, 500px for Maintenance)
      backgroundColor: 'white',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Main chart: Bars, no x-axis */}
      <div style={{ 
        height: scrollableHeight, // Dynamic height to align x-axis properly
        overflowY: 'auto', 
        overflowX: 'hidden',
        position: 'relative'
      }}>
        <Plot
          ref={mainChartRef}
          data={[plotData]}
          layout={{
            height: chartHeight,
            autosize: true, // Make it responsive
            margin: { l: 150, r: 10, t: 20, b: 0 }, // No bottom margin = no x-axis
            yaxis: {
              title: "",
              automargin: true,
              tickfont: { size: 10 },
              tickmode: "array",
              ticktext: data.y,
              tickvals: data.y,
              showticklabels: true,
              side: "left",
              fixedrange: true
            },
            xaxis: { 
              visible: false, 
              fixedrange: true,
              range: xRange
            },
            bargap: 0.15,
            showlegend: false,
            plot_bgcolor: "white",
            paper_bgcolor: "white"
          }}
          config={{ 
            staticPlot: false,
            displayModeBar: false,
            responsive: true // Enable responsive behavior
          }}
          style={{ 
            width: '100%',
            height: 'auto'
          }}
          onClick={undefined}
          onHover={handleHover}
          onUnhover={handleUnhover}
        />
      </div>

      {/* Fixed x-axis at the bottom - aligned with TimeSeriesChart x-axis */}
      <div style={{ 
        height: xAxisHeight, // 50px to match TimeSeriesChart bottom margin
        width: '100%', // Use full container width
        overflow: 'hidden',
        borderTop: '1px solid #e0e0e0',
        flexShrink: 0 // Don't shrink this section
      }}>
        <Plot
          ref={xAxisRef}
          data={[{
            type: 'bar',
            y: [' '], // Invisible bar
            x: [xRange[1]], // Use max value for scale
            orientation: 'h',
            marker: { color: 'rgba(0,0,0,0)' }, // Invisible
            hoverinfo: 'none'
          }]}
          layout={{
            height: xAxisHeight,
            autosize: true, // Make it responsive
            margin: { l: 150, r: 10, t: 0, b: 50 }, // Same left margin as main chart, bottom for axis title
            yaxis: { visible: false },
            xaxis: { 
              range: xRange, 
              fixedrange: true,
              title: {
                text: chartTitles[selectedMetric as keyof typeof chartTitles]?.["locationBarChartTitle"] || getAxisTitle(),
                standoff: 20,
              },
              dtick: getDtick(),
              tickformat: getTickFormat()
            },
            showlegend: false,
            plot_bgcolor: "white",
            paper_bgcolor: "white"
          }}
          config={{ 
            staticPlot: true, 
            displayModeBar: false,
            responsive: true // Enable responsive behavior
          }}
          style={{ 
            width: '100%',
            height: '100%'
          }}
        />
      </div>
    </div>
  );
};

export default LocationBarChart; 