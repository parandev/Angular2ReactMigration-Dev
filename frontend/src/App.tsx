import { BrowserRouter as Router } from "react-router-dom"
import { consoledebug } from "./utils/debug"
import AppRoutes from "./routes/AppRoutes"
import { ThemeProvider } from "./contexts/ThemeContext"

consoledebug("testing console debugging")

function App() {
  return (
    // <ErrorBoundary>
      <ThemeProvider>
        <Router>
          <AppRoutes />
        </Router>
      </ThemeProvider>
    // </ErrorBoundary>
  )
}

export default App
