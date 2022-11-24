import React from 'react'
import { Paper, Box } from '@mui/material';

const Step4 = ({ step1Data, NextData, setNextData  }) => {
  return (
    <Paper elevation={1}>
      <Box>
        <div style={{ display: 'flex', justifyContent: 'center', height: 40, alignItems: 'center', fontSize: 20, color: '#003566', fontWeight: 'bold', margin: '30px 0px' }}>
          <div>All steps are Finished !! </div>
        </div>
      </Box>
    </Paper>
  )
}

export default Step4