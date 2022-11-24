import React, { useEffect, useState } from 'react';
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
import { useNavigate, useLocation } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import InputField from '../reusable-components/InputField';
import { getApprovedBatchApi } from "../api's/BatchApi";
import { getApprovedClientApi } from "../api's/ClientApi";
import { copyJobApi, createJobApi, ApprovedfetchJobsApi } from "../api's/JobApi";
import { createNewDataStream, createStream, getAllDataStream } from "../api's/StreamApi";
import { createPreprocess } from "../api's/PreprocessApi";
import { createCsvToJson, getCsvData } from "../api's/TableRuleApi";

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
const PreprocessingEdit = () => {
  const classes = useStyles();

  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [clientName, setClientName] = useState('');
  const [streamName, setStreamName] = useState('');
  const [clientId, setClientId] = useState('');
  const [batchName, setBatchName] = useState('');
  const [batchId, setBatchId] = useState('');
  const [jobname, setJobname] = useState('');
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
  const location = useLocation();
  const { record } = location.state;
  console.log(record);

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

  const handleSetClient = (e, newevent) => {
    const selectedClient = fetchedClient.find((el) => el.client_name === newevent);

    setBatchdisable(false);
    setBatchName('');
    setClientName(newevent);
    setClientId(selectedClient.client_id);

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
      const response = await getApprovedClientApi();

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
    console.log(resp.data);
    if (resp.status === 200) setFetchedStream(resp.data);
  };

  useEffect(() => {
    fetchClient();
    fetchStream();
  }, []);

  const handleAddJob = async (e) => {
    e.preventDefault();
    setLoadingBtn(true);
    try {
      if (checkedCopyJob) {
        const data = {
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
        const data = {
          batch_name: batchName,
          input_ref_key: jobname,
          batch_id: batchId,
          client_id: clientId,
          client_name: clientName,
        };

        const response = await createJobApi(data);

        if (response.status === 201) {
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

  const handleRealTimeSubmit = async (e) => {
    e.preventDefault();
    setLoadingBtn(true);
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
      };

      const response = await createStream(data);

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
        fileDestination: destination,
      };
      console.log(data);

      // console.log(data);

      const response = await createPreprocess(data);
      console.log(response);

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
        client_id: clientId,
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
  return (
    <div>
      <form className={classes.formStyle} autoComplete="off" onSubmit={handlePreprocessorSubmit}>
        <div className={classes.formDiv}>
          <Autocomplete
            disablePortal
            id="combo-box-demo"
            name="clientName"
            value={record.client_name}
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
            value={record.batch_name}
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
              value={record.table_name}
              onChange={(e) => setTableName(e.target.value)}
            />
          </Stack>
          <Stack spacing={2} direction="row" sx={{ mt: 2 }}>
            <Autocomplete
              disablePortal
              id="combo-box-demo"
              name="fileExtension"
              value={record.extension}
              options={fileType.map((op) => op)}
              onChange={(event, newValue) => {
                handleSetExtension(event, newValue);
              }}
              required
              fullWidth
              size="small"
              sx={{ mb: 3 }}
              renderInput={(params) => <TextField {...params} required label="record File Extension" />}
            />

            {fileExtension === 'zip' && (
              <Autocomplete
                disablePortal
                id="combo-box-demo"
                name="selectedExtension"
                value={record.selectedExtension}
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
            value={record.fileDestination}
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
          {/* <FormGroup>
                <FormControlLabel
                  control={<Switch checked={skipPreprocess} onChange={handleSkipPreprocess} />}
                  label="Skip Preprocess"
                />
              </FormGroup> */}

          <Stack spacing={2} direction="row" sx={{ mt: 3 }}>
            <Button variant="outlined" className="outlined-button-color">
              Clear
            </Button>

            {!loadingBtn ? (
              <Button type="submit" variant="contained" className="button-color">
                Submit
              </Button>
            ) : (
              <LoadingButton loading loadingPosition="start" startIcon={<SaveIcon />} variant="outlined" sx={{ mt: 2 }}>
                Add
              </LoadingButton>
            )}
          </Stack>
        </div>
      </form>
    </div>
  );
};
export default PreprocessingEdit;
