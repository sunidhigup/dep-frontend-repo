import React, { useState, useEffect, memo, useCallback, useContext } from 'react';
import { useSnackbar } from 'notistack';
import {
  Button,
  Typography,
  Toolbar,
  Dialog,
  Slide,
  IconButton,
  AppBar,
  ButtonGroup,
  TextField,
  MenuItem,
  Grid,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Autocomplete,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import InputField from '../../../reusable-components/InputField';
import { fetchPostgresDatabase, fetchPostgresTables, fetchPostgresSchema } from "../../../api's/FlowBuilderApi";
import { ClientContext } from '../../../context/ClientProvider';
import { BatchContext } from '../../../context/BatchProvider';
import { JobContext } from '../../../context/JobProvider';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="left" ref={ref} {...props} />;
});

const INITIALSTATE = {
  path: '',
  format: '',
  persist: false,
  alias: '',
  persist_type: '',
  partition: false,
  overwrite: false,
  df: '',
  p_key: '',
  index: '',
  database: '',
  tablename: '',
  db_type: '',
  mode: '',
  schema: '',
  distinct_rows: false,
};

const NodeModal_Write = ({ open, handleClose, nodeId, nodeName, getProp, nodes, edges, changeNodeName }) => {
  const { enqueueSnackbar } = useSnackbar();
  const { client } = useContext(ClientContext);
  const { batch } = useContext(BatchContext);
  const { Job } = useContext(JobContext);

  const [formField, setFormField] = useState(INITIALSTATE);
  const [disableForm, setDisableForm] = useState(false);
  const [tableName, setTableName] = useState([]);
  const [toggleType, setToggleType] = useState('S3');
  const [headerName, setHeaderName] = useState([]);
  const [fetchedHeader, setFetchedHeader] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [OracleDatabases, setOracleDatabases] = useState([]);
  const [OracleSchema, setOracleSchema] = useState([]);
  const [OracleTables, setOracleTables] = useState([]);

  const store = JSON.parse(sessionStorage.getItem('allNodes'));

  const getLocalData = () => {
    const findSrcNodeId = [];
    edges.forEach((el) => {
      if (el.target === nodeId) {
        findSrcNodeId.push(el.source);
      }
    });

    if (store && findSrcNodeId) {
      let header = [];

      findSrcNodeId.forEach((item, i) => {
        store.forEach((node) => {
          if (node.nodeId === item) {
            header.push(...node.headerName);
          }
        });
      });

      const newArr = [];

      header.forEach((el) => {
        const exist = el.header.split('.').length;

        if (exist === 2) {
          const head = el.header.split('.')[1];
          newArr.push({ ...el, header: head });
        }
      });

      if (newArr.length > 0) {
        header = newArr;
      }

      const uniqueHeader = [];

      const uniqueArray = header.filter((element) => {
        const isDuplicate = uniqueHeader.includes(element.header);

        if (!isDuplicate) {
          uniqueHeader.push(element.header);
          return true;
        }

        return false;
      });

      const head = [];

      const newHeader = uniqueArray.map((el) => {
        return { ...el, header: el.alias ? el.alias : el.header, alias: el.alias ? '' : el.alias };
      });

      newHeader.forEach((el) => {
        head.push({ label: el.header });
      });

      setHeaders(head);
      setFetchedHeader(newHeader);

      store.forEach((node) => {
        if (node.nodeId === nodeId) {
          setFormField(node.formField);
          // setHeaderName(node.headerName);
          // setFetchedHeader(node.fetchedHeader);
          setToggleType(node.toggleType);
          if (node.disabled) {
            setDisableForm(node.disabled);
          }
        }
      });
    }
  };

  useEffect(() => {
    setFormField(INITIALSTATE);
    setDisableForm(false);
    setFetchedHeader([]);
    setHeaderName([]);
    setToggleType('S3');
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
    value = e.target.value;

    setFormField({
      ...formField,
      [name]: value,
    });
  };

  useEffect(() => {
    getProp(sendFormData);
  }, [formField]);

  const handleResetForm = () => {
    setFormField(INITIALSTATE);
  };

  useEffect(() => {
    if (store) {
      setTableName(
        store.map((node, i) => {
          if (node.nodeName !== 'Write') {
            return node.formField.alias;
          }
        })
      );
    }
  }, []);

  const handleFormsubmit = async (e) => {
    e.preventDefault();

    const regex = /^s3:\/\//i;

    if (toggleType === 'S3' && !regex.test(formField.path)) {
      enqueueSnackbar('S3 path is invalid!', {
        variant: 'error',
        autoHideDuration: 3000,
        anchorOrigin: { vertical: 'top', horizontal: 'right' },
      });
      return;
    }

    const getAllNodes = JSON.parse(sessionStorage.getItem('allNodes') || '[]');

    if (getAllNodes.length > 0) {
      const newFormData = getAllNodes.filter((el) => el.nodeId !== nodeId);
      sessionStorage.setItem('allNodes', JSON.stringify(newFormData));
    }

    // let y_axis = 0;
    let y_axis;

    nodes.forEach((el) => {
      if (nodeId === el.id) {
        y_axis = parseInt(el.position.x, 10);
        // y_axis = `${parseInt(el.position.y, 10)}`;
        el.data.label = formField.alias;
      }
    });

    const newHeaderName = [];

    fetchedHeader.forEach((item) => {
      newHeaderName.push({ ...item, tableAlias: formField.alias });
    });

    setHeaderName(newHeaderName);

    const sendFormData = {
      y_axis,
      nodeId,
      nodeName,
      formField: {
        ...formField,
        index: formField.index.toLowerCase() || `${client.client_name}_${batch.batch_name}_${Job}`.toLowerCase(),
      },
      disabled: true,
      step_name: nodeName,
      headerName: newHeaderName,
      fetchedHeader,
      toggleType,
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

  const handleChangeType = (event) => {
    setToggleType(event.target.value);
  };

  const getOracleDatabase = async () => {
    try {
      const response = await fetchPostgresDatabase();
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

  const getOracleSchema = async (database) => {
    try {
      const response = await fetchPostgresSchema(database);
      if (response.status === 200) {
        const schema = [];
        response.data.forEach((el) => {
          schema.push(el.label);
        });
        setOracleSchema(schema);
      }
    } catch (error) {
      enqueueSnackbar('Tables not found!', {
        variant: 'error',
        autoHideDuration: 3000,
        anchorOrigin: { vertical: 'top', horizontal: 'right' },
      });
    }
  };

  const getOracleTables = async (dbname, schema) => {
    try {
      const response = await fetchPostgresTables(dbname, schema);
      if (response.status === 200) {
        const tables = [];
        response.data.forEach((el) => {
          tables.push(el.table);
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

  useEffect(() => {
    if (formField.db_type === 'postgres') {
      getOracleDatabase();
    }

    if (formField.db_type === 'postgres' && formField.database) {
      getOracleSchema(formField.database);
    }

    if (formField.db_type === 'postgres' && formField.database && formField.schema) {
      getOracleTables(formField.database, formField.schema);
    }
  }, [formField]);

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
            <Grid container spacing={2} sx={{ m: 1 }}>
              <Grid item xs={6}>
                <FormControl>
                  <FormLabel id="demo-controlled-radio-buttons-group">Type</FormLabel>
                  <RadioGroup
                    row
                    aria-labelledby="demo-controlled-radio-buttons-group"
                    name="target_name"
                    value={toggleType}
                    onChange={handleChangeType}
                  >
                    <FormControlLabel value="S3" control={<Radio />} label="S3" />
                    <FormControlLabel value="Open Search" control={<Radio />} label="Open Search" />
                    <FormControlLabel value="Database" control={<Radio />} label="Database" />
                  </RadioGroup>
                </FormControl>
              </Grid>
            </Grid>
            {toggleType === 'Open Search' && (
              <Grid container spacing={2} sx={{ m: 1 }}>
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
                  <TextField
                    select
                    name="df"
                    label="DF"
                    value={formField.df}
                    onChange={handleInputChange}
                    size="small"
                    sx={{ mt: 2 }}
                    disabled={disableForm}
                    required
                    fullWidth
                    InputProps={{
                      style: {
                        fontFamily: "'EB Garamond', serif ",
                        fontWeight: 600,
                      },
                    }}
                    InputLabelProps={{ style: { fontFamily: "'EB Garamond', serif " } }}
                  >
                    {tableName.map((node, i) => {
                      if (node !== undefined) {
                        return (
                          <MenuItem value={node} key={i}>
                            {node}
                          </MenuItem>
                        );
                      }
                    })}
                  </TextField>
                </Grid>
                <Grid item xs={4}>
                  <Autocomplete
                    disablePortal
                    id="combo-box-demo"
                    name="p_key"
                    value={formField.p_key}
                    disabled={disableForm}
                    onChange={(event, newValue) => {
                      setFormField({
                        ...formField,
                        p_key: newValue.label,
                      });
                    }}
                    options={headers}
                    style={{ width: '100%', marginTop: '15px' }}
                    size="small"
                    renderInput={(params) => <TextField {...params} label="Primary Key" />}
                  />
                </Grid>
                <Grid item xs={4}>
                  <InputField
                    name="index"
                    label="Index"
                    value={
                      formField.index.toLowerCase() || `${client.client_name}_${batch.batch_name}_${Job}`.toLowerCase()
                    }
                    onChange={handleInputChange}
                    size="small"
                    disabled={disableForm}
                    required
                    style={{ width: '100%' }}
                  />
                </Grid>
              </Grid>
            )}

            {toggleType === 'Database' && (
              <Grid container spacing={2} sx={{ m: 1 }}>
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
                  <TextField
                    select
                    name="df"
                    label="DF"
                    value={formField.df}
                    onChange={handleInputChange}
                    size="small"
                    sx={{ mt: 2 }}
                    disabled={disableForm}
                    required
                    fullWidth
                    InputProps={{
                      style: {
                        fontFamily: "'EB Garamond', serif ",
                        fontWeight: 600,
                      },
                    }}
                    InputLabelProps={{ style: { fontFamily: "'EB Garamond', serif " } }}
                  >
                    {tableName.map((node, i) => {
                      if (node !== undefined) {
                        return (
                          <MenuItem value={node} key={i}>
                            {node}
                          </MenuItem>
                        );
                      }
                    })}
                  </TextField>
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    id="outlined-select-currency"
                    select
                    label="Database Type"
                    size="small"
                    value={formField.db_type}
                    onChange={(event) => {
                      setFormField({
                        ...formField,
                        db_type: event.target.value,
                      });
                    }}
                    disabled={disableForm}
                    style={{ width: '100%', marginTop: '15px' }}
                  >
                    {/* <MenuItem value="Oracle">Oracle</MenuItem> */}
                    <MenuItem value="postgres">PostgreSQL</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={4}>
                  {formField.db_type && (
                    <Autocomplete
                      disablePortal
                      id="combo-box-demo"
                      name="database"
                      value={formField.database}
                      disabled={disableForm}
                      onChange={(event, newValue) => {
                        setFormField({
                          ...formField,
                          database: newValue,
                        });
                      }}
                      options={OracleDatabases}
                      style={{ width: '100%', marginTop: '15px' }}
                      size="small"
                      renderInput={(params) => <TextField {...params} label="Databases" />}
                    />
                  )}
                </Grid>
                <Grid item xs={4}>
                  {formField.database && (
                    <Autocomplete
                      disablePortal
                      id="combo-box-demo"
                      name="schema"
                      value={formField.schema}
                      disabled={disableForm}
                      onChange={(event, newValue) => {
                        setFormField({
                          ...formField,
                          schema: newValue,
                        });
                      }}
                      options={OracleSchema}
                      style={{ width: '100%', marginTop: '15px' }}
                      size="small"
                      renderInput={(params) => <TextField {...params} label="Schemas" />}
                    />
                  )}
                </Grid>
                <Grid item xs={4}>
                  {formField.schema && (
                    <Autocomplete
                      disablePortal
                      id="combo-box-demo"
                      name="tablename"
                      value={formField.tablename}
                      disabled={disableForm}
                      onChange={(event, newValue) => {
                        setFormField({
                          ...formField,
                          tablename: newValue,
                        });
                      }}
                      options={OracleTables}
                      style={{ width: '100%', marginTop: '15px' }}
                      size="small"
                      renderInput={(params) => <TextField {...params} label="Tables" />}
                    />
                  )}
                </Grid>
                <Grid item xs={4}>
                  {formField.tablename && (
                    <InputField
                      name="mode"
                      label="Mode"
                      value={formField.mode}
                      onChange={handleInputChange}
                      size="small"
                      disabled={disableForm}
                      required
                      style={{ width: '100%' }}
                    />
                  )}
                </Grid>
              </Grid>
            )}
            {toggleType === 'S3' && (
              <>
                <Grid container spacing={2} sx={{ m: 1 }}>
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
                    <TextField
                      select
                      name="df"
                      label="DF"
                      value={formField.df}
                      onChange={handleInputChange}
                      size="small"
                      sx={{ mt: 2 }}
                      disabled={disableForm}
                      required
                      fullWidth
                      InputProps={{
                        style: {
                          fontFamily: "'EB Garamond', serif ",
                          fontWeight: 600,
                        },
                      }}
                      InputLabelProps={{ style: { fontFamily: "'EB Garamond', serif " } }}
                    >
                      {tableName.map((node, i) => {
                        if (node !== undefined) {
                          return (
                            <MenuItem value={node} key={i}>
                              {node}
                            </MenuItem>
                          );
                        }
                      })}
                    </TextField>
                  </Grid>
                  <Grid item xs={4}>
                    <TextField
                      id="outlined-basic"
                      select
                      label="Format"
                      variant="outlined"
                      value={formField.format}
                      onChange={handleInputChange}
                      name="format"
                      size="small"
                      fullWidth
                      sx={{ mt: 2 }}
                      disabled={disableForm}
                      required
                      InputProps={{
                        style: {
                          fontWeight: 600,
                        },
                      }}
                    >
                      <MenuItem value="txt">txt</MenuItem>
                      <MenuItem value="doc">doc</MenuItem>
                      <MenuItem value="png">png</MenuItem>
                      <MenuItem value="csv">csv</MenuItem>
                      <MenuItem value="gif">gif</MenuItem>
                      <MenuItem value="streaming">streaming</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid item xs={4}>
                    <TextField
                      id="outlined-basic"
                      select
                      label="Overwrite"
                      variant="outlined"
                      value={formField.overwrite}
                      name="overwrite"
                      onChange={handleInputChange}
                      sx={{ mt: 2 }}
                      fullWidth
                      size="small"
                      disabled={disableForm}
                      required
                    >
                      <MenuItem value>true</MenuItem>
                      <MenuItem value={false}>false</MenuItem>
                    </TextField>
                  </Grid>
                </Grid>
                <Grid container spacing={2} sx={{ m: 1 }}>
                  <Grid item xs={4}>
                    <InputField
                      name="alias"
                      label="Alias"
                      value={formField.alias}
                      onChange={handleInputChange}
                      size="small"
                      disabled={disableForm}
                      required
                      style={{ width: '100%' }}
                    />
                  </Grid>

                  <Grid item xs={4}>
                    {formField.format !== 'streaming' && (
                      <InputField
                        name="path"
                        label="File Path"
                        value={formField.path}
                        onChange={handleInputChange}
                        size="small"
                        disabled={disableForm}
                        required
                        style={{ width: '100%' }}
                      />
                    )}
                  </Grid>
                  <Grid item xs={4}>
                    <TextField
                      id="outlined-basic"
                      select
                      label="Partition"
                      variant="outlined"
                      value={formField.partition}
                      name="partition"
                      onChange={handleInputChange}
                      fullWidth
                      sx={{ mt: 2 }}
                      size="small"
                      disabled={disableForm}
                      required
                    >
                      <MenuItem value>true</MenuItem>
                      <MenuItem value={false}>false</MenuItem>
                    </TextField>
                  </Grid>
                </Grid>
                <Grid container spacing={2} sx={{ m: 1 }}>
                  <Grid item xs={4}>
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
                      fullWidth
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
                  </Grid>
                  <Grid item xs={4}>
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
                        fullWidth
                        InputProps={{
                          style: {
                            fontFamily: "'EB Garamond', serif ",
                            fontWeight: 600,
                          },
                        }}
                        InputLabelProps={{
                          style: { fontFamily: "'EB Garamond', serif " },
                        }}
                      >
                        <MenuItem value="DISK_ONLY">DISK_ONLY</MenuItem>
                        <MenuItem value="DISK_ONLY_2">DISK_ONLY_2</MenuItem>
                        <MenuItem value="MEMORY_ONLY">MEMORY_ONLY</MenuItem>
                        <MenuItem value="MEMORY_ONLY_2">MEMORY_ONLY_2</MenuItem>
                        <MenuItem value="MEMORY_AND_DISK">MEMORY_AND_DISK</MenuItem>
                        <MenuItem value="MEMORY_AND_DISK_2">MEMORY_AND_DISK_2</MenuItem>
                      </TextField>
                    )}
                  </Grid>
                </Grid>{' '}
              </>
            )}
          </div>
        </form>
      </Dialog>
    </div>
  );
};

export default NodeModal_Write;
