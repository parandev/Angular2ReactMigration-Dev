import React from 'react';
import { Chip, Box, Typography } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  setSignalId,
  setDistrict,
  setAgency,
  setCounty,
  setCity,
  setCorridor,
  setSubcorridor,
  setPriority,
  setClassification,
  setFiltersApplied,
  setStartDate,
  setEndDate,
  setDateOption,
} from '../store/slices/filterSlice';

// This component would typically connect to your application state/redux
// to display the currently active filters

interface FilterChipListProps {
  filtersToHide?: string[];
  onChipClick?: () => void;
}

interface FilterChip {
  name: string;
  key: string;
  value: string | string[];
  removable: boolean;
}

const FilterChipList: React.FC<FilterChipListProps> = ({ filtersToHide = [], onChipClick }) => {
  const dispatch = useAppDispatch();
  
  const {
    selectedDateOption,
    startDate,
    endDate,
    startTime,
    endTime,
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
    allDayChecked,
  } = useAppSelector(state => state.filter);

  // Convert time format from 24h to 12h (matching Angular implementation)
  const convertTimeFormat = (timeString: string): string => {
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours, 10));
    date.setMinutes(parseInt(minutes, 10));
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Format date for display (matching Angular implementation with MM/dd/yyyy format)
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    });
  };

  // Get all active filters as display chips (matching Angular filter mapping logic)
  const getActiveFilters = (): FilterChip[] => {
    const filters: FilterChip[] = [];

    // Create filter map similar to Angular implementation
    const filterMap: Record<string, string | string[] | null> = {
      dateRange: selectedDateOption,
      customStart: startDate,
      customEnd: endDate,
      startTime: allDayChecked ? null : startTime,
      endTime: allDayChecked ? null : endTime,
      timePeriod: selectedAggregationOption,
      zone_Group: selectedSignalGroup,
      zone: selectedDistrict,
      agency: selectedAgency,
      county: selectedCounty,
      city: selectedCity,
      corridor: selectedCorridor,
      subcorridor: selectedSubcorridor,
      signalId: signalId,
      priority: selectedPriority,
      classification: selectedClassification,
    };

    Object.keys(filterMap).forEach((key) => {
      if (filtersToHide.includes(key)) {
        return;
      }

      const value = filterMap[key];
      if (value !== undefined && value !== null && value !== "" && 
          !(Array.isArray(value) && value.length === 0)) {
        let name: string;
        let displayValue: string | string[];
        
        // Set the labels for the chips and format any necessary data (matching Angular switch cases)
        switch (key) {
          case "dateRange":
            name = "Date Range";
            switch (value) {
              case "0":
                displayValue = "Prior Day";
                break;
              case "1":
                displayValue = "Prior Week";
                break;
              case "2":
                displayValue = "Prior Month";
                break;
              case "3":
                displayValue = "Prior Quarter";
                break;
              case "4":
                displayValue = "Prior Year";
                break;
              default:
                displayValue = "Custom";
                break;
            }
            break;
          case "customStart":
            name = "Start Date";
            displayValue = formatDate(value as string);
            break;
          case "customEnd":
            name = "End Date";
            displayValue = formatDate(value as string);
            break;

          case "startTime":
            name = "Start Time";
            displayValue = convertTimeFormat(value as string);
            break;
          case "endTime":
            name = "End Time";
            displayValue = convertTimeFormat(value as string);
            break;
          case "timePeriod":
            name = "Data Aggregation";
            switch (value) {
              case "0":
                displayValue = "15 mins";
                break;
              case "1":
                displayValue = "1 hour";
                break;
              case "2":
                displayValue = "Daily";
                break;
              case "3":
                displayValue = "Weekly";
                break;
              case "4":
                displayValue = "Monthly";
                break;
              case "5":
                displayValue = "Quarterly";
                break;
              default:
                displayValue = "15 mins";
                break;
            }
            break;
          case "zone_Group":
            name = "Region";
            displayValue = value as string;
            break;
          case "zone":
            name = "District";
            displayValue = value as string;
            break;
          case "agency":
            name = "Managing Agency";
            displayValue = value as string;
            break;
          case "county":
            name = "County";
            displayValue = value as string;
            break;
          case "city":
            name = "City";
            displayValue = value as string;
            break;
          case "corridor":
            name = "Corridor";
            displayValue = value as string;
            break;
          case "subcorridor":
            name = "Subcorridor";
            displayValue = value as string;
            break;
          case "signalId":
            name = "Signal ID";
            displayValue = value as string;
            break;
          case "priority":
            name = "Priority";
            displayValue = value as string;
            break;
          case "classification":
            name = "Classification";
            displayValue = value as string;
            break;
          default:
            name = "Custom";
            displayValue = value as string;
            break;
        }

        // Determine if chip is removable (matching Angular template logic)
        const removable = !(
          key === 'dateRange' ||
          key === 'timePeriod' ||
          key === 'zone_Group' ||
          key === 'customStart' ||
          key === 'customEnd' ||
          key === 'startTime' ||
          key === 'endTime'
        );

        filters.push({ name, key, value: displayValue, removable });
      }
    });

    return filters;
  };

  // Handle chip removal (matching Angular remove method logic)
  const handleRemove = (filterKey: string) => {
    switch (filterKey) {
      case 'zone':
        dispatch(setDistrict(''));
        break;
      case 'agency':
        dispatch(setAgency(''));
        break;
      case 'county':
        dispatch(setCounty(''));
        break;
      case 'city':
        dispatch(setCity(''));
        break;
      case 'corridor':
        dispatch(setCorridor(''));
        break;
      case 'subcorridor':
        dispatch(setSubcorridor(''));
        break;
      case 'signalId':
        dispatch(setSignalId(''));
        break;
      case 'priority':
        dispatch(setPriority(''));
        break;
      case 'classification':
        dispatch(setClassification(''));
        break;
      // Handle special case for dateRange (matching Angular logic)
      case 'dateRange':
        dispatch(setDateOption('2')); // Default to Prior Month
        dispatch(setStartDate(null));
        dispatch(setEndDate(null));
        break;
      default:
        break;
    }

    // Trigger filter refresh (matching Angular updateFilter call)
    dispatch(setFiltersApplied(true));
  };

  const activeFilters = getActiveFilters();

  // Don't render if no active filters (matching Angular *ngIf logic)
  if (activeFilters.length === 0) {
    return null;
  }

  return (
    <Box sx={{ 
      display: 'flex', 
      flexWrap: 'wrap', 
      gap: 1, 
      padding: 2, 
      alignItems: 'center',
      backgroundColor: 'background.paper',
      borderRadius: 1,
      boxShadow: 1,
      mb: 1
    }}>

      <Typography variant="body2" sx={{ marginRight: 1, fontWeight: 'bold' }}>
        Current Filters:
      </Typography> 
      {activeFilters.map((filter) => (
        <Chip
          key={filter.key}
          label={
            <Box component="span">
              <strong>{filter.name}: </strong>
              <span>{Array.isArray(filter.value) ? filter.value.join(', ') : filter.value}</span>
            </Box>
          }
          onClick={onChipClick}
          onDelete={filter.removable ? () => handleRemove(filter.key) : undefined}
          // color="primary"
          // variant="outlined"
          size="small"
          sx={{
            fontSize: '0.75rem',
            cursor: 'pointer',
            '& .MuiChip-label': {
              padding: '2px 8px',
            }
          }}
        />
      ))}
    </Box>
  );
};

export default FilterChipList; 