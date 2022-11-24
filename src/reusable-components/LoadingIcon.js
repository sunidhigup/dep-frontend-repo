import { Box, CircularProgress } from '@mui/material';
import React from 'react';

const LoadingIcon = ({ size }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <CircularProgress size={size} sx={{ color: '#03045e !important' }} />
    </Box>
  );
};

export default LoadingIcon;
