import { Routes, Route, Router } from "react-router-dom"
import Dashboard from "../components/Dashboard"
import Operations from "../components/Operations"
import Maintenance from "../components/Maintenance"
import Watchdog from "../components/Watchdog"
// import TeamsTask from "../components/TeamsTasks"
import HealthMetrics from "../components/HealthMetrics"
import SummaryTrend from "../components/SummaryTrend"
import SignalInfo from "../components/SignalInfo"
import Reports from "../components/Reports"
import Help from "../components/Help"
import Contact from "../components/ContactForm"
import About from "../components/About"
import NotFound from "../components/NotFound"
import Layout from "../components/Layout"

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="operations" element={<Operations />} />
        <Route path="maintenance" element={<Maintenance />} />
        <Route path="watchdog" element={<Watchdog />} />
        <Route path="reports" element={<Reports />} />
        <Route path="health-metrics" element={<HealthMetrics />} />
        <Route path="summary-trend" element={<SummaryTrend />} />
        <Route path="signal-info" element={<SignalInfo />} />
        <Route path="contact" element={<Contact />} />
        <Route path="about" element={<About />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}