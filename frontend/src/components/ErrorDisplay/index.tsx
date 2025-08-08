import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import RefreshIcon from '@mui/icons-material/Refresh';

interface ErrorDisplayProps {
  message?: string;
  onRetry: () => void;
  height?: string | number;
  fullHeight?: boolean;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ 
  message = "Failed to load data. Please try again", 
  onRetry,
  height,
  fullHeight = false
}) => {
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center',
        height: fullHeight ? '100%' : (height || '200px'),
        gap: 2,
        p: 2
      }}
    >
      <Typography variant="body1" color="text.secondary" textAlign="center">
        {message}
      </Typography>
      <IconButton 
        onClick={onRetry}
        color="primary"
        sx={{ 
          backgroundColor: 'action.hover',
          '&:hover': {
            backgroundColor: 'action.selected'
          }
        }}
      >
        <RefreshIcon />
      </IconButton>
    </Box>
  );
};

export default ErrorDisplay; 