"use client"

import type React from "react"

import { useLocation, useNavigate } from "react-router-dom"
import Drawer from "@mui/material/Drawer"
import List from "@mui/material/List"
import ListItem from "@mui/material/ListItem"
import ListItemButton from "@mui/material/ListItemButton"
import ListItemIcon from "@mui/material/ListItemIcon"
import ListItemText from "@mui/material/ListItemText"
import Toolbar from "@mui/material/Toolbar"
import Box from "@mui/material/Box"
import DashboardIcon from "@mui/icons-material/Dashboard"
import BuildIcon from "@mui/icons-material/Build"
import AssessmentIcon from "@mui/icons-material/Assessment"
import TrendingUpIcon from "@mui/icons-material/TrendingUp"
import InfoIcon from "@mui/icons-material/Info"
import AlarmIcon from '@mui/icons-material/Alarm';
import ToysIcon from '@mui/icons-material/Toys';
import SettingsInputAntennaIcon from "@mui/icons-material/SettingsInputAntenna"

import HealingIcon from '@mui/icons-material/Healing'
import PoweredByGDOT from '../../assets/images/icon_PoweredByGDOT.png'
import GDOTMini from '../../assets/images/icon_PoweredByGDOT-mini.png'

interface SideNavProps {
  open?: boolean
  expanded?: boolean
  width: number
  onMouseEnter?: () => void
  onMouseLeave?: () => void
}

interface NavItem {
  text: string
  icon: React.ReactNode
  path: string
}

export default function SideNav({ open = true, expanded = true, width, onMouseEnter, onMouseLeave }: SideNavProps) {
  const location = useLocation()
  const navigate = useNavigate()

  // Use either open or expanded prop for backward compatibility
  const isOpen = open
  const isExpanded = expanded

  const navItems: NavItem[] = [
    { text: "Dashboard", icon: <DashboardIcon />, path: "/" },
    { text: "Operations", icon: <ToysIcon />, path: "/operations" },
    { text: "Maintenance", icon: <BuildIcon />, path: "/maintenance" },
    { text: "Watchdog", icon: <AlarmIcon />, path: "/watchdog" },
    // { text: "TEAMS Tasks", icon: <TaskIcon />, path: "/teams-tasks" },
    { text: "Health Metrics", icon: <HealingIcon />, path: "/health-metrics" },
    { text: "Summary Trend", icon: <TrendingUpIcon />, path: "/summary-trend" },
    { text: "Signal Info", icon: <SettingsInputAntennaIcon />, path: "/signal-info" },
    { text: "Reports", icon: <AssessmentIcon />, path: "/reports" },
    //{ text: "Help", icon: <HelpIcon />, path: "/help" },
    { text: "About", icon: <InfoIcon />, path: "/about" },
  ]

  return (
    <Drawer
      variant="permanent"
      open={isOpen}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      sx={{
        width: width,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: width,
          boxSizing: "border-box",
          overflowX: "hidden",
          backgroundColor: '#ffffff', // Light grey similar to GDOT original
          color: '#333333', 
          transition: 'width 0.3s ease-in-out',
        },
      }}
    >
      <Toolbar />
      <Box sx={{ overflow: 'hidden' }}>
        <List>
          {navItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton 
                selected={location.pathname === item.path} 
                onClick={() => navigate(item.path)}
                sx={{ 
                  justifyContent: isExpanded ? 'initial' : 'center',
                  minHeight: 48,
                  px: 2,
                  backgroundColor: location.pathname === item.path ? '#eeeeee' : 'transparent',
                  transition: 'all 0.3s ease-in-out',
                  '&.Mui-selected': {
                    backgroundColor: '#eeeeee',
                    fontWeight: 600,
                    color: '#000',
                  },
                  '&:hover': {
                    backgroundColor: '#f5f5f5',
                  }, 
                }}
              >
                <ListItemIcon sx={{ 
                  minWidth: isExpanded ? 56 : 56, // Keep consistent width
                  mr: isExpanded ? 3 : 0, // Smooth margin transition
                  justifyContent: 'center',
                  color: '#444',
                  transition: 'all 0.3s ease-in-out',
                }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  sx={{
                    opacity: isExpanded ? 1 : 0,
                    transition: 'opacity 0.3s ease-in-out',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
      <Box sx={{ 
        position: 'fixed', 
        bottom: 15, 
        display: 'flex',
        justifyContent: 'center',
        ml: isExpanded ? 2 : 0,
        width: isExpanded ? 'auto' : width
      }}>
        {isExpanded ? (
          <img src={PoweredByGDOT} width="150px" alt="Powered by GDOT" />
        ) : (
          <img src={GDOTMini} width="30px" alt="GDOT" />
        )}
      </Box>
    </Drawer>
  )
}