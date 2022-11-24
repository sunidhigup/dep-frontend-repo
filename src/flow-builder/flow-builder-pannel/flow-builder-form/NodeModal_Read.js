import React, { useState, memo, useEffect, useContext } from 'react';
import {
  Button,
  ButtonGroup,
  Box,
  IconButton,
  MenuItem,
  TextField,
  Dialog,
  AppBar,
  Toolbar,
  Typography,
  Slide,
  TableContainer,
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableHead,
  Grid,
  Autocomplete,
} from '@mui/material';
import { Input, Select, Radio } from 'antd';
import CloseIcon from '@mui/icons-material/Close';
import { useSnackbar } from 'notistack';
import InputField from '../../../reusable-components/InputField';
import LoadingIcon from '../../../reusable-components/LoadingIcon';
import { getCsvData, fetchTableRules } from "../../../api's/TableRuleApi";
import {
  getJsonData,
  AllFilesOfS3,
  AllFoldersOfS3,
  fetchOracleDatabase,
  fetchOracleTables,
  fetchOracleColumn,
} from "../../../api's/FlowBuilderApi";
import { getApprovedBatchApi } from "../../../api's/BatchApi";
import { getApprovedClientApi } from "../../../api's/ClientApi";
import { BUCKET_NAME } from '../../../constants/Constant';
import { BatchContext } from '../../../context/BatchProvider';
import { ApprovedfetchJobsApi } from "../../../api's/JobApi";
import { ClientContext } from '../../../context/ClientProvider';

const { Option } = Select;

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="left" ref={ref} {...props} />;
});

const INITIALSTATE = {
  path: '',
  format: '',
  action: '',
  persist: false,
  alias: '',
  persist_type: '',
  database: '',
  delimiter: ',',
  tablename: '',
  ignoreblanklines: false,
  skipheaders: false,
  columnshift: false,
  junkrecords: false,
  linebreak: false,
  distinct_rows: false,
  clientId: '',
  clientName: '',
  batchName: '',
  tableNameRead: '',
  trackingId: '',
  innerPath: '',
  file: '',
  dataTypeRead: 'source',
};
const RowLevelOperation = {
  ignoreblanklines: false,
  skipheaders: false,
  columnshift: false,
  junkrecords: false,
  linebreak: false,
  delimiter: ',',
};

const NodeModal_Read = ({ open, handleClose, nodeId, nodeName, getProp, nodes, edges, changeNodeName }) => {
  const { enqueueSnackbar } = useSnackbar();
  const { client } = useContext(ClientContext);
  const { batch } = useContext(BatchContext);
  const [formField, setFormField] = useState(INITIALSTATE);
  const [disableForm, setDisableForm] = useState(false);
  const [headerName, setHeaderName] = useState([]);
  const [fetchedHeader, setFetchedHeader] = useState([]);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [flowbuilderRowLevelOperation, setflowbuilderRowLevelOperation] = useState(RowLevelOperation);
  const [DataType, setDataType] = useState('Source');
  const [isDataLoad, setisDataLoad] = useState(false);

  const [AllClient, setAllClient] = useState([]);
  const [AllBatch, setAllBatch] = useState([]);
  const [AllTable, setAllTable] = useState([]);
  const [AllTracking, setAllTracking] = useState([]);
  const [AllFiles, setAllFiles] = useState([]);

  const [OracleDatabases, setOracleDatabases] = useState([]);
  const [OracleTables, setOracleTables] = useState([]);
  const plainOptions = [
    {
      label: 'Source Data',
      value: 'Source',
    },
    {
      label: 'Refernced Data',
      value: 'Refernce',
    },
  ];

  const checklabel = { inputProps: { 'aria-label': 'Checkbox demo' } };

  const onChangeDataType = ({ target: { value } }) => {
    setDataType(value);
    setisDataLoad(true);
    setFormField({ ...formField, dataTypeRead: value });
  };

  const handleHeaderChange = (obj) => {
    const selectedIndex = headerName.findIndex((object) => {
      return object.header === obj.header;
    });

    if (selectedIndex === -1 && obj.checked) {
      setHeaderName([...headerName, obj]);

      setFetchedHeader((current) =>
        current.map((object) => {
          if (object.header === obj.header) {
            return { header: obj.header, alias: obj.alias, checked: true };
          }

          return object;
        })
      );
    }

    if (selectedIndex !== -1 && obj.checked) {
      setHeaderName((current) =>
        current.map((object) => {
          if (object.header === obj.header) {
            return { ...object, header: obj.header, alias: obj.alias };
          }

          return object;
        })
      );

      setFetchedHeader((current) =>
        current.map((object) => {
          if (object.header === obj.header) {
            return { ...object, header: obj.header, alias: obj.alias };
          }

          return object;
        })
      );
    }

    if (selectedIndex !== -1 && !obj.checked) {
      setHeaderName((current) =>
        current.filter((object) => {
          return object.header !== obj.header;
        })
      );

      setFetchedHeader((current) =>
        current.map((object) => {
          if (object.header === obj.header) {
            return { ...object, checked: false, alias: '' };
          }

          return object;
        })
      );
    }
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = fetchedHeader.map((n) => {
        const all = {
          header: n.header,
          alias: n.alias,
          checked: true,
        };
        return all;
      });
      setHeaderName(newSelecteds);
      return;
    }
    setHeaderName([]);
  };

  const isSelected = (name) => {
    const selectedIndex = headerName.findIndex((object) => {
      return object.header === name;
    });

    return selectedIndex !== -1;
  };

  const store = JSON.parse(sessionStorage.getItem('allNodes'));

  const getLocalData = () => {
    if (store) {
      store.forEach((node) => {
        if (node.nodeId === nodeId) {
          console.log(node.formField);
          setFormField(node.formField);
          setisDataLoad(true);
          setHeaderName(node.headerName);
          setFetchedHeader(node.fetchedHeader);
          if (node.disabled) {
            setDisableForm(node.disabled);
          }
        }
      });
    }
  };

  useEffect(() => {
    setFormField(INITIALSTATE);
    setflowbuilderRowLevelOperation(RowLevelOperation);
    setDisableForm(false);
    setFetchedHeader([]);
    setHeaderName([]);
    getLocalData();
  }, [nodeId]);

  const sendFormData = {
    nodeId,
    nodeName,
    formField,
    disabled: false,
    step_name: nodeName,
  };

  let name, value;
  const handleInputChange = (e) => {
    name = e.target.name;
    if (
      name === 'ignoreblanklines' ||
      name === 'linebreak' ||
      name === 'skipheaders' ||
      name === 'columnshift' ||
      name === 'junkrecords'
    ) {
      value = e.target.checked;
    } else {
      value = e.target.value;
    }

    setFormField({
      ...formField,
      [name]: value,
    });
  };

  let rowName, rowValue;
  const RowLevelInputChange = (e) => {
    rowName = e.target.name;
    if (rowName === 'delimiter') {
      rowValue = e.target.value;
    } else {
      rowValue = e.target.checked;
    }
    setflowbuilderRowLevelOperation({
      ...flowbuilderRowLevelOperation,
      [rowName]: rowValue,
    });
  };

  useEffect(() => {
    getProp(sendFormData);
  }, [formField]);

  const handleResetForm = () => {
    setFormField(INITIALSTATE);
  };

  const handleFormsubmit = async (e) => {
    e.preventDefault();

    const regex = /^s3:\/\//i;

    if (formField.path !== '' && DataType === 'refernce') {
      if (!regex.test(formField.path)) {
        enqueueSnackbar('S3 path is invalid!', {
          variant: 'error',
          autoHideDuration: 3000,
          anchorOrigin: { vertical: 'top', horizontal: 'right' },
        });
        return;
      }
    }

    const newHeaderName = [];

    headerName.forEach((item) => {
      newHeaderName.push({ ...item, tableAlias: formField.alias });
    });

    setHeaderName(newHeaderName);

    const getAllNodes = JSON.parse(sessionStorage.getItem('allNodes') || '[]');

    if (getAllNodes.length > 0) {
      const newFormData = getAllNodes.filter((el) => el.nodeId !== nodeId);
      sessionStorage.setItem('allNodes', JSON.stringify(newFormData));
    }

    let y_axis;

    nodes.forEach((el) => {
      if (nodeId === el.id) {
        y_axis = parseInt(el.position.x, 10);
        // y_axis = `${parseInt(el.position.y, 10)}`;
        el.data.label = formField.alias;
      }
    });

    const sendFormData = {
      y_axis,
      nodeId,
      nodeName,
      formField,
      disabled: true,
      step_name: nodeName,
      headerName: newHeaderName,
      fetchedHeader,
      // flowbuilderRowLevelOperation
    };

    changeNodeName(nodes);

    setDisableForm(true);

    sessionStorage.setItem('node', JSON.stringify(nodes));
    sessionStorage.setItem('edges', JSON.stringify(edges));

    const fetchNodesData = JSON.parse(sessionStorage.getItem('allNodes') || '[]');
    fetchNodesData.push(sendFormData);

    sessionStorage.setItem('allNodes', JSON.stringify(fetchNodesData));

    const getElements = JSON.parse(sessionStorage.getItem('saved_node') || '[]');
    getElements.push(nodeId);
    sessionStorage.setItem('saved_node', JSON.stringify(getElements));
  };

  const handleEdit = (e) => {
    e.preventDefault();
    setDisableForm(false);

    const getAllNodes = JSON.parse(sessionStorage.getItem('allNodes'));

    getAllNodes.forEach((el) => {
      if (el.nodeId === nodeId) {
        el['disabled'] = false;
      }
    });

    sessionStorage.setItem('allNodes', JSON.stringify(getAllNodes));

    const getElements = JSON.parse(sessionStorage.getItem('saved_node'));

    const newSavedElement = getElements.filter((el) => el !== nodeId);

    sessionStorage.setItem('saved_node', JSON.stringify(newSavedElement));
  };

  const fetchFileHeader = async (dataType) => {
    if (dataType === 'refernce') {
      const regex = /^s3:\/\/.*csv$/;

      if (!regex.test(formField.path)) {
        enqueueSnackbar('S3 path is invalid!', {
          variant: 'error',
          autoHideDuration: 3000,
          anchorOrigin: { vertical: 'top', horizontal: 'right' },
        });
        return;
      }
    }

    setLoadingBtn(true);

    let data = {};
    if (dataType === 'refernce') {
      const pathArr = formField.path.split('/');
      pathArr.shift(0);
      pathArr.shift(0);
      pathArr.shift(0);
      const newPath = pathArr.join('/');
      data = {
        path: newPath,
        client_id: client.client_id,
      };
    } else {
      const newPath = `${formField.trackingId}${formField.file}`;
      data = { path: newPath, client_id: client.client_id };
    }

    try {
      const response = await getCsvData(data);
      if (response.status === 200) {
        const header = [];

        response.data.forEach((el) => {
          header.push({
            header: el,
            alias: '',
            checked: false,
            tableAlias: '',
          });
        });

        setFetchedHeader(header);
      }
    } catch (error) {
      enqueueSnackbar('S3 path is invalid!', {
        variant: 'error',
        autoHideDuration: 3000,
        anchorOrigin: { vertical: 'top', horizontal: 'right' },
      });
    }
    setLoadingBtn(false);
  };

  const fetchJsonFileHeader = async () => {
    const regex = /^s3:\/\/.*json$/;

    if (!regex.test(formField.path)) {
      enqueueSnackbar('S3 path is invalid!', {
        variant: 'error',
        autoHideDuration: 3000,
        anchorOrigin: { vertical: 'top', horizontal: 'right' },
      });
      return;
    }

    setLoadingBtn(true);

    const pathArr = formField.path.split('/');
    pathArr.shift(0);
    pathArr.shift(0);
    pathArr.shift(0);
    const newPath = pathArr.join('/');

    try {
      const data = {
        path: newPath,
        client_id: client.client_id,
      };
      const response = await getJsonData(data);
      console.log(response);
      if (response.status === 200) {
        const header = [];

        response.data.forEach((el) => {
          header.push({
            header: el,
            alias: '',
            checked: false,
            tableAlias: '',
          });
        });

        setFetchedHeader(header);
      }
    } catch (error) {
      enqueueSnackbar('S3 path is invalid!', {
        variant: 'error',
        autoHideDuration: 3000,
        anchorOrigin: { vertical: 'top', horizontal: 'right' },
      });
    }
    setLoadingBtn(false);
  };

  const getClient = async () => {
    const response = await getApprovedClientApi();
    if (response.status === 200) {
      setAllClient(response.data);
    }
  };

  const getBatch = async (clientId) => {
    const sp = clientId.split('_____');
    const response = await getApprovedBatchApi(sp[0]);
    if (response.status === 200) {
      setAllBatch(response.data);
    }
  };

  const getTable = async (batchName) => {
    try {
      const sp = formField.clientId.split('_____');
      const sp1 = formField.batchName.split('_____');
      // const response = await fetchTableRules(sp[0], batch.batch_id);
      const response = await ApprovedfetchJobsApi(sp[0], sp1[0]);
      if (response.status === 200) {
        setAllTable(response.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getTrackingId = async (values, innerPath) => {
    try {
      const sp = formField.clientId.split('_____');
      const sp1 = formField.batchName.split('_____');
      const response = await AllFoldersOfS3(sp[1], sp1[1], formField.tableNameRead, innerPath, sp[0]);
      if (response.status === 200) {
        setAllTracking(response.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getFile = async (values) => {
    const sp = formField.clientId.split('_____');
    const response = await AllFilesOfS3(formField.trackingId, sp[0]);
    if (response.status === 200) {
      setAllFiles(response.data);
    }
  };

  const handleClientChange = async (e) => {
    setFormField({ ...formField, clientId: e.target.value });
  };

  const handleBatchChange = (e) => {
    setFormField({ ...formField, batchName: e.target.value });
  };

  const handleTableChange = (e) => {
    setFormField({ ...formField, tableNameRead: e.target.value });
  };

  const handleinnerPathChange = (e) => {
    setFormField({ ...formField, innerPath: e.target.value });
  };

  const handleTrackingChange = (e) => {
    setFormField({ ...formField, trackingId: e.target.value });
  };

  const handleFileChange = (e) => {
    setFormField({ ...formField, file: e.target.value });
  };

  useEffect(() => {
    if (isDataLoad) {
      getClient();
    }
  }, [isDataLoad]);

  useEffect(() => {
    if (isDataLoad) {
      getBatch(formField.clientId);
      setFormField({ ...formField, batchName: '', tableNameRead: '', trackingId: '', file: '' });
    }
  }, [formField.clientId]);

  useEffect(() => {
    if (isDataLoad) {
      getTable(formField.batchName);
      setFormField({ ...formField, tableNameRead: '', trackingId: '', file: '' });
    }
  }, [formField.batchName]);

  useEffect(() => {
    if (isDataLoad) {
      getTrackingId(formField.tableNameRead, formField.innerPath);
      setFormField({ ...formField, trackingId: '', file: '' });
    }
  }, [formField.innerPath]);

  useEffect(() => {
    if (isDataLoad) {
      getFile();
      setFormField({ ...formField, file: '' });
    }
  }, [formField.trackingId]);

  useEffect(() => {
    if (isDataLoad) {
      setFormField({ ...formField });
    }
  }, [formField.file]);

  const getOracleDatabase = async (format) => {
    try {
      const response = await fetchOracleDatabase();
      if (response.status === 200) {
        const db = [];
        response.data.forEach((el) => {
          db.push(el.label);
        });
        setOracleDatabases(db);
      }
    } catch (error) {
      enqueueSnackbar('Databases not found!', {
        variant: 'error',
        autoHideDuration: 3000,
        anchorOrigin: { vertical: 'top', horizontal: 'right' },
      });
    }
  };
  const getOracleTables = async (database) => {
    try {
      const response = await fetchOracleTables(database);
      if (response.status === 200) {
        const tables = [];
        response.data.forEach((el) => {
          tables.push(el.label);
        });
        setOracleTables(tables);
      }
    } catch (error) {
      enqueueSnackbar('Tables not found!', {
        variant: 'error',
        autoHideDuration: 3000,
        anchorOrigin: { vertical: 'top', horizontal: 'right' },
      });
    }
  };

  const getOracleColumn = async (table) => {
    setLoadingBtn(true);

    try {
      const response = await fetchOracleColumn(formField.database, table);
      if (response.status === 200) {
        const header = [];

        response.data.forEach((el) => {
          header.push({
            header: el,
            alias: '',
            checked: false,
            tableAlias: '',
          });
        });

        setFetchedHeader(header);
      }
    } catch (error) {
      enqueueSnackbar('Columns not found!', {
        variant: 'error',
        autoHideDuration: 3000,
        anchorOrigin: { vertical: 'top', horizontal: 'right' },
      });
    }

    setLoadingBtn(false);
  };

  useEffect(() => {
    if (formField.format === 'oracle') {
      getOracleDatabase(formField.format);
    }

    if (formField.format === 'oracle' && formField.database) {
      getOracleTables(formField.database);
    }
  }, [formField]);

  console.log(formField);

  return (
    <div>
      <Dialog
        fullScreen
        open={open}
        // onClose={handleClose}
        TransitionComponent={Transition}
        style={{ width: '70%', marginLeft: '30%' }}
      >
        <form autoComplete="off" onSubmit={handleFormsubmit}>
          <AppBar sx={{ position: 'relative', backgroundColor: '#00013F' }}>
            <Toolbar>
              <IconButton edge="start" color="inherit" onClick={handleClose} aria-label="close">
                <CloseIcon />
              </IconButton>
              <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
                {nodeName}
              </Typography>
              <ButtonGroup variant="contained" aria-label="outlined primary button group">
                <Button
                  size="small"
                  variant="outlined"
                  onClick={handleResetForm}
                  disabled={disableForm}
                  className="outlined-button-color"
                >
                  Clear
                </Button>
                <Button size="small" variant="outlined" className="outlined-button-color" onClick={handleEdit}>
                  Edit
                </Button>
                <Button type="submit" size="small" variant="contained" disabled={disableForm} className="button-color">
                  Submit
                </Button>
              </ButtonGroup>
            </Toolbar>
          </AppBar>
          <div style={{ margin: '20px' }}>
            <input type="hidden" value={nodeId} />

            <Box
              component="form"
              sx={{
                '& > :not(style)': { m: 2, width: '32ch' },
              }}
              noValidate
              autoComplete="off"
            >
              <TextField
                id="outlined-basic"
                select
                label="Format"
                variant="outlined"
                value={formField.format}
                onChange={handleInputChange}
                name="format"
                sx={{ mt: 2 }}
                size="small"
                disabled={disableForm}
                required
                InputProps={{
                  style: {
                    fontFamily: "'EB Garamond', serif ",
                    fontWeight: 600,
                  },
                }}
                InputLabelProps={{ style: { fontFamily: "'EB Garamond', serif " } }}
              >
                <MenuItem value="csv">csv</MenuItem>
                <MenuItem value="streaming">streaming</MenuItem>
                <MenuItem value="delimeted">delimeted</MenuItem>
                <MenuItem value="postgres">postgres</MenuItem>
                <MenuItem value="mysql">mysql</MenuItem>
                <MenuItem value="oracle">oracle</MenuItem>
              </TextField>

              {formField.format === 'delimeted' && (
                <>
                  <div style={{ width: '100%', display: 'flex', justifyContent: 'left', alignItems: 'center' }}>
                    <Checkbox
                      disabled={disableForm}
                      name="ignoreblanklines"
                      {...checklabel}
                      checked={formField.ignoreblanklines}
                      onChange={handleInputChange}
                    />{' '}
                    ignoreblanklines
                    <Checkbox
                      disabled={disableForm}
                      name="skipheaders"
                      {...checklabel}
                      checked={formField.skipheaders}
                      onChange={handleInputChange}
                    />{' '}
                    skipheaders
                    <Checkbox
                      disabled={disableForm}
                      name="columnshift"
                      {...checklabel}
                      checked={formField.columnshift}
                      onChange={handleInputChange}
                    />{' '}
                    columnshift
                    <Checkbox
                      disabled={disableForm}
                      name="junkrecords"
                      {...checklabel}
                      checked={formField.junkrecords}
                      onChange={handleInputChange}
                    />{' '}
                    junkrecords
                    <Checkbox
                      disabled={disableForm}
                      name="linebreak"
                      {...checklabel}
                      checked={formField.linebreak}
                      onChange={handleInputChange}
                    />{' '}
                    linebreak
                  </div>
                  <InputField
                    name="delimiter"
                    label="Delimiter"
                    value={formField.delimiter}
                    onChange={handleInputChange}
                    size="small"
                    disabled={disableForm}
                    required
                  />
                  <InputField
                    name="path"
                    label="File Path"
                    value={formField.path}
                    onChange={handleInputChange}
                    size="small"
                    disabled={disableForm}
                    required
                  />

                  <Button
                    style={{ width: '100px' }}
                    variant="outlined"
                    onClick={fetchFileHeader}
                    disabled={disableForm}
                    className="outlined-button-color"
                  >
                    Fetch
                  </Button>
                </>
              )}

              {formField.format === 'csv' && (
                <>
                  <Radio.Group
                    style={{ width: '30vw' }}
                    options={plainOptions}
                    size="large"
                    name="DataTypeRadio"
                    onChange={onChangeDataType}
                    value={formField.dataTypeRead}
                    disabled={disableForm}
                  />
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {formField.dataTypeRead === 'Source' && (
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          width: '70vw',
                        }}
                      >
                        {/* <ReadRefernce disableForm={disableForm} /> */}
                        <Box
                          component="form"
                          sx={{ '& .MuiTextField-root': { m: 1, width: '25ch' } }}
                          noValidate
                          autoComplete="off"
                        >
                          <div>
                            <TextField id="Bucket" name="bucket" disabled value={`s3://${BUCKET_NAME}`} />
                            <TextField
                              id="outlined-select-client"
                              select
                              disabled={disableForm}
                              required
                              label="Client"
                              name="client"
                              value={formField.clientId}
                              onChange={handleClientChange}
                            >
                              {AllClient &&
                                AllClient.map((ele) => {
                                  return (
                                    <MenuItem key={ele.client_id} value={`${ele.client_id}_____${ele.client_name}`}>
                                      {ele.client_name}
                                    </MenuItem>
                                  );
                                })}
                            </TextField>
                            <TextField
                              id="outlined-select-batch"
                              select
                              disabled={disableForm}
                              required
                              label="Batch"
                              name="batch"
                              value={formField.batchName}
                              onChange={handleBatchChange}
                            >
                              {AllBatch &&
                                AllBatch.map((ele) => {
                                  return (
                                    <MenuItem key={ele.batch_id} value={`${ele.batch_id}_____${ele.batch_name}`}>
                                      {ele.batch_name}
                                    </MenuItem>
                                  );
                                })}
                            </TextField>
                            <TextField
                              id="tableNameRead"
                              select
                              required
                              label="Jobs"
                              name="tableNameRead"
                              disabled={disableForm}
                              value={formField.tableNameRead}
                              onChange={handleTableChange}
                            >
                              {AllTable &&
                                AllTable.map((ele) => {
                                  return (
                                    <MenuItem key={ele.input_ref_key} value={ele.input_ref_key}>
                                      {ele.input_ref_key}
                                    </MenuItem>
                                  );
                                })}
                            </TextField>
                            <TextField
                              id="track"
                              select
                              label="innerPath"
                              name="track"
                              value={formField.innerPath}
                              disabled={disableForm}
                              onChange={handleinnerPathChange}
                            >
                              <MenuItem value="RuleEngine">RuleEngine</MenuItem>
                              <MenuItem value="Data_Processor">DataProcessor</MenuItem>
                            </TextField>

                            <TextField
                              id="outlined-select-tracking"
                              select
                              disabled={disableForm}
                              required
                              label="Tracking Id"
                              name="tracking"
                              value={formField.trackingId}
                              onChange={handleTrackingChange}
                            >
                              {AllTracking &&
                                AllTracking.map((ele) => {
                                  return (
                                    <MenuItem key={ele.value} value={ele.value}>
                                      {ele.label}
                                    </MenuItem>
                                  );
                                })}
                            </TextField>
                            <TextField
                              id="file"
                              select
                              // required
                              label="Files"
                              name="file"
                              value={formField.file}
                              disabled={disableForm}
                              onChange={handleFileChange}
                            >
                              {AllFiles &&
                                AllFiles.map((ele) => {
                                  return (
                                    <MenuItem key={ele.value} value={ele.label}>
                                      {ele.label}
                                    </MenuItem>
                                  );
                                })}
                            </TextField>
                            <Button
                              style={{ width: '100px', marginTop: 30 }}
                              variant="outlined"
                              onClick={() => {
                                console.log(formField.trackingId);
                                console.log(formField.file);

                                formField.path = `s3://${BUCKET_NAME}/${formField.trackingId}${formField.file}`;
                                fetchFileHeader('source');
                              }}
                              disabled={disableForm}
                              className="outlined-button-color"
                            >
                              Fetch
                            </Button>
                          </div>
                        </Box>
                      </div>
                    )}
                    {formField.dataTypeRead === 'Refernce' && (
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          // border: '2px solid black',
                          width: '50vw',
                        }}
                      >
                        <TextField
                          name="path"
                          label="File Path"
                          value={formField.path}
                          onChange={handleInputChange}
                          size="small"
                          disabled={disableForm}
                          required
                          style={{ marginRight: 15, width: '80%' }}
                        />

                        <Button
                          style={{ width: '100px' }}
                          variant="outlined"
                          onClick={() => {
                            fetchFileHeader('refernce');
                          }}
                          disabled={disableForm}
                          className="outlined-button-color"
                        >
                          Fetch
                        </Button>
                      </div>
                    )}
                  </div>
                </>
              )}

              {formField.format === 'streaming' && (
                <>
                  <InputField
                    name="path"
                    label="File Path"
                    value={formField.path}
                    onChange={handleInputChange}
                    size="small"
                    disabled={disableForm}
                    required
                  />

                  <Button
                    style={{ width: '100px' }}
                    variant="outlined"
                    onClick={fetchJsonFileHeader}
                    disabled={disableForm}
                    className="outlined-button-color"
                  >
                    Fetch
                  </Button>
                </>
              )}

              {(formField.format === 'postgres' || formField.format === 'mysql') && (
                <>
                  <InputField
                    name="database"
                    label="Database Name"
                    value={formField.database}
                    onChange={handleInputChange}
                    size="small"
                    disabled={disableForm}
                    required
                  />
                  <InputField
                    name="tablename"
                    label="Table Name"
                    value={formField.tablename}
                    onChange={handleInputChange}
                    size="small"
                    disabled={disableForm}
                    required
                  />
                </>
              )}
            </Box>

            {formField.format === 'oracle' && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', margin: '20px 0px 20px' }}>
                  <Autocomplete
                    disablePortal
                    id="flowbuilder-oracle"
                    value={formField.database}
                    disabled={disableForm}
                    onChange={(event, newValue) => {
                      setFormField({
                        ...formField,
                        database: newValue,
                      });
                      getOracleTables(newValue);
                    }}
                    options={OracleDatabases}
                    // getOptionLabel={(option) => (option.label ? option.label : '')}
                    size="small"
                    sx={{ width: '40%' }}
                    renderInput={(params) => <TextField {...params} label="Databases" required />}
                  />
                  <Autocomplete
                    disablePortal
                    id="flowbuilder-oracle"
                    value={formField.tablename || null}
                    disabled={disableForm}
                    onChange={(event, newValue) => {
                      setFormField({
                        ...formField,
                        tablename: newValue,
                      });
                      getOracleColumn(newValue);
                    }}
                    options={OracleTables}
                    // getOptionLabel={(option) => (option.label ? option.label : '')}
                    size="small"
                    sx={{ width: '40%' }}
                    renderInput={(params) => <TextField {...params} label="Tables " required />}
                  />
                </div>
              </>
            )}

            {loadingBtn && (
              <Box>
                <LoadingIcon />
              </Box>
            )}

            {!loadingBtn && fetchedHeader && (
              <TableContainer sx={{ maxHeight: 300 }}>
                <Table stickyHeader aria-label="sticky table">
                  <TableHead>
                    <TableRow>
                      <TableCell>
                        <Checkbox
                          color="primary"
                          checked={fetchedHeader.length === headerName.length}
                          onChange={handleSelectAllClick}
                        />
                        Select Columns
                      </TableCell>
                      <TableCell>Columns</TableCell>
                      <TableCell>Alias</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {fetchedHeader.map((row, i) => {
                      const isItemSelected = isSelected(row.header);
                      return (
                        <TableRow
                          hover
                          role="checkbox"
                          aria-checked={isItemSelected}
                          tabIndex={-1}
                          key={i}
                          selected={isItemSelected}
                        >
                          <TableCell>
                            <Checkbox
                              checked={isItemSelected}
                              disabled={disableForm}
                              onChange={(event) =>
                                handleHeaderChange({
                                  header: row.header,
                                  alias: '',
                                  checked: event.target.checked,
                                })
                              }
                              inputProps={{ 'aria-label': 'controlled' }}
                            />
                          </TableCell>
                          <TableCell>{row.header}</TableCell>

                          <TableCell>
                            <TextField
                              name="alias"
                              label="Alias"
                              value={row.alias}
                              disabled={disableForm}
                              onChange={(e) =>
                                handleHeaderChange({ header: row.header, alias: e.target.value, checked: true })
                              }
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            <Box
              component="form"
              sx={{
                '& > :not(style)': { m: 2, width: '32ch' },
              }}
              noValidate
              autoComplete="off"
            >
              <TextField
                id="outlined-basic"
                select
                label="Persist"
                variant="outlined"
                value={formField.persist}
                name="persist"
                onChange={handleInputChange}
                sx={{ mt: 2 }}
                size="small"
                disabled={disableForm}
                required
                InputProps={{
                  style: {
                    fontFamily: "'EB Garamond', serif ",
                    fontWeight: 600,
                  },
                }}
                InputLabelProps={{ style: { fontFamily: "'EB Garamond', serif " } }}
              >
                <MenuItem value>true</MenuItem>
                <MenuItem value={false}>false</MenuItem>
              </TextField>

              {formField.persist === true && (
                <TextField
                  id="outlined-basic"
                  select
                  label="Persist Type"
                  variant="outlined"
                  value={formField.persist_type}
                  name="persist_type"
                  onChange={handleInputChange}
                  sx={{ mt: 2 }}
                  size="small"
                  disabled={disableForm}
                  required
                >
                  <MenuItem value="DISK_ONLY">DISK_ONLY</MenuItem>
                  <MenuItem value="DISK_ONLY_2">DISK_ONLY_2</MenuItem>
                  <MenuItem value="MEMORY_ONLY">MEMORY_ONLY</MenuItem>
                  <MenuItem value="MEMORY_ONLY_2">MEMORY_ONLY_2</MenuItem>
                  <MenuItem value="MEMORY_AND_DISK">MEMORY_AND_DISK</MenuItem>
                  <MenuItem value="MEMORY_AND_DISK_2">MEMORY_AND_DISK_2</MenuItem>
                </TextField>
              )}
            </Box>

            <Grid container spacing={2} sx={{ mx: 1 }}>
              <Grid item xs={4}>
                <InputField
                  name="action"
                  label="Action"
                  value={formField.action}
                  onChange={handleInputChange}
                  size="small"
                  disabled={disableForm}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  id="outlined-select-currency"
                  select
                  label="Distinct Rows"
                  size="small"
                  value={formField.distinct_rows}
                  onChange={(event) => {
                    setFormField({
                      ...formField,
                      distinct_rows: event.target.value,
                    });
                  }}
                  disabled={disableForm}
                  style={{ width: '100%', marginTop: '15px' }}
                >
                  <MenuItem value="true">true</MenuItem>
                  <MenuItem value="false">false</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={4}>
                <InputField
                  name="alias"
                  label="Alias"
                  value={formField.alias}
                  onChange={handleInputChange}
                  size="small"
                  disabled={disableForm}
                  required
                />
              </Grid>
            </Grid>
          </div>
        </form>
      </Dialog>
    </div>
  );
};

export default memo(NodeModal_Read);
