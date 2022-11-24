import { Paper, Radio, RadioGroup, FormControlLabel, FormControl, FormLabel } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import React, { useState } from 'react';
import BatchType from './BatchType';
import RealTimeType from './RealTimeType';
import PreProcessorType from './PreProcessorType';

const useStyles = makeStyles({
  paper: {
    padding: '20px',
    marginBottom: '20px',
  },
  formStyle: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px 0',
  },
  formDiv: {
    width: '600px',
  },
});

const ParentJob = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [JobType, setJobType] = useState('');
  const handleJobType = (e) => {
    // console.log(e.target.value);
    setJobType(e.target.value);
  };
  return (
    <>
      <Paper className={classes.paper} elevation={1}>
        <h1 style={{ display: 'flex', justifyContent: 'center' }}>Onboard New JOB</h1>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <FormControl>
            <FormLabel id="demo-row-radio-buttons-group-label">Job Type</FormLabel>
            <RadioGroup
              row
              aria-labelledby="demo-row-radio-buttons-group-label"
              name="row-radio-job type"
              onChange={handleJobType}
            >
              <FormControlLabel value="batch" control={<Radio />} label="Batch" />
              <FormControlLabel value="realtime" control={<Radio />} label="RealTime" />
              <FormControlLabel value="preprocessor" control={<Radio />} label="Preprocessor" />
            </RadioGroup>
          </FormControl>
        </div>
        {JobType === 'batch' && <BatchType />}
        {JobType === 'realtime' && <RealTimeType />}
        {JobType === 'preprocessor' && <PreProcessorType />}
      </Paper>
    </>
  );
};

export default ParentJob;
