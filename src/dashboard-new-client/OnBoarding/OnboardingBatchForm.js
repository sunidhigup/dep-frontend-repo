import React, { useContext, useEffect, useState } from 'react';
import { Paper, Button, Stack, Box, TextField, MenuItem, Autocomplete } from '@mui/material';
import { makeStyles } from '@mui/styles';
import SaveIcon from '@mui/icons-material/Save';
import LoadingButton from '@mui/lab/LoadingButton';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import InputField from '../../reusable-components/InputField';
import { createBatchApi } from "../../api's/BatchApi";
import { getClientApi, getClientByUserId } from "../../api's/ClientApi";
import { AuthContext } from '../../context/AuthProvider';

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
const OnboardingBatchForm = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { userRole, userId } = useContext(AuthContext);
  const [clientName, setClientName] = useState('');
  const [clientid, setClientid] = useState('');
  const [batchName, setBatchName] = useState('');
  const [batchType, setBatchType] = useState('');
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [fetchedClient, setFetchedClient] = useState([]);

  const handleSetClient = (e, newevent) => {
    const selectedClient = fetchedClient.find((el) => el.client_name === newevent);
    setClientName(newevent);
    setClientid(selectedClient.client_id);
  };

  const fetchClient = async () => {
    try {
      let response = null;
      if (userRole === 'ROLE_executor') {
        response = await getClientByUserId(userId);
      } else response = await getClientApi();

      if (response.status === 200) {
        const data = response.data.sort((a, b) => {
          if (a.client_name > b.client_name) return 1;

          return 1;
        });

        const array = [];
        for (let index = 0; index < data.length; index++) {
          const element = data[index];
          if (element.status === 'approved') {
            array.push(element);
          }
        }

        setFetchedClient(array);
      }
    } catch (error) {
      setFetchedClient([]);
    }
  };

  useEffect(() => {
    fetchClient();
  }, []);

  const handleAddBatch = async (e) => {
    e.preventDefault();
    setLoadingBtn(true);

    let data = null;
    if (userRole === 'ROLE_admin') {
      data = {
        batch_name: batchName,
        batch_type: batchType,
        client_id: clientid,
        job: batchName,
        status: 'approved',
      };
    } else {
      data = {
        batch_name: batchName,
        batch_type: batchType,
        client_id: clientid,
        job: batchName,
      };
    }

    try {
      const response = await createBatchApi(data);

      if (response.status === 201) {
        navigate('/dashboard');
        enqueueSnackbar('New Batch Added!', {
          variant: 'success',
          autoHideDuration: 3000,
          anchorOrigin: { vertical: 'top', horizontal: 'right' },
        });
      }
    } catch (error) {
      if (error.response.status === 409) {
        enqueueSnackbar('Batch with this client already exist!', {
          variant: 'error',
          autoHideDuration: 3000,
          anchorOrigin: { vertical: 'top', horizontal: 'right' },
        });
      }
      if (error.response.status === 403) {
        enqueueSnackbar('You have only Read Permission !!', {
          variant: 'error',
          autoHideDuration: 3000,
          anchorOrigin: { vertical: 'top', horizontal: 'right' },
        });
      }
    }

    setLoadingBtn(false);
  };

  return (
    <Paper className={classes.paper} elevation={1}>
      <h1 style={{ display: 'flex', justifyContent: 'center' }}>Onboard New Batch</h1>

      <form className={classes.formStyle} autoComplete="off" onSubmit={handleAddBatch}>
        <div className={classes.formDiv}>
          <Autocomplete
            disablePortal
            id="combo-box-demo"
            value={clientName}
            options={fetchedClient.map((op) => op.client_name)}
            onChange={(event, newValue) => {
              handleSetClient(event, newValue);
            }}
            required
            fullWidth
            size="small"
            renderInput={(params) => <TextField {...params} required label="Select Client" />}
          />
          <InputField
            id="outlined-basic"
            label="Batch Name"
            variant="outlined"
            fullWidth
            required
            size="small"
            onChange={(e) => setBatchName(e.target.value)}
          />

          <TextField
            id="outlined-basic"
            select
            label="Batch Type"
            variant="outlined"
            onChange={(e) => setBatchType(e.target.value)}
            name="joins"
            value={batchType}
            size="small"
            required
            fullWidth
            sx={{ mt: 2 }}
          >
            <MenuItem value="hourly">hourly</MenuItem>
            <MenuItem value="daily">daily</MenuItem>
            <MenuItem value="weekly">weekly</MenuItem>
            <MenuItem value="monthly">monthly </MenuItem>
            <MenuItem value="yearly">yearly</MenuItem>
          </TextField>
          <Stack spacing={2} direction="row" sx={{ mt: 3 }}>
            <Button variant="outlined" className="outlined-button-color">
              Clear
            </Button>
            {!loadingBtn ? (
              <Button type="submit" variant="contained" className="button-color" disabled={userRole === 'ROLE_reader'}>
                Submit
              </Button>
            ) : (
              <LoadingButton
                loading
                loadingPosition="start"
                startIcon={<SaveIcon />}
                variant="outlined"
                sx={{ mt: 2 }}
                disabled={userRole === 'ROLE_reader'}
              >
                Add
              </LoadingButton>
            )}
          </Stack>
        </div>
      </form>
    </Paper>
  );
};

export default OnboardingBatchForm;
