"use client"

import type React from "react"

import { useState } from "react"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import Paper from "@mui/material/Paper"
import Grid from "@mui/material/Grid"
import Tabs from "@mui/material/Tabs"
import Tab from "@mui/material/Tab"
import Plot from "react-plotly.js"
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew"
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos"
import IconButton from "@mui/material/IconButton"

// Mock data for tasks
const taskMetrics = {
  reported: { value: 0, change: -48.0 },
  resolved: { value: 1, change: -45.45 },
  outstanding: { value: 89, change: -21.93 },
  overDue: { value: 885, change: "N/A" },
}

// Mock data for task trends
const taskTrends = {
  months: ["Nov 2024", "Dec 2024", "Jan 2024", "Feb 2024", "Mar 2024", "Apr 2024", "May 2024", "Jun 2024"],
  reported: [150, 200, 300, 200, 150, 100, 0, 0],
  resolved: [120, 180, 210, 180, 130, 90, 0, 0],
  outstanding: [700, 720, 810, 830, 800, 650, 400, 100],
}

// Mock data for task types
const taskTypes = [
  { id: "16", name: "Field Support", count: 250 },
  { id: "18", name: "Hardware Installation & Replacement", count: 150 },
  { id: "23", name: "Local Response", count: 100 },
  { id: "06", name: "Complaint", count: 80 },
  { id: "03", name: "Temporary Adjustment", count: 70 },
  { id: "12", name: "Special Event Timing & Support", count: 60 },
  { id: "07", name: "Timing Implementation", count: 50 },
  { id: "20", name: "Ground Preventative Maintenance", count: 40 },
  { id: "28", name: "Traffic Engineering Study", count: 30 },
  { id: "33", name: "Troubleshoot", count: 20 },
]

export default function TeamsTask() {
  // const [dateRange, setDateRange] = useState("priorYear")
  // const [dateAggregation, setDateAggregation] = useState("monthly")
  // const [region, setRegion] = useState("centralMetro")
  const [currentTab, setCurrentTab] = useState(0)

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue)
  }

  // Prepare data for the task trend chart
  const taskTrendData = [
    {
      x: taskTrends.months,
      y: taskTrends.reported,
      type: "bar",
      name: "Tasks Reported",
      marker: { color: "#ef4444" },
    },
    {
      x: taskTrends.months,
      y: taskTrends.resolved,
      type: "bar",
      name: "Tasks Resolved",
      marker: { color: "#22c55e" },
    },
    {
      x: taskTrends.months,
      y: taskTrends.outstanding,
      type: "scatter",
      mode: "lines+markers",
      name: "Tasks Outstanding",
      marker: { color: "#eab308" },
      line: { color: "#eab308", width: 2 },
    },
  ]

  // Prepare data for the task types chart
  const taskTypesData = {
    y: taskTypes.map((type) => type.name),
    x: taskTypes.map((type) => type.count),
    type: "bar",
    orientation: "h",
    marker: {
      color: taskTypes.map((_, index) => {
        // Use a gradient of colors
        if (index === 0) return "#ef4444"
        if (index === 1) return "#f97316"
        return "#e2e8f0"
      }),
    },
  }

  return (
    <Box sx={{ p: 2 }}>

      {/* Task Metrics Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3}>
          <Paper sx={{ p: 2, textAlign: "center", height: "100%" }}>
            <Typography variant="h4" component="div" gutterBottom>
              {taskMetrics.reported.value}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              ({taskMetrics.reported.change}%)
            </Typography>
            <Typography variant="body1">Tasks Reported</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper sx={{ p: 2, textAlign: "center", height: "100%" }}>
            <Typography variant="h4" component="div" gutterBottom>
              {taskMetrics.resolved.value}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              ({taskMetrics.resolved.change}%)
            </Typography>
            <Typography variant="body1">Tasks Resolved</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper sx={{ p: 2, textAlign: "center", height: "100%" }}>
            <Typography variant="h4" component="div" gutterBottom>
              {taskMetrics.outstanding.value}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              ({taskMetrics.outstanding.change}%)
            </Typography>
            <Typography variant="body1">Tasks Outstanding</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper sx={{ p: 2, textAlign: "center", height: "100%" }}>
            <Typography variant="h4" component="div" gutterBottom>
              {taskMetrics.overDue.value}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              (N/A)
            </Typography>
            <Typography variant="body1">Tasks Over 45 Days</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Task Trends Chart */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Box sx={{ width: 16, height: 16, bgcolor: "#ef4444", mr: 1 }} />
            <Typography variant="body2" sx={{ mr: 3 }}>
              Tasks Reported
            </Typography>

            <Box sx={{ width: 16, height: 16, bgcolor: "#22c55e", mr: 1 }} />
            <Typography variant="body2" sx={{ mr: 3 }}>
              Tasks Resolved
            </Typography>

            <Box sx={{ width: 16, height: 16, bgcolor: "#eab308", mr: 1 }} />
            <Typography variant="body2">Tasks Outstanding</Typography>
          </Box>
        </Box>
        <Plot
          data={taskTrendData as any}
          layout={{
            autosize: true,
            height: 350,
            margin: { l: 50, r: 20, t: 20, b: 50 },
            barmode: "group",
            xaxis: {
              title: "",
              tickangle: -45,
            },
            yaxis: {
              title: "",
              range: [0, 900],
            },
            showlegend: false,
          }}
          style={{ width: "100%" }}
        />
      </Paper>

      {/* Task Types Chart */}
      <Paper sx={{ p: 2 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Tabs value={currentTab} onChange={handleTabChange}>
            <Tab label="SOURCE" />
            <Tab label="TYPE" />
            <Tab label="STATUS" />
          </Tabs>
          <Box>
            <IconButton size="small">
              <ArrowBackIosNewIcon fontSize="small" />
            </IconButton>
            <IconButton size="small">
              <ArrowForwardIosIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>
        <Plot
          data={[taskTypesData as any]}
          layout={{
            autosize: true,
            height: 350,
            margin: { l: 150, r: 50, t: 20, b: 50 },
            yaxis: {
              title: "",
              automargin: true,
            },
            xaxis: {
              title: "",
              showticklabels: false,
            },
          }}
          style={{ width: "100%" }}
        />
      </Paper>
    </Box>
  )
}

