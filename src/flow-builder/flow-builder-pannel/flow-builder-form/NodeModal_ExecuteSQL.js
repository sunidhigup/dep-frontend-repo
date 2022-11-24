import React, { useState, useEffect, memo, useCallback, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
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
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import InputField from '../../../reusable-components/InputField';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="left" ref={ref} {...props} />;
});

const INITIALSTATE = {
  action: '',
  persist: false,
  alias: '',
  persist_type: '',
  db_name: '',
  statement: '',
  distinct_rows: false,
};

const NodeModal_ExecuteSQL = ({ nodeId, nodeName, getProp, handleClose, open, nodes, edges, changeNodeName }) => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [formField, setFormField] = useState(INITIALSTATE);
  const [disableForm, setDisableForm] = useState(false);
  const [headerName, setHeaderName] = useState([]);
  const [fetchedHeader, setFetchedHeader] = useState([]);
  const [loadingBtn, setLoadingBtn] = useState(false);

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

      const newHeader = uniqueArray.map((el) => {
        return { ...el, header: el.alias ? el.alias : el.header, alias: el.alias ? '' : el.alias };
      });

      setFetchedHeader(newHeader);

      setHeaderName(newHeader);

      store.forEach((node) => {
        if (node.nodeId === nodeId) {
          setFormField(node.formField);
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
    getLocalData();
  }, [nodeId]);

  let name, value;
  const handleInputChange = (e) => {
    name = e.target.name;
    value = e.target.value;

    setFormField({
      ...formField,
      [name]: value,
    });
  };

  const handleResetForm = () => {
    setFormField(INITIALSTATE);
  };

  const handleFormsubmit = async (e) => {
    e.preventDefault();

    const getAllNodes = JSON.parse(sessionStorage.getItem('allNodes') || '[]');

    if (getAllNodes.length > 0) {
      const newFormData = getAllNodes.filter((el) => el.nodeId !== nodeId);
      sessionStorage.setItem('allNodes', JSON.stringify(newFormData));
    }

    let y_axis;

    nodes.forEach((el) => {
      if (nodeId === el.id) {
        y_axis = parseInt(el.position.x, 10);
        el.data.label = formField.alias;
      }
    });

    // const newHeaderName = [];

    // headerName.forEach((item) => {
    //   newHeaderName.push({ ...item, tableAlias: formField.alias });
    // });

    // setHeaderName(newHeaderName);

    const sendFormData = {
      nodeId,
      nodeName,
      formField,
      disabled: true,
      step_name: nodeName,
      y_axis,
      headerName,
      fetchedHeader,
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
            <Grid container spacing={2} sx={{ mx: 1 }}>
              <Grid item xs={6}>
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
              <Grid item xs={6}>
                <InputField
                  name="db_name"
                  label="Database Name"
                  value={formField.db_name}
                  onChange={handleInputChange}
                  size="small"
                  disabled={disableForm}
                  required
                  style={{ width: '100%' }}
                />
              </Grid>
            </Grid>
            <Grid container spacing={2} sx={{ mx: 1 }}>
              <Grid item xs={6}>
                <InputField
                  rows={4}
                  placeholder="Select * from tableName"
                  name="statement"
                  label="Statement"
                  value={formField.statement}
                  onChange={handleInputChange}
                  size="small"
                  disabled={disableForm}
                  multiline
                  sx={{ mt: 2 }}
                  style={{ width: '100%' }}
                  required
                />
              </Grid>
            </Grid>

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
            </Grid>
          </div>
        </form>
      </Dialog>
    </div>
  );
};

export default NodeModal_ExecuteSQL;
