import { Button, ButtonGroup, Grid, IconButton, MenuItem, TextField } from '@mui/material';
import { useSnackbar } from 'notistack';
import React, { useState, memo, useEffect } from 'react';
import InputField from '../../../reusable-components/InputField';

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
};

const NodeProperties_Read = ({ nodeId, nodeName, getProp, nodes, edges, changeNodeName }) => {
  const [formField, setFormField] = useState(INITIALSTATE);
  const [disableForm, setDisableForm] = useState(false);
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
    setFormField(INITIALSTATE);
    setDisableForm(false);
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

  const handleFormsubmit = async (e) => {
    e.preventDefault();

    const regex = /^s3:\/\//i;

    if (formField.path !== '') {
      if (!regex.test(formField.path)) {
        enqueueSnackbar('S3 path is invalid!', {
          variant: 'error',
          autoHideDuration: 3000,
          anchorOrigin: { vertical: 'top', horizontal: 'right' },
        });
        return;
      }
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
    <>
      <form autoComplete="off" className="step-form" onSubmit={handleFormsubmit}>
        <input type="hidden" value={nodeId} />
        <Grid>
          <Grid item xs={12} sx={{ p: 1 }}>
            <Grid sx={{ p: 1, mb: 2 }}>
              <Grid item xs={12}>
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
                  <Button
                    type="submit"
                    size="small"
                    variant="contained"
                    disabled={disableForm}
                    className="button-color"
                  >
                    Submit
                  </Button>
                  <Button size="small" variant="outlined" className="outlined-button-color" onClick={handleEdit}>
                    Edit
                  </Button>
                </ButtonGroup>
              </Grid>
            </Grid>

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
              fullWidth
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
              <InputField
                name="delimiter"
                label="Delimiter"
                value={formField.delimiter}
                onChange={handleInputChange}
                size="small"
                disabled={disableForm}
                required
              />
            )}

            {formField.format === 'csv' && (
              <InputField
                name="path"
                label="File Path"
                value={formField.path}
                onChange={handleInputChange}
                size="small"
                disabled={disableForm}
                required
              />
            )}

            {(formField.format === 'postgres' || formField.format === 'mysql' || formField.format === 'oracle') && (
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
                fullWidth
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

            <InputField
              name="action"
              label="Action"
              value={formField.action}
              onChange={handleInputChange}
              size="small"
              disabled={disableForm}
            />

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
      </form>
    </>
  );
};

export default memo(NodeProperties_Read);
