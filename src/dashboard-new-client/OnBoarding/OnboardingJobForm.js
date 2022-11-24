import React, { useEffect, useState, useContext } from 'react';
import {
  Paper,
  Button,
  Stack,
  Autocomplete,
  TextField,
  Switch,
  Checkbox,
  FormControl,
  FormLabel,
  RadioGroup,
  Radio,
  FormControlLabel,
  FormGroup,
  Box,
  Modal,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import SaveIcon from '@mui/icons-material/Save';
import { LoadingButton } from '@mui/lab';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { AuthContext } from '../../context/AuthProvider';
import InputField from '../../reusable-components/InputField';
import { getApprovedBatchApi } from "../../api's/BatchApi";
import { getApprovedClientApi, getClientApi, getClientByUserId, getClientByUsername } from "../../api's/ClientApi";
import { copyJobApi, createJobApi, ApprovedfetchJobsApi } from "../../api's/JobApi";
import { createNewDataStream, createStream, getAllDataStream } from "../../api's/StreamApi";
import { createPreprocess } from "../../api's/PreprocessApi";
import { createCsvToJson, getCsvData } from "../../api's/TableRuleApi";
import { uploadJson } from "../../api's/UploadJson";
import { dataRegionInfo } from "../../api's/DataRegionApi";
import { ClientContext } from '../../context/ClientProvider';

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

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: '#fff',
  border: '1px solid #000',
  borderRadius: '10px',
  boxShadow: 24,
  p: 4,
};

const OnboardingJobForm = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { client } = useContext(ClientContext);

  const [clientName, setClientName] = useState('');
  const [streamName, setStreamName] = useState('');
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
  const [stream, setStream] = useState('Existing');
  const [ruleEngine, setRuleEngine] = useState(false);
  const [flowBuilder, setFlowBuilder] = useState(false);
  const [skipPreprocess, setSkipPreprocess] = useState(false);
  const [selectedValue, setSelectedValue] = useState('pdf');
  const [newStream, setNewStream] = useState('');
  const [isStorage, setIsStorage] = useState(false);
  const [tableName, setTableName] = useState('');
  const [fileExtension, setExtension] = useState('');
  const [destinationType, setDestinationType] = useState('');
  const [selectedExtension, setSelectedExtension] = useState('');
  const nextFile = ['pdf', 'csv', 'mpv4'];
  const fileType = ['zip', 'pdf', 'csv', 'mp4'];
  const destination = ['Flow Builder', 'Rule Engine', 'Preprocessor'];

  const [checkedCopyJob, setCheckedCopyJob] = useState(false);
  const [copyJob, setCopyJob] = useState();
  const [copyBatch, setCopyBatch] = useState();
  const [copyBatchId, setCopyBatchId] = useState();

  const [copyClient, setCopyClient] = useState();
  const [copyClientId, setCopyClientId] = useState();
  const [fetchedJob, setFetchedJob] = useState();
  const [openCsvModal, setOpenCsvModal] = useState(false);
  const [csvPath, setCsvPath] = useState();
  const [delimiter, setDelimiter] = useState();
  const [loadBtn, setLoadBtn] = useState(false);
  const [selectedFile, setSelectedFile] = useState();
  const [isFilePicked, setIsFilePicked] = useState(false);

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

  const handleSetExtension = (e, newevent) => {
    setExtension(newevent);
    console.log(fileExtension);
  };

  const handleSetSelectedExtension = (e, newevent) => {
    setSelectedExtension(newevent);
  };
  const handleSetStream = (e, newevent) => {
    const selectedStream = fetchedStream.find((el) => el === newevent);

    setStreamName(newevent);
  };

  const handleSetDestinationType = (e, newevent) => {
    setDestinationType(newevent);
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

  const fetchStream = async () => {
    const resp = await getAllDataStream();

    if (resp.status === 200) setFetchedStream(resp.data);
  };

  useEffect(() => {
    fetchClient();
    fetchStream();
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

  const [jobType, setJobType] = useState('Batch');
  const handleJobType = (event) => {
    setJobType(event.target.value);
  };

  const handleRuleEngineChange = () => {
    setRuleEngine(!ruleEngine);
  };

  const handleFlowBuilderChange = () => {
    setFlowBuilder(!flowBuilder);
  };

  const handleIsStorageChange = () => {
    setIsStorage(!isStorage);
  };

  const handleSkipPreprocess = () => {
    setSkipPreprocess(!skipPreprocess);
  };

  const handleChange = (event) => {
    setSelectedValue(event.target.value);
  };

  const uploadFile = async () => {
    const formData = new FormData();

    formData.append('file', selectedFile);
    const path = `${clientName}/${streamName}/${tableName}`;

    const data = {
      file: formData,
      path,
    };
    const response = await uploadJson(formData, path, clientId, streamName, tableName);
  };
  const handleRealTimeSubmit = async (e) => {
    e.preventDefault();
    setLoadingBtn(true);

    uploadFile();

    try {
      if (stream === 'New') {
        const streamData = {
          dataStreamName: streamName,
          dataStreamSize: 1,
        };
        const response = createNewDataStream(streamData);
        if (response.status === 201) {
          enqueueSnackbar(`${response.data} ${streamName}`, {
            variant: 'success',
            autoHideDuration: 3000,
            anchorOrigin: { vertical: 'top', horizontal: 'right' },
          });
        }
      }
      const data = {
        client_name: clientName,
        stream_name: streamName,
        ruleEngine,
        storage: isStorage,
        flowBuilder,
        id: clientName + streamName,
        table_name: tableName,
        // jobFilePrefix: `${client.client_name}/${stream.stream_name}/${}/Data_Processor/Scripts/${
        //   newJob || Job
        // }.json`,
      };

      const response = await createStream(data, client.client_id, userId);

      if (response.status === 201) {
        navigate('/dashboard');
      }
    } catch (error) {
      if (error.response.status === 409) {
        enqueueSnackbar('Job with this Batch and client already exist!', {
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

  const handlePreprocessorSubmit = async (e) => {
    e.preventDefault();
    setLoadingBtn(true);

    try {
      const data = {
        id: `${clientName}_${batchName}_${tableName}`,
        batch_name: batchName,
        client_name: clientName,
        extension: fileExtension,
        zipextension: selectedExtension,
        pattern: `${clientName}|${batchName}|${tableName}`,
        skip_PreProcess: skipPreprocess,
        table_name: tableName,
        fileDestination: destinationType,
      };

      const response = await createPreprocess(data);

      if (response.status === 201) {
        navigate('/dashboard');
      }
    } catch (error) {
      if (error.response.status === 409) {
        enqueueSnackbar('Job with this Batch and client already exist!', {
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

  // json convert

  const handleCsvModalOpen = () => setOpenCsvModal(true);

  const handleCsvModalClose = () => setOpenCsvModal(false);

  const csvJson = (headers, delimiter) => {
    const fields = [];

    headers.map((el) => {
      fields.push({
        fieldname: el,
        size: 50,
        scale: 0,
        type: 'string',
      });
    });

    const main = {
      jsonversion: '1.0',
      revision: '1.0',
      filetype: 'DELIMITED',
      delimiter,
      fields,
    };

    return main;
  };

  const handleAddCsv = async () => {
    const regex = /^s3:\/\/.*csv$/;

    if (!regex.test(csvPath)) {
      enqueueSnackbar('S3 path is invalid!', {
        variant: 'error',
        autoHideDuration: 3000,
        anchorOrigin: { vertical: 'top', horizontal: 'right' },
      });
      return;
    }

    setLoadBtn(true);

    const pathArr = csvPath.split('/');
    pathArr.shift(0);
    pathArr.shift(0);
    pathArr.shift(0);
    const newPath = pathArr.join('/');

    const filename = pathArr.pop();

    const table = filename.split('.')[0];

    try {
      const data = {
        path: newPath,
        client_id: client.client_id,
      };
      const response = await getCsvData(data);

      if (response.status === 200) {
        const res = csvJson(response.data, delimiter);

        if (res) {
          try {
            const result = await createCsvToJson(clientId, streamName, tableName, res);

            if (result.status === 201) {
              enqueueSnackbar('JSON is created with the CSV file!', {
                variant: 'Success',
                autoHideDuration: 3000,
                anchorOrigin: { vertical: 'top', horizontal: 'right' },
              });
            }
          } catch (error) {
            if (error.response.status === 500) {
              enqueueSnackbar('Wrong Csv File!', {
                variant: 'error',
                autoHideDuration: 3000,
                anchorOrigin: { vertical: 'top', horizontal: 'right' },
              });
            }
          }
        }
      }
    } catch (error) {
      if (error.response.status === 500) {
        enqueueSnackbar('Wrong Csv File!', {
          variant: 'error',
          autoHideDuration: 3000,
          anchorOrigin: { vertical: 'top', horizontal: 'right' },
        });
      }
    }

    setLoadBtn(false);
    setCsvPath('');
    setDelimiter('');
    handleCsvModalClose();
  };

  // ---------------------------------

  const uploadHandler = (event) => {
    setSelectedFile(event.target.files[0]);
    setIsFilePicked(true);
  };

  return (
    <Paper className={classes.paper} elevation={1}>
      <h3 style={{ display: 'flex', justifyContent: 'center' }}>Onboard New Job</h3>

      <div style={{ display: 'flex', justifyContent: 'center', width: '600px' }}>
        <FormControl>
          <FormLabel id="demo-row-radio-buttons-group-label">Job Type</FormLabel>
          <RadioGroup
            row
            aria-labelledby="demo-row-radio-buttons-group-label"
            name="row-radio-buttons-group"
            value={jobType}
            onChange={handleJobType}
          >
            <FormControlLabel value="Batch" control={<Radio />} label="Batch" />
            <FormControlLabel value="RealTime" control={<Radio />} label="Real Time" />
            <FormControlLabel value="PreProcessor" control={<Radio />} label="PreProcessor" />
          </RadioGroup>
        </FormControl>
      </div>

      {jobType === 'Batch' && (
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
      )}

      {jobType === 'RealTime' && (
        <div>
          <form className={classes.formStyle} autoComplete="off" onSubmit={handleRealTimeSubmit}>
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
              <FormControl>
                <FormLabel id="demo-row-radio-buttons-group-label">Stream</FormLabel>
                <RadioGroup
                  row
                  aria-labelledby="demo-row-radio-buttons-group-label"
                  name="row-radio-buttons-group"
                  value={stream}
                  onChange={(e) => setStream(e.target.value)}
                >
                  <FormControlLabel value="Existing" control={<Radio />} label="Existing Stream" />
                  <FormControlLabel value="New" control={<Radio />} label="New Stream" />
                </RadioGroup>
              </FormControl>
              {stream === 'Existing' && (
                <Autocomplete
                  disablePortal
                  id="combo-box-demo2"
                  name="streamName"
                  value={streamName}
                  options={fetchedStream.map((op) => op)}
                  onChange={(event, newValue) => {
                    handleSetStream(event, newValue);
                  }}
                  required
                  fullWidth
                  size="small"
                  renderInput={(params) => <TextField {...params} required label="Select Stream" />}
                />
              )}

              {stream === 'New' && (
                <TextField
                  fullWidth
                  label="Add Stream"
                  id="newStream"
                  value={streamName}
                  onChange={(e) => setStreamName(e.target.value)}
                />
              )}

              <FormGroup>
                <FormControlLabel
                  control={<Switch checked={ruleEngine} onChange={handleRuleEngineChange} />}
                  label="ruleEngine"
                />
              </FormGroup>
              <FormGroup>
                <FormControlLabel
                  control={<Switch checked={isStorage} onChange={handleIsStorageChange} />}
                  label="Storage"
                />
              </FormGroup>
              <FormGroup>
                <FormControlLabel
                  control={<Switch checked={flowBuilder} onChange={handleFlowBuilderChange} />}
                  label="Flow Builder"
                />
              </FormGroup>
              <TextField
                fullWidth
                label="Table Name"
                id="tableName"
                value={tableName}
                onChange={(e) => setTableName(e.target.value)}
                style={{ marginBottom: '10px' }}
              />
              <Button
                variant="contained"
                shape="round"
                size="medium"
                style={{ marginRight: 10 }}
                onClick={handleCsvModalOpen}
                disabled={userRole === 'ROLE_reader'}
              >
                Add Delimited Schema
              </Button>
              <span>Or</span>
              <Button
                variant="contained"
                component="label"
                style={{ marginLeft: 10 }}
                disabled={userRole === 'ROLE_reader'}
              >
                Upload Json
                <input type="file" hidden onChange={uploadHandler} />
              </Button>
              {isFilePicked && <p>{selectedFile.name}</p>}

              <Stack spacing={2} direction="row" sx={{ mt: 3 }}>
                <Button variant="outlined" className="outlined-button-color">
                  Clear
                </Button>
                {!loadingBtn ? (
                  <Button
                    type="submit"
                    variant="contained"
                    className="button-color"
                    disabled={userRole === 'ROLE_reader'}
                  >
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
                )}
              </Stack>
            </div>
          </form>
        </div>
      )}
      {jobType === 'PreProcessor' && (
        <div>
          <form className={classes.formStyle} autoComplete="off" onSubmit={handlePreprocessorSubmit}>
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
                name="batchname"
                value={batchName}
                options={fetchedBatch.map((op) => op.batch_name)}
                onChange={(event, newValue) => {
                  handleSetBatch(event, newValue);
                }}
                required
                fullWidth
                size="small"
                renderInput={(params) => <TextField {...params} required label="Select Batch" />}
              />

              <Stack spacing={2} direction="row" sx={{ mt: 3 }}>
                <TextField
                  fullWidth
                  label="Table Name"
                  id="tableName"
                  value={tableName}
                  onChange={(e) => setTableName(e.target.value)}
                />
              </Stack>
              <Stack spacing={2} direction="row" sx={{ mt: 2 }}>
                <Autocomplete
                  disablePortal
                  id="combo-box-demo"
                  name="fileExtension"
                  value={fileExtension}
                  options={fileType.map((op) => op)}
                  onChange={(event, newValue) => {
                    handleSetExtension(event, newValue);
                  }}
                  required
                  fullWidth
                  size="small"
                  sx={{ mb: 3 }}
                  renderInput={(params) => <TextField {...params} required label="Source File Extension" />}
                />

                {fileExtension === 'zip' && (
                  <Autocomplete
                    disablePortal
                    id="combo-box-demo"
                    name="selectedExtension"
                    value={selectedExtension}
                    options={nextFile.map((op) => op)}
                    onChange={(event, newValue) => {
                      handleSetSelectedExtension(event, newValue);
                    }}
                    required
                    fullWidth
                    size="small"
                    sx={{ mb: 3 }}
                    renderInput={(params) => <TextField {...params} required label="File Extension" />}
                  />
                )}
              </Stack>
              <Autocomplete
                disablePortal
                id="combo-box-demo"
                name="destinationType"
                value={destinationType}
                options={destination.map((op) => op)}
                onChange={(event, newValue) => {
                  handleSetDestinationType(event, newValue);
                }}
                required
                fullWidth
                size="small"
                sx={{ mb: 3 }}
                renderInput={(params) => <TextField {...params} required label="Destination" />}
              />
              <FormGroup>
                <FormControlLabel
                  control={<Switch checked={skipPreprocess} onChange={handleSkipPreprocess} />}
                  label="Skip Preprocess"
                />
              </FormGroup>

              <Stack spacing={2} direction="row" sx={{ mt: 3 }}>
                <Button variant="outlined" className="outlined-button-color">
                  Clear
                </Button>

                {!loadingBtn ? (
                  <Button
                    type="submit"
                    variant="contained"
                    className="button-color"
                    disabled={userRole === 'ROLE_reader'}
                  >
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
                )}
              </Stack>
            </div>
          </form>
        </div>
      )}

      <Modal
        open={openCsvModal}
        onClose={handleCsvModalClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <InputField
            id="outlined-basic"
            label="Delimited File"
            variant="outlined"
            fullWidth
            name="csvpath"
            value={csvPath}
            autoComplete="off"
            size="small"
            helperText="Enter s3 path of delimited file to create table schema"
            onChange={(event) => setCsvPath(event.target.value)}
          />
          <InputField
            id="outlined-basic"
            label="Delimiter"
            variant="outlined"
            fullWidth
            name="delimiter"
            value={delimiter}
            autoComplete="off"
            size="small"
            onChange={(event) => setDelimiter(event.target.value)}
          />
          {!loadBtn ? (
            <Button
              variant="contained"
              sx={{ mt: 2 }}
              color="secondary"
              type="submit"
              className="button-color"
              onClick={handleAddCsv}
            >
              Add
            </Button>
          ) : (
            <LoadingButton loading loadingPosition="start" startIcon={<SaveIcon />} variant="outlined" sx={{ mt: 2 }}>
              Add
            </LoadingButton>
          )}
        </Box>
      </Modal>
    </Paper>
  );
};

export default OnboardingJobForm;
