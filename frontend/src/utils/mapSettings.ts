import colors from './colors';

// Define interface for map config settings
export interface MapConfig {
  field: string;
  label: string;
  formatType: string;
  formatDecimals: number;
  ranges: number[][];
  legendLabels: string[];
  legendColors: string[];
}

// Global map settings
export const mapGlobalSettings = {
  mapSource: 'main',
  mapInterval: 'mo',
  mapLevel: 'sig',
};

// Map settings configuration for different metrics
export const mapSettings: Record<string, MapConfig> = {
  // Daily Traffic Volume
  dailyTrafficVolume: {
    field: "vpd",
    label: "Daily Traffic Volume",
    formatType: "number",
    formatDecimals: 0,
    ranges: [
      [-1, -1],
      [0, 10000],
      [10001, 20000],
      [20001, 30000],
      [30001, 40000],
      [40001, 10000000]
    ],
    legendLabels: [
      "Unavailable",
      "0 - 10,000 vpd",
      "10,001 - 20,000 vpd",
      "20,001 - 30,000 vpd", 
      "30,001 - 40,000 vpd", 
      "40,001+ vpd"
    ],
    legendColors: [colors.gray, colors.lightTeal, colors.teal, colors.blue, colors.darkBlue, colors.purple],
  },

  // Pedestrian Pushbutton Activity per Day
  pedestrianPushbuttonActivity: {
    field: "papd",
    label: "Daily Pedestrian Pushbutton Activity",
    formatType: "number",
    formatDecimals: 0,
    ranges: [
      [-1, -1],
      [0, 100],
      [101, 200],
      [201, 300],
      [301, 400],
      [400, 5000]
    ],
    legendLabels: [
      "Unavailable",
      "0 - 100",
      "101 - 200",
      "201 - 300",
      "301 - 400",
      "400+"
    ],
    legendColors: [colors.gray, colors.lightTeal, colors.teal, colors.blue, colors.darkBlue, colors.purple],
  },

  // Throughput
  throughput: {
    field: "vph",
    label: "Throughput",
    formatType: "number",
    formatDecimals: 0,
    ranges: [
      [-1, -1],
      [0, 2000],
      [2001, 4000],
      [4001, 6000],
      [6001, 8000],
      [8001, 100000]
    ],
    legendLabels: [
      "Unavailable",
      "0 - 2000",
      "2,001 - 4,000",
      "4,001 - 6,000",
      "6,001 - 8,000",
      "8,001+"
    ],
    legendColors: [colors.gray, colors.lightTeal, colors.teal, colors.blue, colors.darkBlue, colors.purple],
  },

  // Arrivals on Green
  arrivalsOnGreen: {
    field: "aog",
    label: "Arrivals on Green",
    formatType: "percent",
    formatDecimals: 1,
    ranges: [
      [-1, -1],
      [0, 0.2],
      [0.21, 0.4],
      [0.41, 0.6],
      [0.61, 0.8],
      [0.8, 1]
    ],
    legendLabels: [
      "Unavailable",
      "0% - 20%",
      "21% - 40%",
      "41% - 60%",
      "61% - 80%",
      "81% - 100%"
    ],
    legendColors: [colors.gray, colors.purple, colors.redOrange, colors.yellow, colors.greenYellow, colors.green],
  },

  // Progression Ratio
  progressionRate: {
    field: "pr",
    label: "Progression Ratio",
    formatType: "number",
    formatDecimals: 2,
    ranges: [
      [-1, -1],
      [0, 0.4],
      [0.41, 0.8],
      [0.81, 1],
      [1.01, 1.2],
      [1.21, 10]
    ],
    legendLabels: [
      "Unavailable",
      "0 - 0.4",
      "0.41 - 0.8",
      "0.81 - 1",
      "1.01 - 1.2",
      "1.2+"
    ],
    legendColors: [colors.gray, colors.red, colors.redOrange, colors.orange, colors.yellow, colors.yellowGreen],
  },

  // Queue Spillback
  spillbackRate: {
    field: "qs_freq",
    label: "Queue Spillback",
    formatType: "percent",
    formatDecimals: 1,
    ranges: [
      [-1, -1],
      [0, 0.2],
      [0.21, 0.4],
      [0.41, 0.6],
      [0.61, 0.8],
      [0.81, 1]
    ],
    legendLabels: [
      "Unavailable",
      "0% - 20%",
      "20.01% - 40%",
      "40.01% - 60%",
      "60.01% - 80%",
      "80.01% - 100%"
    ],
    legendColors: [colors.gray, colors.green, colors.greenYellow, colors.yellow, colors.redOrange, colors.red],
  },

  // Peak Period Split Failures
  peakPeriodSplitFailures: {
    field: "sf_freq",
    label: "Peak Split Failures",
    formatType: "percent",
    formatDecimals: 1,
    ranges: [
      [-1, -1],
      [0, 0.05],
      [0.051, 0.1],
      [0.101, 0.15],
      [0.151, 0.2],
      [0.201, 1]
    ],
    legendLabels: [
      "Unavailable",
      "0% - 5%",
      "5.1% - 10%",
      "10.1% - 15%",
      "15.1% - 20%",
      "20.1%+"
    ],
    legendColors: [colors.gray, colors.green, colors.greenYellow, colors.yellow, colors.redOrange, colors.red],
  },

  // Off-Peak Split Failures
  offPeakSplitFailures: {
    field: "sf_freq",
    label: "Off-Peak Split Failures",
    formatType: "percent",
    formatDecimals: 1,
    ranges: [
      [-1, -1],
      [0, 0.05],
      [0.051, 0.1],
      [0.101, 0.15],
      [0.151, 0.2],
      [0.201, 1]
    ],
    legendLabels: [
      "Unavailable",
      "0% - 5%",
      "5.1% - 10%",
      "10.1% - 15%",
      "15.1% - 20%",
      "20.1%+"
    ],
    legendColors: [colors.gray, colors.green, colors.greenYellow, colors.yellow, colors.redOrange, colors.red],
  },

  // Detector Uptime
  detectorUptime: {
    field: "uptime",
    label: "Detector Uptime",
    formatType: "percent",
    formatDecimals: 1,
    ranges: [
      [-1, -1],
      [0, 0.6],
      [0.61, 0.8],
      [0.81, 0.9],
      [0.91, 0.95],
      [0.95, 1]
    ],
    legendLabels: [
      "Unavailable",
      "0% - 60%",
      "60.01% - 80%",
      "80.01% - 90%",
      "90.1% - 95%",
      "95.1%+"
    ],
    legendColors: [colors.gray, colors.red, colors.redOrange, colors.yellow, colors.greenYellow, colors.green],
  },

  // Pedestrian Pushbutton Uptime
  pedestrianPushbuttonUptime: {
    field: "uptime",
    label: "Pedestrian Pushbutton Uptime",
    formatType: "percent",
    formatDecimals: 1,
    ranges: [
      [-1, -1],
      [0, 0.6],
      [0.61, 0.8],
      [0.81, 0.9],
      [0.91, 0.95],
      [0.95, 1]
    ],
    legendLabels: [
      "Unavailable",
      "0% - 60%",
      "60.01% - 80%",
      "80.01% - 90%",
      "90.1% - 95%",
      "95.1%+"
    ],
    legendColors: [colors.gray, colors.red, colors.redOrange, colors.yellow, colors.greenYellow, colors.green],
  },

  // CCTV Uptime
  cctvUptime: {
    field: "uptime",
    label: "CCTV Uptime",
    formatType: "percent",
    formatDecimals: 1,
    ranges: [
      [-1, -1],
      [0, 0.6],
      [0.61, 0.8],
      [0.81, 0.9],
      [0.91, 0.95],
      [0.95, 1]
    ],
    legendLabels: [
      "Unavailable",
      "0% - 60%",
      "60.01% - 80%",
      "80.01% - 90%",
      "90.1% - 95%",
      "95.1%+"
    ],
    legendColors: [colors.gray, colors.red, colors.redOrange, colors.yellow, colors.greenYellow, colors.green],
  },

  // Communication Uptime
  communicationUptime: {
    field: "uptime",
    label: "Communication Uptime",
    formatType: "percent",
    formatDecimals: 1,
    ranges: [
      [-1, -1],
      [0, 0.6],
      [0.61, 0.8],
      [0.81, 0.9],
      [0.91, 0.95],
      [0.95, 1]
    ],
    legendLabels: [
      "Unavailable",
      "0% - 60%",
      "60.01% - 80%",
      "80.01% - 90%",
      "90.1% - 95%",
      "95.1%+"
    ],
    legendColors: [colors.gray, colors.red, colors.redOrange, colors.yellow, colors.greenYellow, colors.green],
  },

  // Ped Delay
  pedestrianDelay: {
    field: "pedd",
    label: "Ped Delay",
    formatType: "number",
    formatDecimals: 0,
    ranges: [
      [-1, -1],
      [0, 50],
      [50, 100],
      [100, 150],
      [150, 200]
    ],
    legendLabels: [
      "Unavailable",
      "0-50",
      "50-100",
      "100-150",
      "150-200"
    ],
    legendColors: [colors.gray, colors.green, colors.yellow, colors.redOrange, colors.red],
  },

  // Pedestrian Pushbutton Availability
  pedestrianPushbuttonAvailability: {
    field: "pedpb",
    label: "Ped Pushbutton Availability",
    formatType: "percent",
    formatDecimals: 1,
    ranges: [
      [-1, -1],
      [0.0, 0.2],
      [0.2, 0.4],
      [0.4, 0.6],
      [0.6, 0.8],
      [0.8, 1]
    ],
    legendLabels: [
      "Unavailable",
      "0.0-0.2",
      "0.2-0.4",
      "0.4-0.6",
      "0.6-0.8",
      "0.8-1.0"
    ],
    legendColors: [colors.gray, colors.red, colors.redOrange, colors.yellow, colors.greenYellow, colors.green],
  }
};

// Map metric codes to display names
export const displayMetricToMeasureMap: Record<string, string> = {
  dailyTrafficVolume: "vpd",
  pedestrianPushbuttonActivity: "papd",
  throughput: "vph",
  arrivalsOnGreen: "aog",
  progressionRate: "pr",
  spillbackRate: "qs_freq",
  peakPeriodSplitFailures: "sf_freq",
  offPeakSplitFailures: "sf_freq",
  detectorUptime: "uptime",
  pedestrianPushbuttonUptime: "uptime",
  cctvUptime: "uptime",
  communicationUptime: "uptime",
  pedestrianDelay: "pedd",
  pedestrianPushbuttonAvailability: "pedpb"
};

export default mapSettings; 