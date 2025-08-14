// DateRangePickerComponent.tsx
import { useState, useEffect } from 'react';
import { DateRange } from 'react-date-range';
import { format } from 'date-fns';
import { Box, Paper, useTheme, ClickAwayListener } from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import 'react-date-range/dist/styles.css'; // main style file
import 'react-date-range/dist/theme/default.css'; // theme css file

interface DateRangePickerProps {
  startDate: Date;
  endDate: Date;
  onChange: (startDate: Date, endDate: Date) => void;
}

export default function DateRangePickerComponent({ 
  startDate, 
  endDate, 
  onChange 
}: DateRangePickerProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  
  const [range, setRange] = useState([
    {
      startDate: startDate,
      endDate: endDate,
      key: 'selection'
    }
  ]);

  const [showCalendar, setShowCalendar] = useState(false);

  // Update internal range when props change
  useEffect(() => {
    setRange([{
      startDate: startDate,
      endDate: endDate,
      key: 'selection'
    }]);
  }, [startDate, endDate]);

  const handleRangeChange = (item: any) => {
    const newRange = [item.selection];
    setRange(newRange);
    
    // Call the parent's onChange callback
    if (onChange) {
      onChange(newRange[0].startDate, newRange[0].endDate);
    }
  };

  const handleClickAway = () => {
    setShowCalendar(false);
  };

  return (
    <ClickAwayListener onClickAway={handleClickAway}>
      <Box sx={{ position: 'relative', display: 'inline-block', minWidth: 250 }}>
        <Box
          onClick={() => setShowCalendar(!showCalendar)}
          sx={{
            border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.23)' : '#ccc'}`,
            padding: '8px 12px',
            borderRadius: '4px',
            cursor: 'pointer',
            width: '250px',
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#f5f5f5',
            color: isDark ? '#ffffff' : '#000000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            transition: 'all 0.2s',
            '&:hover': {
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#e0e0e0',
              borderColor: isDark ? 'rgba(255, 255, 255, 0.4)' : '#999',
            }
          }}
        >
          <span>
            {format(range[0].startDate, 'M/d/yyyy')} – {format(range[0].endDate, 'M/d/yyyy')}
          </span>
          <CalendarTodayIcon 
            sx={{ 
              fontSize: 18, 
              color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.54)' 
            }} 
          />
        </Box>

        {showCalendar && (
          <Paper
            sx={{
              position: 'absolute',
              zIndex: 1300,
              mt: 1,
              boxShadow: theme.shadows[8],
              backgroundColor: isDark ? '#2d2d2d' : '#ffffff',
              '& .rdrDateRangeWrapper': {
                backgroundColor: isDark ? '#2d2d2d' : '#ffffff',
              },
              '& .rdrCalendarWrapper': {
                backgroundColor: isDark ? '#2d2d2d' : '#ffffff',
                color: isDark ? '#ffffff' : '#000000',
              },
              '& .rdrMonth': {
                backgroundColor: isDark ? '#2d2d2d' : '#ffffff',
              },
              '& .rdrMonthAndYearWrapper': {
                backgroundColor: isDark ? '#2d2d2d' : '#ffffff',
                color: isDark ? '#ffffff' : '#000000',
              },
                          '& .rdrDay': {
              color: isDark ? '#ffffff' : '#000000',
            },
            '& .rdrDayNumber span': {
              color: isDark ? '#ffffff !important' : '#000000 !important',
              fontWeight: isDark ? '500' : 'normal',
            },
            '& .rdrDayPassive .rdrDayNumber span': {
              color: isDark ? 'rgba(255, 255, 255, 0.4) !important' : 'rgba(0, 0, 0, 0.4) !important',
            },
            '& .rdrDayToday .rdrDayNumber span': {
              color: isDark ? '#90caf9 !important' : '#1976d2 !important',
              fontWeight: 'bold !important',
            },
              '& .rdrSelected, & .rdrInRange, & .rdrStartEdge, & .rdrEndEdge': {
                color: '#ffffff',
              },
              '& .rdrDayHovered': {
                backgroundColor: isDark ? 'rgba(144, 202, 249, 0.3)' : 'rgba(25, 118, 210, 0.1)',
              },
              '& .rdrWeekDays': {
                backgroundColor: isDark ? '#2d2d2d' : '#ffffff',
              },
              '& .rdrWeekDay': {
                color: isDark ? 'rgba(255, 255, 255, 0.7) !important' : 'rgba(0, 0, 0, 0.6) !important',
                fontWeight: '500',
              },
              '& .rdrNextPrevButton': {
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                '&:hover': {
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
                }
              },
              '& .rdrPprevButton i, & .rdrNextButton i': {
                borderColor: isDark ? '#ffffff' : '#000000',
              }
            }}
          >
            <DateRange
              editableDateInputs={true}
              onChange={handleRangeChange}
              moveRangeOnFirstSelection={false}
              ranges={range}
            />
          </Paper>
        )}
      </Box>
    </ClickAwayListener>
  );
}