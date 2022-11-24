import { Button, IconButton, Stack, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import React from 'react';
import { Link } from 'react-router-dom';

const OnBoarding = () => {
  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
          <div>
            <Typography style={{ color: '#0dd398', fontWeight: 'bold' }}>Client</Typography>
          </div>
          <div>
            <Link to="/dashboard/onboarding/client">
              <IconButton aria-label="run" style={{ color: '#0dd398' }}>
                <AddIcon />
              </IconButton>
            </Link>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
          <div>
            <Typography style={{ color: '#0dd398', fontWeight: 'bold' }}>Batch</Typography>
          </div>
          <div>
            <Link to="/dashboard/onboarding/batch">
              <IconButton aria-label="run" style={{ color: '#0dd398' }}>
                <AddIcon />
              </IconButton>
            </Link>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
          <div>
            <Typography style={{ color: '#0dd398', fontWeight: 'bold' }}>Job</Typography>
          </div>
          <div>
            <Link to="/dashboard/onboarding/job">
              <IconButton aria-label="run" style={{ color: '#0dd398' }}>
                <AddIcon />
              </IconButton>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default OnBoarding;
