import type React from "react"
import Plot from "react-plotly.js"
import { Box, Typography } from "@mui/material"
import { PlotData, Layout } from "plotly.js"
import AppConfig from "../utils/appConfig"
import { Graph } from "../utils/graph"

interface LineGraphProps {
  data?: any[]
  title?: string
  graph?: Graph
  lineColor?: string
  goalValue?: number
  fillColor?: string
  isFilled?: boolean
  metrics?: any
}

const LineGraph: React.FC<LineGraphProps> = ({ 
  data,
  title = "Throughput",
  graph,
  lineColor = "#66cc66",
  goalValue,
  fillColor,
  isFilled = false,
  metrics
}) => {
  // Use graph properties if provided
  const graphLineColor = graph?.lineColor || lineColor;
  
  // Use provided data or fallback to default sample data
  const useProvidedData = data && data.length > 0

  // Data points from July 2024 to April 2025 (fallback data)
  const defaultMonths = [
    "Jul 2024",
    "Aug 2024",
    "Sep 2024",
    "Oct 2024",
    "Nov 2024",
    "Dec 2024",
    "Jan 2025",
    "Feb 2025",
    "Mar 2025",
    "Apr 2025",
  ]

  // Default full dates for hover text
  const defaultFullDates = [
    "Jul 1, 2024",
    "Aug 1, 2024",
    "Sep 1, 2024",
    "Oct 1, 2024",
    "Nov 1, 2024",
    "Dec 1, 2024",
    "Jan 1, 2025",
    "Feb 1, 2025",
    "Mar 1, 2025",
    "Apr 1, 2025",
  ]

  // Values that create the curve shown in the image (fallback data)
  const defaultValues = [1178, 1210, 1240, 1280, 1250, 1230, 1200, 1250, 1290, 1320]
  
  // Use provided data or defaults
  const months = useProvidedData 
    ? data.map(item => {
        const date = new Date(item.month)
        return `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`
      })
    : defaultMonths
  
  // Full dates for hover information
  const fullDates = useProvidedData 
    ? data.map(item => {
        const date = new Date(item.month)
        return `${date.toLocaleString('default', { month: 'short' })} ${date.getDate()}, ${date.getFullYear()}`
      })
    : defaultFullDates
    
  const values = useProvidedData 
    ? data.map(item => item.average || item.vph || item[Object.keys(item).find(key => typeof item[key] === 'number') || ''])
    : defaultValues

  // Min and max values for display
  const minValue = Math.min(...values)
  const maxValue = Math.max(...values)
  const averageValue = values.reduce((sum, value) => sum + value, 0) / values.length

  // First and last values for display (might not be min/max)
  const firstValue = values[0]
  const lastValue = values[values.length - 1]

  // Determine goal value from multiple sources with priority:
  // 1. Explicit goalValue prop
  // 2. Goal from metrics object
  // 3. Goal from AppConfig based on title
  const getGoalFromAppConfig = () => {
    
    if (title.includes("Travel Time Index")) {
      return AppConfig.ttiGoal
    } else if (title.includes("Planning Time Index")) {
      return AppConfig.ptiGoal
    } else if (title.includes("Detector Uptime")) {
      return AppConfig.duGoal
    } else if (title.includes("Ped Pushbutton Uptime")) {
      return AppConfig.ppuGoal
    } else if (title.includes("CCTV Uptime")) {
      return  AppConfig.cctvGoal
    } else if (title.includes("Comm Uptime")) {
      return  AppConfig.cuGoal
    }
    
    return null
  }
  
  // Determine if we should show goal and get the goal value
  const configGoalValue = getGoalFromAppConfig()
  const actualGoalValue = goalValue || metrics?.goal || configGoalValue
  const hasGoal = actualGoalValue !== undefined && actualGoalValue !== null
  
  // Determine whether to include fill based on title/metric type
  const shouldFill = hasGoal || isFilled
  
  // Format value based on metrics formatting or default to standard formatting
  const formatValue = (val: number) => {
    if (!val && val !== 0) return "";
    
    if (metrics) {
      // Use metrics formatting if available
      if (metrics.formatType === "percent") {
        // Format as percentage with specified decimals
        const decimals = metrics.formatDecimals || 1;
        return (val * 100).toFixed(decimals) + "%";
      } else {
        // Format as number with specified decimals
        const decimals = metrics.formatDecimals || 0;
        return val.toFixed(decimals);
      }
    } else {
      // Default formatting
      return val.toLocaleString();
    }
  };
  
  // Determine fill color and direction based on the metric type
  let determinedFillColor = fillColor
  let fillDirection = 'tozeroy'
  
  if (!determinedFillColor) {
    if (title.includes("Uptime") || title.includes("Comm")) {
      // For uptime metrics, fill is red and fills when BELOW goal (bad)
      determinedFillColor = "rgba(255, 200, 200, 0.5)"
      fillDirection = 'tonexty' // Fill between lines
    } else if (title.includes("Time Index")) {
      // For TTI and PTI, fill is green and fills when BELOW the line (good)
      determinedFillColor = "rgba(200, 255, 200, 0.5)"
      // fillDirection = 'tonexty' // Fill to zero
    }
  }

  // Create the traces for the plot
  const traces: Partial<PlotData>[] = []
  
  // Add goal line first (for uptime metrics it appears on top)
  if (hasGoal) {
    // Add goal line
    traces.push({
      x: months,
      y: Array(months.length).fill(actualGoalValue),
      type: "scatter",
      mode: "lines",
      line: {
        color: "#999999",
        width: 1,
        dash: "dash",
      },
      hoverinfo: "text",
      hovertext: Array(months.length).fill(`Goal: ${formatValue(actualGoalValue)}`),
      hoverlabel: {
        bgcolor: "#999",
        font: { color: "#fff" },
        bordercolor: "#333",
      },
      name: "Goal"
    })
  }
  
  // Add the data line
  if (shouldFill && title.includes("Uptime")) {
    // For uptime metrics, add the main line after goal line and fill between them
    traces.push({
      x: months,
      y: values,
      type: "scatter",
      mode: "lines",
      line: {
        color: graphLineColor,
        width: 2,
      },
      fill: 'tonexty',
      fillcolor: determinedFillColor,
      hoverinfo: "text",
      hovertext: values.map((val, i) => {
        // Use custom hover template from graph if provided
        if (graph?.hoverTemplate) {
          // Replace placeholders in hover template
          return graph.hoverTemplate
            .replace("%{x}", fullDates[i])
            .replace("%{y:.0f}", formatValue(val))
            .replace("%{y:.1f}", formatValue(val))
            .replace("%{y:.2f}", formatValue(val))
            .replace("%{y:.1%}", (val * 100).toFixed(1) + "%")
            .replace("%{y:.2%}", (val * 100).toFixed(2) + "%")
            .replace("%{y}", formatValue(val));
        }
        // Default hover text
        return `${fullDates[i]}, ${formatValue(val)}`;
      }),
      hoverlabel: {
        bgcolor: graphLineColor,
        font: { color: "#fff" },
        bordercolor: "#333",
      },
    })
  } else if (shouldFill && title.includes("Time Index")) {
    // For Time Index metrics, fill below the line (good when below goal)
    traces.push({
      x: months,
      y: values,
      type: "scatter",
      mode: "lines",
      line: {
        color: graphLineColor,
        width: 2,
      },
      fill: 'tonexty',
      fillcolor: determinedFillColor,
      hoverinfo: "text",
      hovertext: values.map((val, i) => {
        // Use custom hover template from graph if provided
        if (graph?.hoverTemplate) {
          // Replace placeholders in hover template
          return graph.hoverTemplate
            .replace("%{x}", fullDates[i])
            .replace("%{y:.0f}", formatValue(val))
            .replace("%{y:.1f}", formatValue(val))
            .replace("%{y:.2f}", formatValue(val))
            .replace("%{y:.1%}", (val * 100).toFixed(1) + "%")
            .replace("%{y:.2%}", (val * 100).toFixed(2) + "%")
            .replace("%{y}", formatValue(val));
        }
        // Default hover text
        return `${fullDates[i]}, ${formatValue(val)}`;
      }),
      hoverlabel: {
        bgcolor: graphLineColor,
        font: { color: "#fff" },
        bordercolor: "#333",
      },
    })
  } else {
    // Regular line without fill
    traces.push({
      x: months,
      y: values,
      type: "scatter",
      mode: "lines",
      line: {
        color: graphLineColor,
        width: 2,
      },
      hoverinfo: "text",
      hovertext: values.map((val, i) => {
        // Use custom hover template from graph if provided
        if (graph?.hoverTemplate) {
          // Replace placeholders in hover template
          return graph.hoverTemplate
            .replace("%{x}", fullDates[i])
            .replace("%{y:.0f}", formatValue(val))
            .replace("%{y:.1f}", formatValue(val))
            .replace("%{y:.2f}", formatValue(val))
            .replace("%{y:.1%}", (val * 100).toFixed(1) + "%")
            .replace("%{y:.2%}", (val * 100).toFixed(2) + "%")
            .replace("%{y}", formatValue(val));
        }
        // Default hover text
        return `${fullDates[i]}, ${formatValue(val)}`;
      }),
      hoverlabel: {
        bgcolor: graphLineColor,
        font: { color: "#fff" },
        bordercolor: "#333",
      },
    })
  }

  // Create a horizontal line for the average value
  const averageLine: Partial<PlotData> = {
    x: months,
    y: Array(months.length).fill(averageValue),
    type: "scatter",
    mode: "lines",
    line: {
      color: "#888888", // Gray color for average line
      width: 2,
      dash: "solid", // Solid line
    },
    hoverinfo: "text",
    hovertext: Array(months.length).fill(`${averageValue.toLocaleString()}`),
    hoverlabel: {
      bgcolor: "gray",
      font: { color: "#fff" },
      bordercolor: "#333",
    },
    name: "Average"
  }
  
  traces.push(averageLine)

  // Get only four evenly spaced months for x-axis labels (first, 1/3, 2/3, and last)
  const tickValues = useProvidedData
    ? [0, Math.floor(months.length / 3), Math.floor(months.length * 2 / 3), months.length - 1].map(i => months[i])
    : ["Jul 2024", "Oct 2024", "Jan 2025", "Apr 2025"]

  // Layout configuration
  const layout: Partial<Layout> = {
    autosize: true,
    height: 100,
    margin: {
      l: 0,
      r: 0,
      t: 10,
      b: 20,
      pad: 0,
    },
    xaxis: {
      showgrid: false,
      zeroline: false,
      tickfont: {
        size: 10,
        color: "#666",
      },
      tickvals: ["Jul 2024", "Oct 2024", "Jan 2025", "Apr 2025"],
      ticktext: ["Jul 2024", "Oct 2024", "Jan 2025", "Apr 2025"],
      fixedrange: true,
    },
    yaxis: {
      showgrid: false,
      zeroline: false,
      showticklabels: false,
      fixedrange: true,
    },
    showlegend: false,
    plot_bgcolor: "rgba(0,0,0,0)",
    paper_bgcolor: "rgba(0,0,0,0)",
    hovermode: "closest" as const,
    annotations: [
      {
        x: months[0],
        y: values[0],
        text: formatValue(values[0]),
        showarrow: false,
        font: { size: 10 },
        xanchor: "right",
        yanchor: "middle",
        xshift: -5, // Position before the start of the line
      },
      {
        x: months[months.length - 1],
        y: values[values.length - 1],
        text: formatValue(values[values.length - 1]),
        showarrow: false,
        font: { size: 10 },
        xanchor: "left",
        yanchor: "middle",
        xshift: 5, // Position after the end of the line
      },
    ],
  }

  // Plot configuration
  const config = {
    responsive: true,
    displayModeBar: false,
  }

  return (
    <Box sx={{ 
      position: "relative", 
      width: "100%", 
      mb: 1,
      minWidth: 0, // Allow shrinking below content size
      flexShrink: 1 // Allow the entire component to shrink
    }}>
      <Box sx={{ 
        display: "flex", 
        alignItems: "flex-start", 
        width: "100%",
        minWidth: 0 // Allow shrinking below content size
      }}>
        <Typography 
          variant="subtitle1" 
          color="#000000DE" 
          sx={{ 
            mr: 0,
            mt: 3,
            width: "90px",
            flexShrink: 0,
          }}
        >
          {title}
        </Typography>
        
        <Box sx={{ 
          flexGrow: 1, 
          position: "relative", 
          minWidth: 0, // Allow shrinking below content size
          overflow: "hidden" // Prevent content from overflowing
        }}>
          <Plot 
            data={traces} 
            layout={layout} 
            config={config} 
            style={{ 
              width: "100%", 
              height: "100%",
              minWidth: "200px" // Minimum width to prevent too much shrinking
            }} 
          />
        </Box>
      </Box>
    </Box>
  )
}

export default LineGraph