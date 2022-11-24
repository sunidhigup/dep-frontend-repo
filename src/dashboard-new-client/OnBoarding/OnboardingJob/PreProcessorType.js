import React, { useEffect, useState, useContext } from 'react';
import {
  Paper,
  Button,
  Stack,
  Autocomplete,
  TextField,
  Switch,
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
import InputField from '../../../reusable-components/InputField';
import { getApprovedBatchApi } from "../../../api's/BatchApi";
import { getApprovedClientApi, getClientApi, getClientByUserId, getClientByUsername } from "../../../api's/ClientApi";
import { createPreprocess } from "../../../api's/PreprocessApi";
import { createCsvToJson, getCsvData } from "../../../api's/TableRuleApi";
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

const PreProcessorType = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { client } = useContext(ClientContext);

  const [jobType, setJobType] = useState('PreProcessor');
  const [clientName, setClientName] = useState('');
  const [streamName, setStreamName] = useState('');
  const [clientId, setClientId] = useState('');
  const [batchName, setBatchName] = useState('');
  const [batchId, setBatchId] = useState('');
  const [bucket_name, setbucket_name] = useState('');
  const [fetchedClient, setFetchedClient] = useState([]);
  const [fetchedBatch, setFetchedBatch] = useState([]);
  const [batchDisable, setBatchdisable] = useState(true);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [skipPreprocess, setSkipPreprocess] = useState(false);
  const [selectedValue, setSelectedValue] = useState('pdf');
  const [tableName, setTableName] = useState('');
  const [fileExtension, setExtension] = useState('');
  const [destinationType, setDestinationType] = useState('');
  const [selectedExtension, setSelectedExtension] = useState('');
  const nextFile = ['pdf', 'csv', 'mpv4'];
  const fileType = ['zip', 'pdf', 'csv', 'mp4'];
  const destination = ['Flow Builder', 'Rule Engine', 'Preprocessor'];
  const [openCsvModal, setOpenCsvModal] = useState(false);
  const [csvPath, setCsvPath] = useState();
  const [delimiter, setDelimiter] = useState();
  const [loadBtn, setLoadBtn] = useState(false);

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

  useEffect(() => {
    fetchClient();
  }, []);

  const handleSkipPreprocess = () => {
    setSkipPreprocess(!skipPreprocess);
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

  return (
    <>
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
    </>
  );
};

export default PreProcessorType;
