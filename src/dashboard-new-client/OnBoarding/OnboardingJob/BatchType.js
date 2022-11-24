import React, { useEffect, useState, useContext } from 'react';
import { Button, Stack, Autocomplete, TextField, Checkbox, FormControlLabel } from '@mui/material';
import { makeStyles } from '@mui/styles';
import SaveIcon from '@mui/icons-material/Save';
import { LoadingButton } from '@mui/lab';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { AuthContext } from '../../../context/AuthProvider';
import InputField from '../../../reusable-components/InputField';
import { getApprovedBatchApi } from "../../../api's/BatchApi";
import { getApprovedClientApi, getClientApi, getClientByUserId, getClientByUsername } from "../../../api's/ClientApi";
import { copyJobApi, createJobApi, ApprovedfetchJobsApi } from "../../../api's/JobApi";
import { dataRegionInfo } from "../../../api's/DataRegionApi";
import { ClientContext } from '../../../context/ClientProvider';

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


const BatchType = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { client } = useContext(ClientContext);

  const [jobType, setJobType] = useState('Batch');
  const [clientName, setClientName] = useState('');
  const [clientId, setClientId] = useState('');
  const [batchName, setBatchName] = useState('');
  const [batchId, setBatchId] = useState('');
  const [jobname, setJobname] = useState('');
  const [bucket_name, setbucket_name] = useState('');
  const [fetchedClient, setFetchedClient] = useState([]);
  const [fetchedBatch, setFetchedBatch] = useState([]);
  const [fetchedStream, setFetchedStream] = useState([]);
  const [batchDisable, setBatchdisable] = useState(true);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [checkedCopyJob, setCheckedCopyJob] = useState(false);
  const [copyJob, setCopyJob] = useState();
  const [copyBatch, setCopyBatch] = useState();
  const [copyBatchId, setCopyBatchId] = useState();

  const [copyClient, setCopyClient] = useState();
  const [copyClientId, setCopyClientId] = useState();
  const [fetchedJob, setFetchedJob] = useState();

  const { userRole, userId } = useContext(AuthContext);
  const handleChooseCopyJob = (event) => {
    event.target.checked === true && fetchClient();
    if (event.target.checked === false) {
      setCheckedCopyJob(false);
      setCopyClient('');
      setCopyJob('');
      setCopyBatch('');
    }
    setCheckedCopyJob(event.target.checked);
  };

  const handleSetCopyClient = (e, newevent) => {
    const result = fetchedClient.find((obj) => {
      return obj.client_name === newevent;
    });

    setCopyClientId(result.client_id);
    fetchBatch(result.client_id);
    setCopyBatch('');
    setCopyClient(newevent);
  };

  const handleSetCopyBatch = async (e, newevent) => {
    const result = fetchedBatch.find((obj) => {
      return obj.batch_name === newevent;
    });
    setCopyBatchId(result.batch_id);

    try {
      const res = await ApprovedfetchJobsApi(copyClientId, result.batch_id);
      setFetchedJob(res.data);
    } catch (error) {
      if (error.response.status === 404) {
        setFetchedJob('');
        enqueueSnackbar('No jobs exist for this job!', {
          variant: 'warning',
          autoHideDuration: 3000,
          anchorOrigin: { vertical: 'top', horizontal: 'right' },
        });
      }
    }

    setCopyJob('');
    setCopyBatch(newevent);
  };

  const handleSetCopyJob = (e, newevent) => {
    setCopyJob(newevent);
  };

  const handleSetClient = async (e, newevent) => {
    const selectedClient = fetchedClient.find((el) => el.client_name === newevent);
    const resp = await dataRegionInfo(selectedClient.dataRegionEntity);

    setBatchdisable(false);
    setBatchName('');
    setClientName(newevent);
    setClientId(selectedClient.client_id);
    setbucket_name(resp.data.bucket_name);

    fetchBatch(selectedClient.client_id);
  };

  const handleSetBatch = (e, newevent) => {
    const selectedBatch = fetchedBatch.find((el) => el.batch_name === newevent);
    setBatchId(selectedBatch.batch_id);
    setBatchName(newevent);
  };
  const fetchClient = async () => {
    try {
      let response = null;
      if (userRole === 'ROLE_admin' || userRole === 'ROLE_reader') {
        response = await getClientApi();
      } else if (userRole === 'ROLE_executor') {
        response = await getClientByUserId(userId);
      }

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

  const fetchBatch = async (clientId) => {
    try {
      const response = await getApprovedBatchApi(clientId);

      if (response.status === 200) {
        const array = [];
        for (let index = 0; index < response.data.length; index++) {
          const element = response.data[index];
          if (element.status === 'approved') {
            array.push(element);
          }
        }
        setFetchedBatch(array);
      }
    } catch (error) {
      setFetchedBatch([]);
      enqueueSnackbar('No Batch found!', {
        variant: 'warning',
        autoHideDuration: 3000,
        anchorOrigin: { vertical: 'top', horizontal: 'right' },
      });
    }
  };

  useEffect(() => {
    fetchClient();
  }, []);

  const handleAddJob = async (e) => {
    e.preventDefault();
    setLoadingBtn(true);
    let data = null;
    try {
      if (checkedCopyJob) {
        if (userRole === 'ROLE_admin') {
          data = {
            client_name: clientName,
            batch_name: batchName,
            input_ref_key: jobname,
            copyBatch,
            copyJob,
            copyClientId,
            copyBatchId,
            client_id: clientId,
            batch_id: batchId,
            status: 'approved',
          };
        } else {
          data = {
            client_name: clientName,
            batch_name: batchName,
            input_ref_key: jobname,
            copyBatch,
            copyJob,
            copyClientId,
            copyBatchId,
            client_id: clientId,
            batch_id: batchId,
          };
        }
        const response = await copyJobApi(data);

        if (response.status === 201) {
          navigate('/dashboard');
          enqueueSnackbar('New Job Added and Copied!', {
            variant: 'success',
            autoHideDuration: 3000,
            anchorOrigin: { vertical: 'top', horizontal: 'right' },
          });
        }
      } else {
        if (userRole === 'ROLE_admin') {
          data = {
            batch_name: batchName,
            input_ref_key: jobname,
            batch_id: batchId,
            client_id: clientId,
            client_name: clientName,
            status: 'approved',
          };
        } else {
          data = {
            batch_name: batchName,
            input_ref_key: jobname,
            batch_id: batchId,
            client_id: clientId,
            client_name: clientName,
          };
        }
        const response = await createJobApi(data, bucket_name);

        if (response.status === 201) {
          enqueueSnackbar('Job created successfully!', {
            variant: 'success',
            autoHideDuration: 3000,
            anchorOrigin: { vertical: 'top', horizontal: 'right' },
          });
          navigate('/dashboard');
        }
      }
    } catch (error) {
      if (error.response.status === 404) {
        enqueueSnackbar('Job already exist!', {
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
    <>
      <div>
        <form className={classes.formStyle} autoComplete="off" onSubmit={handleAddJob}>
          <div className={classes.formDiv}>
            <Autocomplete
              disablePortal
              id="combo-box-demo"
              name="clientName"
              value={clientName}
              options={fetchedClient.map((op) => op.client_name)}
              onChange={(event, newValue) => {
                handleSetClient(event, newValue);
              }}
              required
              fullWidth
              size="small"
              sx={{ mb: 3 }}
              renderInput={(params) => <TextField {...params} required label="Select Client" />}
            />

            <Autocomplete
              disablePortal
              id="combo-box-demo2"
              name="batchName"
              value={batchName}
              options={fetchedBatch.map((op) => op.batch_name)}
              onChange={(event, newValue) => {
                handleSetBatch(event, newValue);
              }}
              required
              fullWidth
              size="small"
              disabled={batchDisable}
              renderInput={(params) => <TextField {...params} required label="Select Batch" />}
            />
            <InputField
              id="outlined-basic"
              label="Job Name"
              variant="outlined"
              fullWidth
              required
              name="jobname"
              value={jobname}
              size="small"
              onChange={(e) => setJobname(e.target.value)}
            />

            <FormControlLabel
              value="start"
              control={<Checkbox checked={checkedCopyJob} onChange={handleChooseCopyJob} />}
              label="Want to copy existing job?"
              labelPlacement="start"
            />

            {checkedCopyJob && fetchedClient && (
              <Autocomplete
                value={copyClient}
                onChange={(event, newValue) => {
                  handleSetCopyClient(event, newValue);
                }}
                sx={{ mt: 2 }}
                fullWidth
                id="controllable-states-demo"
                options={fetchedClient.map((op) => op.client_name)}
                renderInput={(params) => <TextField {...params} label="Select client to copy from" />}
              />
            )}

            {copyClient && fetchedBatch && (
              <Autocomplete
                value={copyBatch}
                onChange={(event, newValue) => {
                  handleSetCopyBatch(event, newValue);
                }}
                sx={{ mt: 2 }}
                fullWidth
                id="controllable-states-demo"
                options={fetchedBatch.map((op) => op.batch_name)}
                renderInput={(params) => <TextField {...params} label="Select batch to copy from" />}
              />
            )}

            {copyBatch && fetchedJob && (
              <Autocomplete
                value={copyJob}
                onChange={(event, newValue) => {
                  handleSetCopyJob(event, newValue);
                }}
                sx={{ mt: 2 }}
                fullWidth
                id="controllable-states-demo"
                options={fetchedJob.map((op) => op.input_ref_key)}
                renderInput={(params) => <TextField {...params} label="Select job to copy from" />}
              />
            )}

            <Stack spacing={2} direction="row" sx={{ mt: 3 }}>
              <Button variant="outlined" className="outlined-button-color">
                Clear
              </Button>

              {checkedCopyJob ? (
                !loadingBtn ? (
                  <Button variant="contained" sx={{ mt: 2 }} color="secondary" type="submit" className="button-color">
                    Copy Job
                  </Button>
                ) : (
                  <LoadingButton
                    loading
                    loadingPosition="start"
                    startIcon={<SaveIcon />}
                    variant="outlined"
                    sx={{ mt: 2 }}
                  >
                    Copy Job
                  </LoadingButton>
                )
              ) : !loadingBtn ? (
                <Button
                  variant="contained"
                  sx={{ mt: 2 }}
                  color="secondary"
                  type="submit"
                  className="button-color"
                  disabled={userRole === 'ROLE_reader'}
                >
                  Add
                </Button>
              ) : (
                <LoadingButton
                  loading
                  loadingPosition="start"
                  startIcon={<SaveIcon />}
                  variant="outlined"
                  sx={{ mt: 2 }}
                >
                  Add
                </LoadingButton>
              )}
              {/* {!loadingBtn ? (
                  <Button type="submit" variant="contained" className="button-color">
                    Submit
                  </Button>
                ) : (
                  <LoadingButton
                    loading
                    loadingPosition="start"
                    startIcon={<SaveIcon />}
                    variant="outlined"
                    sx={{ mt: 2 }}
                  >
                    Add
                  </LoadingButton>
                )} */}
            </Stack>
          </div>
        </form>
      </div>
    </>
  );
};

export default BatchType;
