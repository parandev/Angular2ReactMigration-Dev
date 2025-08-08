import React, { useState } from 'react';
import Plot from 'react-plotly.js';
import { chartTitles } from '../../constants/mapData';
import { consoledebug } from '../../utils/debug';

interface TimeSeriesChartProps {
  data: any[];
  selectedMetric: string;
  height?: number;
  width?: string | number;
  showLegend?: boolean;
  hoveredLocation?: string | null;
  selectedLocation?: string | null;
}

const TimeSeriesChart: React.FC<TimeSeriesChartProps> = ({
  data,
  selectedMetric,
  height = 450,
  width = "100%",
  showLegend = false,
  hoveredLocation,
  selectedLocation
}) => {

  const [hoveredTrace, setHoveredTrace] = useState<number | null>(null);

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

  const getAutorange = () => {
    return !["travelTimeIndex", "planningTimeIndex"].includes(selectedMetric);
  };

  const handleHover = (event: { points: Array<{ curveNumber: number }> }) => {
    if (event?.points?.[0]) {
      setHoveredTrace(event.points[0].curveNumber);
    }
  };

  const handleUnhover = () => {
    setHoveredTrace(null);
  };

  // Enhanced data with dynamic line highlighting
  const enhancedData = data.map((trace: Record<string, any>, index: number) => {
    // Check if this trace should be highlighted based on external hover, selection, or internal hover
    const isExternallyHovered = hoveredLocation && trace.name === hoveredLocation;
    const isSelected = selectedLocation && trace.name === selectedLocation;
    const isInternallyHovered = hoveredTrace === index;
    const hasInteraction = hoveredLocation !== null || selectedLocation !== null || hoveredTrace !== null;
    
    // Priority: selection > hover > normal
    let lineWidth = 2;
    let opacity = 1;
    
    if (hasInteraction) {
      if (isSelected) {
        // Selected location gets thickest line and full opacity
        lineWidth = 5;
        opacity = 1;
      } else if (isExternallyHovered || isInternallyHovered) {
        // Hovered location gets medium thickness
        lineWidth = 4;
        opacity = 1;
      } else {
        // Other lines are dimmed
        lineWidth = 1;
        opacity = 0.3;
      }
    }
    
    return {
      ...trace,
      line: {
        ...trace.line,
        width: lineWidth,
      },
      opacity: opacity,
    };
  });

  consoledebug('chartTitles', selectedMetric)
  return (
    <Plot
      data={enhancedData}
      layout={{
        autosize: true,
        height,
        margin: { l: 50, r: 10, t: 10, b: 50 },
        xaxis: { 
          title: {
            text: chartTitles[selectedMetric as keyof typeof chartTitles]["timeSeriesChartTitle"],
            standoff: 40,
          },
          // tickangle: -45,
          automargin: true,
        },
        yaxis: {
          dtick: getDtick(),
          tickformat: getTickFormat(),
          range: getRange(),
          autorange: getAutorange(),
          automargin: true,
        },
        showlegend: showLegend,
        legend: { x: 0, y: 1 },
        hovermode: 'closest',
      }}
      config={{
        modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d'],
        displaylogo: false,
        responsive: true,
      }}
      style={{ width, height: "100%" }}
      onHover={handleHover}
      onUnhover={handleUnhover}
    />
  );
};

export default TimeSeriesChart; 