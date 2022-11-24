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
import InputField from '../../reusable-components/InputField';

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
};

const NodeModal_Write = ({ open, handleClose, nodeId, nodeName, getProp, nodes, edges, changeNodeName }) => {
  const [formField, setFormField] = useState(INITIALSTATE);
  const [disableForm, setDisableForm] = useState(false);
  const [tableName, setTableName] = useState([]);
  const { enqueueSnackbar } = useSnackbar();

  const store = JSON.parse(sessionStorage.getItem('allNodes'));

  const getLocalData = () => {
    if (store) {
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

    if (!regex.test(formField.path)) {
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

    const sendFormData = {
      y_axis,
      nodeId,
      nodeName,
      formField,
      disabled: true,
      step_name: nodeName,
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
            <Grid container spacing={2} sx={{ m: 1 }}>
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
            </Grid>
          </div>
        </form>
      </Dialog>
    </div>
  );
};

export default NodeModal_Write;
