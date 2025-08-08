"use client"

import { useEffect } from "react"
import { useAppDispatch, useAppSelector } from "../../store/hooks"
import Drawer from "@mui/material/Drawer"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import Toolbar from "@mui/material/Toolbar"
import Radio from "@mui/material/Radio"
import RadioGroup from "@mui/material/RadioGroup"
import FormControlLabel from "@mui/material/FormControlLabel"
import FormControl from "@mui/material/FormControl"
import FormLabel from "@mui/material/FormLabel"
import TextField from "@mui/material/TextField"
import Select, { SelectChangeEvent } from "@mui/material/Select"
import MenuItem from "@mui/material/MenuItem"
import InputLabel from "@mui/material/InputLabel"
import Divider from "@mui/material/Divider"
import Checkbox from "@mui/material/Checkbox"
import Button from "@mui/material/Button"
import Stack from "@mui/material/Stack"
import CircularProgress from "@mui/material/CircularProgress"
import Alert from "@mui/material/Alert"

// Redux actions and thunks
import {
  setDateOption,
  setStartDate,
  setEndDate,
  setStartTime,
  setEndTime,
  setAllDayChecked,
  setAggregationOption,
  setSignalId,
  setSignalGroup,
  setDistrict,
  setAgency,
  setCounty,
  setCity,
  setCorridor,
  setSubcorridor,
  setPriority,
  setClassification,
  setErrorState,
  setIsFiltering,
  resetFilters,
  saveAsDefaults,
  loadSavedFilters,
  // Async thunks
  fetchZoneGroups,
  fetchZones,
  fetchZonesByZoneGroup,
  fetchAgencies,
  fetchCounties,
  fetchCities,
  fetchCorridors,
  fetchCorridorsByFilter,
  fetchSubcorridors,
  fetchSubcorridorsByCorridor,
  fetchPriorities,
  fetchClassifications,
  selectFilterParams,
  setFiltersApplied
} from "../../store/slices/filterSlice"
import { store } from "../../store/store"
import { consoledebug } from "../../utils/debug"

// Date range and aggregation options
const dateRangeOptions = [
  { value: "0", label: "Prior Day" },
  { value: "1", label: "Prior Week" },
  { value: "2", label: "Prior Month" },
  { value: "3", label: "Prior Quarter" },
  { value: "4", label: "Prior Year" },
  { value: "5", label: "Custom" },
].sort((a, b) => parseInt(a.value) - parseInt(b.value));

const aggregationOptions = [
  { value: "0", label: "15 mins" },
  { value: "1", label: "1 hour" },
  { value: "2", label: "Daily" },
  { value: "3", label: "Weekly" },
  { value: "4", label: "Monthly" },
  { value: "5", label: "Quarterly" },
].sort((a, b) => parseInt(a.value) - parseInt(b.value));

// Define which aggregation options are enabled for each date range
const getEnabledAggregationOptions = (dateRangeValue: string): string[] => {
  switch (dateRangeValue) {
    case "0": // Prior Day
      return ["0", "1"]; // 15 mins, 1 hour
    case "1": // Prior Week
      return ["1", "2"]; // 1 hour, Daily
    case "2": // Prior Month
      return ["2", "3"]; // Daily, Weekly
    case "3": // Prior Quarter
      return ["3", "4"]; // Weekly, Monthly
    case "4": // Prior Year
      return ["4", "5"]; // Monthly, Quarterly
    case "5": // Custom
      return ["0", "1", "2", "3", "4", "5"]; // All options
    default:
      return ["0", "1", "2", "3", "4", "5"]; // All options by default
  }
};

// Define default aggregation option for each date range
const getDefaultAggregationOption = (dateRangeValue: string): string => {
  switch (dateRangeValue) {
    case "0": // Prior Day
      return "0"; // 15 mins
    case "1": // Prior Week
      return "1"; // 1 hour
    case "2": // Prior Month
      return "2"; // Daily
    case "3": // Prior Quarter
      return "3"; // Weekly
    case "4": // Prior Year
      return "4"; // Monthly
    case "5": // Custom
      return "2"; // Daily (or keep current selection if valid)
    default:
      return "2"; // Daily by default
  }
};

interface FilterSidebarProps {
  open: boolean
  width: number
  onClose: () => void
  // Optional callback when filters are applied
  onApplyFilter?: (filters: any) => void
}

export default function FilterSidebar({ open, width, onClose, onApplyFilter }: FilterSidebarProps) {
  const dispatch = useAppDispatch();
  
  // Select filter state from Redux
  const {
    selectedDateOption,
    startDate,
    endDate,
    startTime,
    endTime,
    allDayChecked,
    selectedAggregationOption,
    signalId,
    selectedSignalGroup,
    selectedDistrict,
    selectedAgency,
    selectedCounty,
    selectedCity,
    selectedCorridor,
    selectedSubcorridor,
    selectedPriority,
    selectedClassification,
    // Dropdown options from API
    zoneGroups,
    zones,
    agencies,
    counties,
    cities,
    corridors,
    subcorridors,
    priorities,
    classifications,
    // Loading states
    loading,
    // Error state
    errorState
  } = useAppSelector(state => state.filter);

  // Load all filter data on component mount
  useEffect(() => {
    consoledebug("Initial component mount - loading all data");
    dispatch(loadSavedFilters());
    dispatch(fetchZoneGroups());
    dispatch(fetchZones());
    dispatch(fetchAgencies());
    dispatch(fetchCounties());
    dispatch(fetchCities());
    dispatch(fetchCorridors());
    dispatch(fetchPriorities());
    dispatch(fetchClassifications());
  }, [dispatch]);

  // === Event Handlers ===
  const handleDateRangeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = (event.target as HTMLInputElement).value;
    consoledebug(`Date range changed to: ${value}`);
    
    // Dispatch the setDateOption action which handles setting up appropriate date values
    // Note: setDateOption reducer automatically sets isFiltering to true
    dispatch(setDateOption(value));
    
    // Set appropriate default aggregation option based on date range
    const enabledOptions = getEnabledAggregationOptions(value);
    const defaultAggregation = getDefaultAggregationOption(value);
    
    // For Custom date range, keep current selection if it's valid, otherwise use default
    if (value === "5") {
      if (!enabledOptions.includes(selectedAggregationOption)) {
        dispatch(setAggregationOption(defaultAggregation));
        consoledebug(`Set aggregation to default for Custom: ${defaultAggregation}`);
      }
    } else {
      // For non-custom date ranges, always set to the specified default
      dispatch(setAggregationOption(defaultAggregation));
      consoledebug(`Set aggregation to default for date range ${value}: ${defaultAggregation}`);
    }
    
    consoledebug('Date range and aggregation options updated (no API calls made)');
  }

  const handleAggregationChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = (event.target as HTMLInputElement).value;
    consoledebug(`Aggregation changed to: ${value}`);
    
    // Dispatch the action to update aggregation option
    // Note: setAggregationOption reducer automatically sets isFiltering to true
    dispatch(setAggregationOption(value));
    
    consoledebug('Aggregation option updated (no API calls made)');
  }

  const handleSignalIdChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setSignalId(event.target.value));
  }

  const handleAttributeChange = (actionCreator: any) => (event: SelectChangeEvent) => {
    const value = event.target.value as string;
    
    // Dispatch the action (reducers automatically set isFiltering to true)
    dispatch(actionCreator(value));
    
    // Log selection changes for debugging
    consoledebug(`Changed ${actionCreator.name} to: ${value} (no API calls made)`);
  }

  consoledebug("zones", zones);

  const handleAllDayChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const checked = event.target.checked;
    consoledebug(`All day checkbox ${checked ? 'checked' : 'unchecked'} (no API calls made)`);
    
    // Update the all day checked state (reducer automatically sets isFiltering to true)
    dispatch(setAllDayChecked(checked));
  }

  const handleTimeChange = (actionCreator: any) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    const isStartTime = actionCreator === setStartTime;
    consoledebug(`${isStartTime ? 'Start' : 'End'} time changed to: ${value} (no API calls made)`);
    
    // Update the time value (reducer automatically sets isFiltering to true)
    dispatch(actionCreator(value));
  }

  const handleStartDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value || null;
    consoledebug(`Start date changed to: ${value} (no API calls made)`);
    
    // Update the start date (reducer automatically sets isFiltering to true)
    dispatch(setStartDate(value));
  }

  const handleEndDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value || null;
    consoledebug(`End date changed to: ${value} (no API calls made)`);
    
    // Update the end date (reducer automatically sets isFiltering to true)
    dispatch(setEndDate(value));
  }

  const handleClear = () => {
    dispatch(resetFilters());
    // Reload all dropdown data
    dispatch(fetchZoneGroups());
    dispatch(fetchZones());
    dispatch(fetchAgencies());
    dispatch(fetchCounties());
    dispatch(fetchCities());
    dispatch(fetchCorridors());
    dispatch(fetchSubcorridors());
    dispatch(fetchPriorities());
    dispatch(fetchClassifications());
  }

  const handleApply = async () => {
    consoledebug('Applying filters');
    
    // Get current filter state using the selector
    const currentFilters = selectFilterParams(store.getState());
    
    // Make all necessary API calls based on current selections
    if (currentFilters.zone_Group) {
        await dispatch(fetchZonesByZoneGroup(currentFilters.zone_Group));
    }
    
    if (currentFilters.corridor) {
        await dispatch(fetchSubcorridorsByCorridor(currentFilters.corridor));
    }
    
    // Update corridors based on all selected filters
    await dispatch(fetchCorridorsByFilter({
        zoneGroup: currentFilters.zone_Group,
        zone: currentFilters.zone || undefined,
        agency: currentFilters.agency || undefined,
        county: currentFilters.county || undefined,
        city: currentFilters.city || undefined
    }));
    
    // Reset error state to normal when applying filters
    dispatch(setErrorState(1));
    
    // Set isFiltering to false to indicate filter is applied
    dispatch(setIsFiltering(false));
    
    // Set filtersApplied to true to trigger data refresh in dashboard
    dispatch(setFiltersApplied(true));
    
    // Call parent component callback if provided
    if (onApplyFilter) {
        onApplyFilter(currentFilters);
    }
    
    onClose();
  }

  const handleSaveDefaults = async () => {
    dispatch(saveAsDefaults());
    await handleApply();
  }

  // Check if any dropdown is loading
  const isLoading = Object.values(loading).some(status => status);

  return (
    <Drawer
      variant="persistent"
      anchor="right"
      open={open}
      sx={{
        width: open ? width : 0,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: width,
          boxSizing: "border-box",
          transition: (theme) => theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          overflowX: 'hidden',
        },
      }}
    >
      <Toolbar />
      <Box sx={{ p: 2, overflowY: "auto", height: 'calc(100% - 64px)' }}>
        {/* Header with loading indicator */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
          <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 500 }}>
            Filters {isLoading && <CircularProgress size={16} sx={{ ml: 1 }} />}
          </Typography>
        </Box>
        <Divider sx={{ mb: 2 }} />

        {/* Error State Message */}
        {errorState === 2 && (
          <Alert severity="warning" sx={{ mb: 2, fontSize: '0.75rem' }}>
            The current metric is not fully compatible with the selected filter. Please select another metric or another filter.
          </Alert>
        )}

        {/* === Date Range === */}
        <FormControl component="fieldset" sx={{ mb: 2, width: "100%" }}>
          <FormLabel component="legend" sx={{ fontSize: '0.8rem', mb: 0.5, color: 'text.primary' }}>Date Range</FormLabel>
          <RadioGroup 
            value={selectedDateOption} 
            onChange={handleDateRangeChange}
            sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}
          >
            {dateRangeOptions.map((option) => (
              <FormControlLabel
                key={option.value}
                value={option.value}
                control={<Radio size="small" />}
                label={option.label}
                sx={{ 
                  m: 0, 
                  '& .MuiFormControlLabel-label': { 
                    fontSize: '0.75rem',
                    color: 'text.secondary' 
                  }
                }}
              />
            ))}
          </RadioGroup>
        </FormControl>
        
        {/* Custom Date/Time Fields (Conditional) */}
        {selectedDateOption === "5" && (
          <Box sx={{ pl: 2, mb: 2 }}>
            <TextField
              label="Start Date"
              type="date"
              value={startDate || ''}
              onChange={handleStartDateChange}
              InputLabelProps={{ shrink: true, sx: { fontSize: '0.75rem' } }}
              size="small"
              fullWidth
              sx={{ mb: 1, '& .MuiInputBase-input': { fontSize: '0.75rem' } }}
            />
            <TextField
              label="End Date"
              type="date"
              value={endDate || ''}
              onChange={handleEndDateChange}
              InputLabelProps={{ shrink: true, sx: { fontSize: '0.75rem' } }}
              size="small"
              fullWidth
              sx={{ mb: 2, '& .MuiInputBase-input': { fontSize: '0.75rem' } }}
            />

            <Divider sx={{ my: 1 }} />
            <FormLabel component="legend" sx={{ mb: 1, fontSize: '0.75rem', color: 'text.primary' }}>Time Range</FormLabel>
            <FormControlLabel
              control={<Checkbox checked={allDayChecked} onChange={handleAllDayChange} size="small" />}
              label="All day"
              sx={{ mb: 1, '& .MuiFormControlLabel-label': { fontSize: '0.75rem', color: 'text.secondary' } }}
            />
            <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
              <TextField
                label="Start Time"
                type="time"
                value={startTime}
                onChange={handleTimeChange(setStartTime)}
                InputLabelProps={{ shrink: true, sx: { fontSize: '0.75rem' } }}
                inputProps={{ step: 300 }} // 5 min step
                size="small"
                sx={{ flexGrow: 1, '& .MuiInputBase-input': { fontSize: '0.75rem' } }}
                disabled={allDayChecked}
              />
              <TextField
                label="End Time"
                type="time"
                value={endTime}
                onChange={handleTimeChange(setEndTime)}
                InputLabelProps={{ shrink: true, sx: { fontSize: '0.75rem' } }}
                inputProps={{ step: 300 }} // 5 min step
                size="small"
                sx={{ flexGrow: 1, '& .MuiInputBase-input': { fontSize: '0.75rem' } }}
                disabled={allDayChecked}
              />
            </Stack>
            <Divider sx={{ mb: 2 }} />
          </Box>
        )}

        {/* === Data Aggregation === */}
        <FormControl component="fieldset" sx={{ mb: 2, width: "100%" }}>
          <FormLabel component="legend" sx={{ fontSize: '0.8rem', mb: 0.5, color: 'text.primary' }}>Data Aggregation</FormLabel>
          <RadioGroup
            value={selectedAggregationOption}
            onChange={handleAggregationChange}
            sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}
          >
            {aggregationOptions.map((option) => {
              const enabledOptions = getEnabledAggregationOptions(selectedDateOption);
              const isDisabled = !enabledOptions.includes(option.value);
              
              return (
                <FormControlLabel
                  key={option.value}
                  value={option.value}
                  control={<Radio size="small" />}
                  label={option.label}
                  // Disable options not included in the enabled list for current date range
                  disabled={isDisabled}
                  sx={{ 
                    m: 0, 
                    '& .MuiFormControlLabel-label': { 
                      fontSize: '0.75rem',
                      color: isDisabled ? 'text.disabled' : 'text.secondary'
                    }
                  }}
                />
              );
            })}
          </RadioGroup>
        </FormControl>
        <Divider sx={{ mb: 2 }} />

        {/* === Signal ID === */}
        <FormControl sx={{ mb: 2, width: "100%" }}>
          <FormLabel component="legend" sx={{ mb: 0.5, fontSize: '0.8rem', color: 'text.primary' }}>
            Signal ID
          </FormLabel>
          <TextField
            size="small"
            placeholder="Enter Id"
            type="number"
            value={signalId}
            onChange={handleSignalIdChange}
            fullWidth
            sx={{ '& .MuiInputBase-input': { fontSize: '0.75rem' } }}
          />
        </FormControl>
        <Divider sx={{ mb: 2 }} />

        {/* === Signal Attributes (Conditional) === */}
        {!signalId && (
          <Box>
            <FormLabel component="legend" sx={{ mb: 1, fontSize: '0.8rem', color: 'text.primary' }}>Signal Attributes</FormLabel>
            
            {/* Region */}
            <FormControl fullWidth size="small" sx={{ mb: 1.5 }}>
              <InputLabel sx={{ fontSize: '0.75rem' }}>Select Region</InputLabel>
              <Select
                value={selectedSignalGroup}
                label="Select Region"
                onChange={handleAttributeChange(setSignalGroup)}
                displayEmpty
                renderValue={(selected) => selected ? String(selected) : ''}
                disabled={loading.zoneGroups}
                sx={{ '& .MuiSelect-select': { fontSize: '0.75rem' } }}
              >
                {zoneGroups.map((group) => (
                  <MenuItem key={group} value={group} sx={{ fontSize: '0.75rem' }}>{group}</MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* District */}
            <FormControl fullWidth size="small" sx={{ mb: 1.5 }}>
              <InputLabel sx={{ fontSize: '0.75rem' }}>Select District</InputLabel>
              <Select
                value={selectedDistrict}
                label="Select District"
                onChange={handleAttributeChange(setDistrict)}
                displayEmpty
                renderValue={(selected) => selected ? String(selected) : ''}
                disabled={loading.zones}
                sx={{ '& .MuiSelect-select': { fontSize: '0.75rem' } }}
              >
                <MenuItem value="" sx={{ fontSize: '0.75rem' }}><em>None</em></MenuItem>
                {loading.zones ? (
                  <MenuItem disabled sx={{ fontSize: '0.75rem' }}>Loading districts...</MenuItem>
                ) : (
                  // Sort zones alphabetically
                  [...zones].sort().map((district) => (
                    <MenuItem key={district} value={district} sx={{ fontSize: '0.75rem' }}>{district}</MenuItem>
                  ))
                )}
              </Select>
            </FormControl>

            {/* Managing Agency */}
            <FormControl fullWidth size="small" sx={{ mb: 1.5 }}>
              <InputLabel sx={{ fontSize: '0.75rem' }}>Select Managing Agency</InputLabel>
              <Select
                value={selectedAgency}
                label="Select Managing Agency"
                onChange={handleAttributeChange(setAgency)}
                displayEmpty
                renderValue={(selected) => selected ? String(selected) : ''}
                disabled={loading.agencies}
                sx={{ '& .MuiSelect-select': { fontSize: '0.75rem' } }}
              >
                <MenuItem value="" sx={{ fontSize: '0.75rem' }}><em>None</em></MenuItem>
                {agencies.map((agency) => (
                  <MenuItem key={agency} value={agency} sx={{ fontSize: '0.75rem' }}>{agency}</MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* County */}
            <FormControl fullWidth size="small" sx={{ mb: 1.5 }}>
              <InputLabel sx={{ fontSize: '0.75rem' }}>Select County</InputLabel>
              <Select
                value={selectedCounty}
                label="Select County"
                onChange={handleAttributeChange(setCounty)}
                displayEmpty
                renderValue={(selected) => selected ? String(selected) : ''}
                disabled={loading.counties}
                sx={{ '& .MuiSelect-select': { fontSize: '0.75rem' } }}
              >
                <MenuItem value="" sx={{ fontSize: '0.75rem' }}><em>None</em></MenuItem>
                {counties.map((county) => (
                  <MenuItem key={county} value={county} sx={{ fontSize: '0.75rem' }}>{county}</MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* City */}
            <FormControl fullWidth size="small" sx={{ mb: 1.5 }}>
              <InputLabel sx={{ fontSize: '0.75rem' }}>Select City</InputLabel>
              <Select
                value={selectedCity}
                label="Select City"
                onChange={handleAttributeChange(setCity)}
                displayEmpty
                renderValue={(selected) => selected ? String(selected) : ''}
                disabled={loading.cities}
                sx={{ '& .MuiSelect-select': { fontSize: '0.75rem' } }}
              >
                <MenuItem value="" sx={{ fontSize: '0.75rem' }}><em>None</em></MenuItem>
                {cities.map((city) => (
                  <MenuItem key={city} value={city} sx={{ fontSize: '0.75rem' }}>{city}</MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Corridor */}
            <FormControl fullWidth size="small" sx={{ mb: 1.5 }}>
              <InputLabel sx={{ fontSize: '0.75rem' }}>Select Corridor</InputLabel>
              <Select
                value={selectedCorridor}
                label="Select Corridor"
                onChange={handleAttributeChange(setCorridor)}
                displayEmpty
                renderValue={(selected) => selected ? String(selected) : ''}
                disabled={loading.corridors}
                sx={{ '& .MuiSelect-select': { fontSize: '0.75rem' } }}
              >
                <MenuItem value="" sx={{ fontSize: '0.75rem' }}><em>None</em></MenuItem>
                {corridors.map((corridor) => (
                  <MenuItem key={corridor} value={corridor} sx={{ fontSize: '0.75rem' }}>{corridor}</MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Subcorridor (Conditional based on selectedCorridor) */}
            {selectedCorridor && (
              <FormControl fullWidth size="small" sx={{ mb: 1.5 }}>
                <InputLabel sx={{ fontSize: '0.75rem' }}>Select Subcorridor</InputLabel>
                <Select
                  value={selectedSubcorridor}
                  label="Select Subcorridor"
                  onChange={handleAttributeChange(setSubcorridor)}
                  displayEmpty
                  renderValue={(selected) => selected ? String(selected) : ''}
                  disabled={loading.subcorridors}
                  sx={{ '& .MuiSelect-select': { fontSize: '0.75rem' } }}
                >
                  <MenuItem value="" sx={{ fontSize: '0.75rem' }}><em>None</em></MenuItem>
                  {subcorridors.map((sub) => (
                    <MenuItem key={sub} value={sub} sx={{ fontSize: '0.75rem' }}>{sub}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            {/* Priority */}
            <FormControl fullWidth size="small" sx={{ mb: 1.5 }}>
              <InputLabel sx={{ fontSize: '0.75rem' }}>Select Priority</InputLabel>
              <Select
                value={selectedPriority}
                label="Select Priority"
                onChange={handleAttributeChange(setPriority)}
                displayEmpty
                renderValue={(selected) => selected ? String(selected) : ''}
                disabled={loading.priorities}
                sx={{ '& .MuiSelect-select': { fontSize: '0.75rem' } }}
              >
                <MenuItem value="" sx={{ fontSize: '0.75rem' }}><em>None</em></MenuItem>
                {priorities.map((priority) => (
                  <MenuItem key={priority} value={priority} sx={{ fontSize: '0.75rem' }}>{priority}</MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Classification */}
            <FormControl fullWidth size="small" sx={{ mb: 1.5 }}>
              <InputLabel sx={{ fontSize: '0.75rem' }}>Select Classification</InputLabel>
              <Select
                value={selectedClassification}
                label="Select Classification"
                onChange={handleAttributeChange(setClassification)}
                displayEmpty
                renderValue={(selected) => selected ? String(selected) : ''}
                disabled={loading.classifications}
                sx={{ '& .MuiSelect-select': { fontSize: '0.75rem' } }}
              >
                <MenuItem value="" sx={{ fontSize: '0.75rem' }}><em>None</em></MenuItem>
                {classifications.map((cls) => (
                  <MenuItem key={cls} value={cls} sx={{ fontSize: '0.75rem' }}>{cls}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        )}

        <Divider sx={{ my: 2 }} />

        {/* Action Buttons */}
        <Stack direction="row" spacing={1} justifyContent="space-evenly">
          <Button 
            variant="outlined" 
            onClick={handleSaveDefaults} 
            size="small"
            sx={{ fontSize: '0.75rem', py: 0.5 }}
          >
            Set As Defaults
          </Button>
          <Button 
            variant="outlined" 
            onClick={handleClear} 
            size="small"
            sx={{ fontSize: '0.75rem', py: 0.5 }}
          >
            Clear
          </Button>
          <Button 
            variant="contained" 
            onClick={handleApply} 
            size="small"
            sx={{ fontSize: '0.75rem', py: 0.5 }}
          >
            Apply
          </Button>
        </Stack>
      </Box>
    </Drawer>
  )
}
