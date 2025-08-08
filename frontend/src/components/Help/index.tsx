import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import Paper from "@mui/material/Paper"
import Grid from "@mui/material/Grid"
import Accordion from "@mui/material/Accordion"
import AccordionSummary from "@mui/material/AccordionSummary"
import AccordionDetails from "@mui/material/AccordionDetails"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import List from "@mui/material/List"
import ListItem from "@mui/material/ListItem"
import ListItemText from "@mui/material/ListItemText"
import ListItemIcon from "@mui/material/ListItemIcon"
import HelpIcon from "@mui/icons-material/Help"
import BookIcon from "@mui/icons-material/Book"
import VideoLibraryIcon from "@mui/icons-material/VideoLibrary"
import SupportIcon from "@mui/icons-material/Support"

export default function Help() {
  // Sample FAQ data
  const faqs = [
    {
      id: 1,
      question: "How do I interpret the Arrivals on Green metric?",
      answer:
        "Arrivals on Green represents the percentage of vehicles that arrive at a signalized intersection during the green phase. Higher values indicate better progression and coordination between signals.",
    },
    {
      id: 2,
      question: "What does the Travel Time Index represent?",
      answer:
        "The Travel Time Index (TTI) is the ratio of the travel time during peak periods to the travel time during free-flow conditions. A TTI of 1.3 means that a trip takes 30% longer during peak periods than during free-flow conditions.",
    },
    {
      id: 3,
      question: "How can I export data from the dashboard?",
      answer:
        "You can export data by clicking the Print icon in the top-right corner of the dashboard. This will allow you to save the current view as a PDF or export the raw data as a CSV file.",
    },
    {
      id: 4,
      question: "How often is the data updated?",
      answer:
        "The data is updated in real-time for most metrics. Historical data is aggregated and processed daily. The timestamp at the bottom of each chart indicates when the data was last updated.",
    },
  ]

  // Sample resources
  const resources = [
    { id: 1, title: "User Manual", icon: <BookIcon /> },
    { id: 2, title: "Video Tutorials", icon: <VideoLibraryIcon /> },
    { id: 3, title: "Technical Documentation", icon: <BookIcon /> },
    { id: 4, title: "Support Center", icon: <SupportIcon /> },
  ]

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom>
        Help & Support
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Frequently Asked Questions
            </Typography>
            {faqs.map((faq) => (
              <Accordion key={faq.id}>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls={`faq-${faq.id}-content`}
                  id={`faq-${faq.id}-header`}
                >
                  <Typography>
                    <HelpIcon sx={{ fontSize: 18, mr: 1, verticalAlign: "text-bottom" }} /> {faq.question}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography>{faq.answer}</Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Resources
            </Typography>
            <List>
              {resources.map((resource) => (
                <ListItem key={resource.id} disablePadding>
                  <ListItem button>
                    <ListItemIcon>{resource.icon}</ListItemIcon>
                    <ListItemText primary={resource.title} />
                  </ListItem>
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}

