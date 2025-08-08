"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import AppBar from "@mui/material/AppBar"
import Toolbar from "@mui/material/Toolbar"
import Typography from "@mui/material/Typography"
import IconButton from "@mui/material/IconButton"
import MenuIcon from "@mui/icons-material/Menu"
import HelpIcon from "@mui/icons-material/Help"
import ChatIcon from '@mui/icons-material/Chat'
import AppsIcon from "@mui/icons-material/Apps"
import Menu from "@mui/material/Menu"
import MenuItem from "@mui/material/MenuItem"
import Popover from "@mui/material/Popover"
import Box from "@mui/material/Box"
import Paper from "@mui/material/Paper"
import Link from "@mui/material/Link"
import ContactForm, { ContactFormData } from "../ContactForm"
import HeaderBanner from "../../assets/images/icon_headerbanner.png"
import { consoledebug } from "../../utils/debug"
// Import app icons
import atspmIcon from "../../assets/images/icon_atspm.png"
import citrixIcon from "../../assets/images/icon_citrix.png"
import gdot511Icon from "../../assets/images/icon_gdot511.png"
import maxviewIcon from "../../assets/images/icon_maxview.png"
import navigatorIcon from "../../assets/images/icon_navigator.jpg"
import ritisIcon from "../../assets/images/icon_ritis.jpg"
import teamsIcon from "../../assets/images/icon_teams.png"
import sigOpsLogo from "../../assets/images/SigOps_Metrics_Logo.png"

// App links
const APP_LINKS = [
  { icon: atspmIcon, url: "https://traffic.dot.ga.gov/atspm", name: "ATSPM" },
  { icon: citrixIcon, url: "https://gdotcitrix.dot.ga.gov/vpn/index.html", name: "GDOT Citrix" },
  { icon: gdot511Icon, url: "http://www.511ga.org/", name: "Georgia 511" },
  { icon: maxviewIcon, url: "http://gdot-tmc-maxv/maxview/", name: "MaxView" },
  { icon: navigatorIcon, url: "https://navigator-atms.dot.ga.gov/", name: "Navigator" },
  { icon: ritisIcon, url: "https://ritis.org/", name: "RITIS" },
  { icon: teamsIcon, url: "https://designitapps.com/GDOT/", name: "TEAMS" }
]

interface HeaderProps {
  // sideNavOpen: boolean
  onSideNavToggle: () => void
  // onFilterToggle: () => void
}

interface AppConfig {
  hasBtnContactUs: boolean;
  hasBtnGdotApplications: boolean;
}

export default function Header({ onSideNavToggle }: HeaderProps) {
  const navigate = useNavigate()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [contactAnchorEl, setContactAnchorEl] = useState<null | HTMLElement>(null)
  const [helpAnchorEl, setHelpAnchorEl] = useState<null | HTMLElement>(null)
  const [appsAnchorEl, setAppsAnchorEl] = useState<null | HTMLElement>(null)
  const [appConfig, setAppConfig] = useState<AppConfig>({
    hasBtnContactUs: true,
    hasBtnGdotApplications: true
  })
  const [helpData, setHelpData] = useState<string>("")
  const [patchData, setPatchData] = useState<string[]>([])
  const [showPatchData, setShowPatchData] = useState<boolean>(false)

  // Mock config and help data service
  useEffect(() => {
    // In a real app, this would be fetched from a config endpoint
    setAppConfig({
      hasBtnContactUs: true,
      hasBtnGdotApplications: true
    })
    
    // Mock help data
    setHelpData("The home page of the SigOps Metrics website. This shows a high level overview of performance, volume, equipment, and TEAMS metrics at a filtered system and signal level.")
    setPatchData(["v1.1", "Initial release", "Bug fixes"])
  }, [])

  // const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
  //   setAnchorEl(event.currentTarget)
  // }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleContactOpen = (event: React.MouseEvent<HTMLElement>) => {
    setContactAnchorEl(event.currentTarget)
  }

  const handleContactClose = () => {
    setContactAnchorEl(null)
  }

  const handleContactSubmit = (formData: ContactFormData) => {
    consoledebug('Contact form submitted:', formData)
    // Here you would typically send the data to your backend
    handleContactClose()
  }

  const handleHelpClick = () => {
    navigate("/help")
    handleMenuClose()
  }

  const handleContactClick = () => {
    navigate("/contact")
    handleMenuClose()
  }

  const handleHelpOpen = (event: React.MouseEvent<HTMLElement>) => {
    setHelpAnchorEl(event.currentTarget)
  }

  const handleHelpClose = () => {
    setHelpAnchorEl(null)
  }

  const handleAppsOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAppsAnchorEl(event.currentTarget)
  }

  const handleAppsClose = () => {
    setAppsAnchorEl(null)
  }

  const togglePatchNotes = () => {
    setShowPatchData(!showPatchData)
  }

  const contactOpen = Boolean(contactAnchorEl)
  const contactId = contactOpen ? 'contact-popover' : undefined
  
  const helpOpen = Boolean(helpAnchorEl)
  const helpId = helpOpen ? 'help-popover' : undefined

  const appsOpen = Boolean(appsAnchorEl)
  const appsId = appsOpen ? 'apps-popover' : undefined

  return (
    <AppBar position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: '#0075dd',
          backgroundImage: `url(${HeaderBanner})`,
          backgroundSize: 'fixed',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          height: '64px', // or adjust to match banner
          display: 'flex',
          justifyContent: 'center',// adjust based on image height
        }}
      >
      <Toolbar>
        <IconButton 
          color="inherit" 
          aria-label="toggle sidebar expansion" 
          onClick={onSideNavToggle} 
          edge="start" 
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
          <img src={sigOpsLogo} alt="SigOps Metrics Logo" height="50px" />
        </Box>
        {appConfig.hasBtnContactUs && (
          <IconButton color="inherit" onClick={handleContactOpen}>
            <ChatIcon />
          </IconButton>
        )}
        <IconButton color="inherit" onClick={handleHelpOpen}>
          <HelpIcon />
        </IconButton>
        {appConfig.hasBtnGdotApplications && (
          <IconButton color="inherit" onClick={handleAppsOpen}>
            <AppsIcon />
          </IconButton>
        )}

        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
          <MenuItem onClick={handleHelpClick}>Help</MenuItem>
          <MenuItem onClick={handleContactClick}>Contact</MenuItem>
        </Menu>

        <Popover
          id={contactId}
          open={contactOpen}
          anchorEl={contactAnchorEl}
          onClose={handleContactClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          <ContactForm 
            onSubmit={handleContactSubmit}
            onCancel={handleContactClose}
          />
        </Popover>

        <Popover
          id={helpId}
          open={helpOpen}
          anchorEl={helpAnchorEl}
          onClose={handleHelpClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          <Paper sx={{ width: 400, maxWidth: '100%', bgcolor: '#FFFFFF', borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ bgcolor: '#1976d2', color: 'white', p: 1, textAlign: 'center' }}>
              About
            </Typography>
            <Box sx={{ p: 1 }}>
              <Typography paragraph>
                {helpData}
              </Typography>
              <Typography paragraph>
                The numbers shown for each metric are an average of all the signals based
                on the current filter.
              </Typography>
              <Typography 
                sx={{ mt: 2, cursor: 'pointer' }} 
                onClick={(e) => {
                  togglePatchNotes();
                  e.stopPropagation();
                }}
              >
                App Version: {patchData[0]}
              </Typography>
              {showPatchData && (
                <Box component="ul" sx={{ listStyleType: 'none', pl: 1 }}>
                  {patchData.map((note, index) => (
                    <Box component="li" key={index} sx={{ my: 0.5 }}>
                      {note}
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          </Paper>
        </Popover>

        <Popover
          id={appsId}
          open={appsOpen}
          anchorEl={appsAnchorEl}
          onClose={handleAppsClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          <Paper sx={{ maxWidth: '100%' }}>
            <Typography variant="h6" gutterBottom sx={{ bgcolor: '#1976d2', color: 'white', p: 1, textAlign: 'center' }}>
              GDOT Applications
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, p: 1 }}>
              {APP_LINKS.map((app, index) => (
                <Box key={index} sx={{ textAlign: 'center' }}>
                  <Link 
                    href={app.url} 
                    target="_blank" 
                    rel="noopener"
                    underline="none"
                    sx={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center',
                      '&:hover': { opacity: 0.8 } 
                    }}
                  >
                    <Box 
                      component="img" 
                      src={app.icon} 
                      alt={app.name}
                      sx={{ 
                        width: 100, 
                        mb: 1, 
                        borderRadius: '8px'
                      }}
                    />
                  </Link>
                </Box>
              ))}
            </Box>
          </Paper>
        </Popover>
      </Toolbar>
    </AppBar>
  )
}
