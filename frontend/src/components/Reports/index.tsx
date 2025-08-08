import { useEffect } from "react"
import { Box, Typography } from "@mui/material"
import Tabs from "@mui/material/Tabs"
import Tab from "@mui/material/Tab"
import { useState } from "react"
import useDocumentTitle from "../../hooks/useDocumentTitle"

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      style={{ height: "85vh" }}
      {...other}
    >
      {value === index && children}
    </div>
  )
}

export default function Reports() {
  const [value, setValue] = useState(0)
  const tabLabels = ["Daily", "Weekly", "Monthly"];
  // Dynamic document title based on selected tab
  useDocumentTitle({
    route: 'Reports',
    tab: tabLabels[value]
  });
  useEffect(() => {
    document.title = "SigOpsMetrics - Reports"
  }, [])

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue)
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h4" gutterBottom>
        Reports
      </Typography>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs 
          value={value} 
          onChange={handleChange} 
          variant="fullWidth"
          textColor="primary"
          indicatorColor="primary"
        >
          <Tab label="Daily" />
          <Tab label="Weekly" />
          <Tab label="Monthly" />
        </Tabs>
      </Box>
      
      <TabPanel value={value} index={0}>
        <iframe
          height="100%"
          width="100%"
          src="https://app.powerbi.com/view?r=eyJrIjoiYzdmZmZmMzgtMTUzZi00M2NhLWE4ODMtZTczNGM1Njk2YjFkIiwidCI6IjdlMjIwZDMwLTBiNTktNDdlNS04YTgxLWE0YTlkOWFmYmRjNCIsImMiOjN9"
          frameBorder="0"
          allowFullScreen={true}
        />
      </TabPanel>
      
      <TabPanel value={value} index={1}>
        <iframe
          height="100%"
          width="100%"
          src="https://app.powerbi.com/view?r=eyJrIjoiYWI3MWY2NGMtNDBlOS00YWVlLWE2MTYtNTVlMGI5ZTVhYzAzIiwidCI6IjdlMjIwZDMwLTBiNTktNDdlNS04YTgxLWE0YTlkOWFmYmRjNCIsImMiOjN9"
          frameBorder="0"
          allowFullScreen={true}
        />
      </TabPanel>
      
      <TabPanel value={value} index={2}>
        <iframe
          height="100%"
          width="100%"
          src="https://app.powerbi.com/view?r=eyJrIjoiOTFmNWUyYzQtMzM1YS00OGJhLThhZjAtNmM2NGZjZWYwZGFjIiwidCI6IjdlMjIwZDMwLTBiNTktNDdlNS04YTgxLWE0YTlkOWFmYmRjNCIsImMiOjN9"
          frameBorder="0"
          allowFullScreen={true}
        />
      </TabPanel>
    </Box>
  )
}

