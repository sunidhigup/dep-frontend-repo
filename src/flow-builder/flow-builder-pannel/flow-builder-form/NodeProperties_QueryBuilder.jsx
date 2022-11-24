import React, { useState, useEffect } from 'react';
import { makeStyles } from '@mui/styles';
import Modal from '@mui/material/Modal';
import { Autocomplete, Paper, TextField, Button, Box, TableContainer } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import SaveIcon from '@mui/icons-material/Save';
import { LoadingButton } from '@mui/lab';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { styled } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import StepContent from '@mui/material/StepContent';
import Typography from '@mui/material/Typography';

import { getDatabases, getTables } from "../../../api's/QueryBuilderApi";

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 1000,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

const useStyles = makeStyles({
  pannel: {
    display: 'flex',
  },
  editor: {
    width: '70%',
  },
  options: {
    display: 'flex',
    width: '100%',
    padding: '10px',
  },
});

const steps = [
  {
    label: 'Select',
    description: `For each ad campaign that you create, you can control how much
                you're willing to spend on clicks and conversions, which networks
                and geographical locations you want your ads to show on, and more.`,
  },
  {
    label: 'Sort',
    description: 'An ad group contains one or more ads which target a shared set of keywords.',
  },
  {
    label: 'Filter',
    description: `Try out different ad text to see what brings in the most customers,
                and learn how to enhance your ads using features like ad extensions.
                If you run into any problems with your ads, find out how to tell if
                they're running and how to resolve approval issues.`,
  },
];

const NodeProperties_QueryBuilder = ({ open, handleClose }) => {
  const classes = useStyles();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [value, setValue] = useState('');
  const [query, setQuery] = useState('');
  const [loadingBtn, setLoadingBtn] = useState(false);

  const [dbName, setDbName] = useState('');
  const [table, setTable] = useState('');
  const [tableColumn, setTableColumn] = useState([]);
  const [sqlResult, setSqlResult] = useState([]);
  const [fetchedDb, setFetchedDb] = useState([]);
  const [fetchedTable, setFetchedTable] = useState([]);
  const [tableDisable, setTabledisable] = useState(true);

  const handleSetDb = (e, newevent) => {
    setTabledisable(false);
    setTable('');
    setDbName(newevent);

    fetchBatch(newevent);
  };

  const handleSetTable = (e, newevent) => {
    const selectedTable = fetchedTable.find((el) => el.table_name === newevent);
    setTableColumn(selectedTable.columns);
    setTable(newevent);
  };

  console.log(tableColumn);

  const fetchClient = async () => {
    try {
      const response = await getDatabases();

      if (response.status === 200) {
        setFetchedDb(response.data.data);
      }
    } catch (error) {
      setFetchedDb([]);
    }
  };

  const fetchBatch = async (dbname) => {
    try {
      const response = await getTables(dbname);

      if (response.status === 200) {
        setFetchedTable(response.data.data);
      }
    } catch (error) {
      setFetchedTable([]);
      enqueueSnackbar('No Tables found!', {
        variant: 'warning',
        autoHideDuration: 3000,
        anchorOrigin: { vertical: 'top', horizontal: 'right' },
      });
    }
  };

  useEffect(() => {
    fetchClient();
  }, []);

  const [activeStep, setActiveStep] = React.useState(0);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  return (
    <div>
      {/* <Button onClick={handleOpen}>Open modal</Button> */}
      <Modal open={open} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description">
        <Box sx={style}>
          <div className={classes.options}>
            <Autocomplete
              disablePortal
              id="combo-box-demo"
              name="dbName"
              value={dbName}
              options={fetchedDb.map((op) => op)}
              onChange={(event, newValue) => {
                handleSetDb(event, newValue);
              }}
              required
              fullWidth
              size="small"
              sx={{ mb: 3, mr: 3 }}
              renderInput={(params) => <TextField {...params} required label="Select Database" />}
            />

            <Autocomplete
              disablePortal
              id="combo-box-demo"
              name="table"
              value={table}
              options={fetchedTable.map((op) => op.table_name)}
              onChange={(event, newValue) => {
                handleSetTable(event, newValue);
              }}
              required
              fullWidth
              size="small"
              sx={{ mb: 3 }}
              disabled={tableDisable}
              renderInput={(params) => <TextField {...params} required label="Select Table" />}
            />
          </div>

          <Box sx={{ maxWidth: 400 }}>
            <Stepper activeStep={activeStep} orientation="vertical">
              {steps.map((step, index) => (
                <Step key={step.label}>
                  <StepLabel optional={index === 2 ? <Typography variant="caption">Last step</Typography> : null}>
                    {step.label}
                  </StepLabel>
                  <StepContent>
                    <Typography>{step.description}</Typography>
                    <Box sx={{ mb: 2 }}>
                      <div>
                        <Button variant="contained" onClick={handleNext} sx={{ mt: 1, mr: 1 }}>
                          {index === steps.length - 1 ? 'Finish' : 'Continue'}
                        </Button>
                        <Button disabled={index === 0} onClick={handleBack} sx={{ mt: 1, mr: 1 }}>
                          Back
                        </Button>
                      </div>
                    </Box>
                  </StepContent>
                </Step>
              ))}
            </Stepper>
            {activeStep === steps.length && (
              <Paper square elevation={0} sx={{ p: 3 }}>
                <Typography>All steps completed - you&apos;re finished</Typography>
                <Button onClick={handleReset} sx={{ mt: 1, mr: 1 }}>
                  Reset
                </Button>
              </Paper>
            )}
          </Box>
          <Button onClick={handleClose}>Close</Button>
        </Box>
      </Modal>
    </div>
  );
};

export default NodeProperties_QueryBuilder;
