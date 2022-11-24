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
import { AuthContext } from '../../../context/AuthProvider';
import { getApprovedBatchApi } from "../../../api's/BatchApi";
import { getApprovedClientApi, getClientApi, getClientByUserId, getClientByUsername } from "../../../api's/ClientApi";
import { createNewDataStream, createStream, getAllDataStream } from "../../../api's/StreamApi";
import { createCsvToJson, getCsvData } from "../../../api's/TableRuleApi";
import { uploadJson } from "../../../api's/UploadJson";
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

const RealTimeType = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { client } = useContext(ClientContext);

  const [jobType, setJobType] = useState('RealTime');
  const [clientName, setClientName] = useState('');
  const [streamName, setStreamName] = useState('');
  const [clientId, setClientId] = useState('');
  const [batchName, setBatchName] = useState('');
  const [bucket_name, setbucket_name] = useState('');
  const [fetchedClient, setFetchedClient] = useState([]);
  const [fetchedBatch, setFetchedBatch] = useState([]);
  const [fetchedStream, setFetchedStream] = useState([]);
  const [batchDisable, setBatchdisable] = useState(true);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [stream, setStream] = useState('Existing');
  const [ruleEngine, setRuleEngine] = useState(false);
  const [flowBuilder, setFlowBuilder] = useState(false);
  const [newStream, setNewStream] = useState('');
  const [isStorage, setIsStorage] = useState(false);
  const [tableName, setTableName] = useState('');
  const [openCsvModal, setOpenCsvModal] = useState(false);
  const [csvPath, setCsvPath] = useState();
  const [delimiter, setDelimiter] = useState();
  const [loadBtn, setLoadBtn] = useState(false);
  const [selectedFile, setSelectedFile] = useState();
  const [isFilePicked, setIsFilePicked] = useState(false);

  const { userRole, userId } = useContext(AuthContext);

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

  const handleSetStream = (e, newevent) => {
    const selectedStream = fetchedStream.find((el) => el === newevent);
    setStreamName(newevent);
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

  const handleRuleEngineChange = () => {
    setRuleEngine(!ruleEngine);
  };

  const handleFlowBuilderChange = () => {
    setFlowBuilder(!flowBuilder);
  };

  const handleIsStorageChange = () => {
    setIsStorage(!isStorage);
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
      };
      if (isFilePicked) {
        const response = await createStream(data, clientId, userId);
        if (response.status === 201) {
          navigate('/dashboard');
        }
      } else {
        enqueueSnackbar('Please select a file !', {
          variant: 'error',
          autoHideDuration: 3000,
          anchorOrigin: { vertical: 'top', horizontal: 'right' },
        });
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
    <>
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
    </>
  );
};

export default RealTimeType;
