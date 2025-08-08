export const chartTitles = {
  "throughput": {
    "metricCardTitle": "Average vehicles per hour",
    "bottomChartTitle": "Throughput (peak veh/hr)",
    "locationBarChartTitle": "Throughput(vph)",
    "timeSeriesChartTitle": "Vehicles per Hour Trend"
  },
  "dailyTrafficVolumes": {
    "metricCardTitle": "Traffic Volume [veh/day]",
    "bottomChartTitle": "Traffic Volume [veh/day]",
    "locationBarChartTitle": "Selected Month",
    "timeSeriesChartTitle": "Weekly Trend"
  },
  "arrivalsOnGreen": {
    "metricCardTitle": "Arrivals on Green",
    "bottomChartTitle": "Arrivals on Green [%]",
    "locationBarChartTitle": "Arrivals on Green",
    "timeSeriesChartTitle": "Weekly Trend"
  },
  "progressionRatio": {
    "metricCardTitle": "Progression Ratio",
    "bottomChartTitle": "Progression Ratio",
    "locationBarChartTitle": "Selected Month",
    "timeSeriesChartTitle": "Weekly Trend"
  },
  "spillbackRatio": {
    "metricCardTitle": "Spillback rate",
    "bottomChartTitle": "Queue Spillback Rate",
    "locationBarChartTitle": "Queue Spillback Rate",
    "timeSeriesChartTitle": "Queue Spillback Trend"
  },
  "peakPeriodSplitFailures": {
    "metricCardTitle": "Peak Period Split Failures",
    "bottomChartTitle": "Split Failures Rate [%]",
    "locationBarChartTitle": "Selected Month",
    "timeSeriesChartTitle": "Weekly Trend"
  },
  "offPeakSplitFailures": {
    "metricCardTitle": "Off-Peak Split Failures",
    "bottomChartTitle": "Split Failures Rate [%]",
    "locationBarChartTitle": "Selected Month",
    "timeSeriesChartTitle": "Weekly Trend"
  },
  "travelTimeIndex": {
    "metricCardTitle": "Travel Time Index",
    "bottomChartTitle": "Travel Time Index (TTI)",
    "locationBarChartTitle": "Selected Month TTI",
    "timeSeriesChartTitle": "Weekly Trend"
  },
  "planningTimeIndex": {
    "metricCardTitle": "Planning Time Index",
    "bottomChartTitle": "Planning Time Index (PTI)",
    "locationBarChartTitle": "Selected Month PTI",
    "timeSeriesChartTitle": "Weekly Trend"
  },
  "detectorUptime": {
    "metricCardTitle": "Detector Uptime",
    "bottomChartTitle": "Detector Uptime [%]",
    "locationBarChartTitle": "Selected Month",
    "timeSeriesChartTitle": "Weekly Trend"
  },
  "pedestrianPushbuttonActivity": {
    "metricCardTitle": "Pedestrian Activations [pa/day]",
    "bottomChartTitle": "Pedestrian Activations per Day [pa/day]",
    "locationBarChartTitle": "Selected Month",
    "timeSeriesChartTitle": "Weekly Trend",
  },
  "pedestrianPushbuttonUptime": {
    "metricCardTitle": "Pedestrian Pushbutton Availability",
    "bottomChartTitle": "Pedestrian Pushbutton Uptime [%]",
    "locationBarChartTitle": "Selected Month",
    "timeSeriesChartTitle": "Weekly Trend",
  },
  "cctvUptime": {
    "metricCardTitle": "CCTV Availability",
    "bottomChartTitle": "CCTV Uptime [%]",
    "locationBarChartTitle": "Selected Month",
    "timeSeriesChartTitle": "Weekly Trend"
  },
  "communicationUptime": {
    "metricCardTitle": "Communications Uptime",
    "bottomChartTitle": "Communications Uptime [%]",
    "locationBarChartTitle": "Selected Month",
    "timeSeriesChartTitle": "Weekly Trend"
  },
  "healthMetrics": {
    "metricCardTitle": "Health Score",
    "bottomChartTitle": "Health Score [%]",
    "locationBarChartTitle": "Health Score",
    "timeSeriesChartTitle": "Month & Year"
  }
}

// Map metric IDs to their API keys
export const metricApiKeys: { [key: string]: string } = {
// Operations metrics
dailyTrafficVolumes: 'vpd',
throughput: 'tp',
arrivalsOnGreen: 'aogd',
progressionRatio: 'prd',
spillbackRatio: 'qsd',
peakPeriodSplitFailures: 'sfd',
offPeakSplitFailures: 'sfo',
travelTimeIndex: 'tti',
planningTimeIndex: 'pti',

// Maintenance metrics
detectorUptime: 'du',
pedestrianPushbuttonActivity: 'papd',
pedestrianPushbuttonUptime: 'pau',
cctvUptime: 'cctv',
communicationUptime: 'cu'
};


export default {chartTitles, metricApiKeys};