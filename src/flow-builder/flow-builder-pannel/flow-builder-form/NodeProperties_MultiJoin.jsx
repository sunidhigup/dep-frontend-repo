import React, { useState, memo, useEffect } from 'react';
import { Button, ButtonGroup, Grid, MenuItem, TextField } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import InputField from '../../../reusable-components/InputField';

const INITIALSTATE = {
  alias: '',
  join_conditions: '',
  select_cols: '',
  join_filter: '',
  persist: false,
  persist_type: '',
  action: '',
  joins: {
    join1: '',
  },
  tables: {
    table1: '',
    table2: '',
  },
};

const NodeProperties_MultiJoin = ({ nodeId, nodeName, getJoinProp, nodes, edges, changeNodeName }) => {
  const [formField, setFormField] = useState(INITIALSTATE);
  const [tableCounter, setTableCounter] = useState(3);
  const [joinCounter, setJoinCounter] = useState(2);
  const [tableValues, setTableValues] = useState({ val: [] });
  const [joinValues, setJoinValues] = useState({ val: [] });
  const [tableName, setTableName] = useState([]);
  const [disableForm, setDisableForm] = useState(false);

  const store = JSON.parse(sessionStorage.getItem('allNodes'));

  const getLocalData = () => {
    if (store) {
      store.forEach((node) => {
        if (node.nodeId === nodeId) {
          setFormField(node.formField);
          setTableValues(node.tableValues);
          setJoinValues(node.joinValues);
          node.joinValues.val.length > 0 && setJoinCounter(node.joinValues.val.length + 1);
          node.tableValues.val.length > 0 && setTableCounter(node.tableValues.val.length + 2);
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
    tableValues,
    joinValues,
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
    getJoinProp(sendFormData, tableValues.val, joinValues.val);
  }, [formField, tableValues, joinValues]);

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

    const sendFormData = {
      nodeId,
      nodeName,
      formField,
      tableValues,
      joinValues,
      disabled: true,
      step_name: nodeName,
      y_axis,
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

  function handleChange(event) {
    const vals = [...tableValues.val];
    vals[this] = event.target.value;
    setTableValues({ val: vals });
  }

  function handleAddTableField() {
    return tableValues.val.map((el, i) => (
      <TextField
        id="outlined-basic"
        select
        key={i}
        name={`table${i + 3}`}
        label={`Table ${i + 3}`}
        variant="outlined"
        value={el || ''}
        onChange={handleChange.bind(i)}
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
    ));
  }

  const addTableColumn = () => {
    setTableCounter(tableCounter + 1);
    setTableValues({ val: [...tableValues.val, ''] });
  };

  function handleJoinChange(event) {
    const vals = [...joinValues.val];
    vals[this] = event.target.value;
    setJoinValues({ val: vals });
  }

  function handleAddJoinField() {
    return joinValues.val.map((el, i) => (
      <TextField
        id="outlined-basic"
        select
        key={i}
        name={`join${i + 2}`}
        label={`Join ${i + 2}`}
        variant="outlined"
        value={el || ''}
        onChange={handleJoinChange.bind(i)}
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
        <MenuItem value="left">left</MenuItem>
        <MenuItem value="right">right</MenuItem>
        <MenuItem value="inner">inner </MenuItem>
        <MenuItem value="cross">cross</MenuItem>
        <MenuItem value="self">self</MenuItem>
      </TextField>
    ));
  }

  const addJoinColumn = () => {
    setJoinCounter(joinCounter + 1);
    setJoinValues({ val: [...joinValues.val, ''] });
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
                <Button type="submit" size="small" variant="contained" disabled={disableForm} className="button-color">
                  Submit
                </Button>
                <Button size="small" variant="outlined" className="outlined-button-color" onClick={handleEdit}>
                  Edit
                </Button>
              </ButtonGroup>
            </Grid>
          </Grid>

          <InputField
            name="alias"
            label="Alias"
            value={formField.alias}
            onChange={handleInputChange}
            size="small"
            disabled={disableForm}
            required
          />

          <Button size="small" variant="outlined" sx={{ mt: 2 }} onClick={addTableColumn} disabled={disableForm}>
            <AddCircleOutlineIcon /> Table
          </Button>

          <TextField
            select
            label="Table 1"
            value={formField.tables.table1}
            onChange={(e) => {
              setFormField({
                ...formField,
                tables: { ...formField.tables, table1: e.target.value },
              });
            }}
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

          <TextField
            select
            label="Table 2"
            value={formField.tables.table2}
            onChange={(e) => {
              setFormField({
                ...formField,
                tables: { ...formField.tables, table2: e.target.value },
              });
            }}
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

          {handleAddTableField()}

          <Button size="small" variant="outlined" sx={{ mt: 2 }} onClick={addJoinColumn} disabled={disableForm}>
            <AddCircleOutlineIcon /> Join Type
          </Button>

          <TextField
            id="outlined-basic"
            select
            label="Join 1"
            variant="outlined"
            value={formField.joins.join1}
            onChange={(e) => {
              setFormField({
                ...formField,
                joins: { ...formField.joins, join1: e.target.value },
              });
            }}
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
            <MenuItem value="left">left</MenuItem>
            <MenuItem value="right">right</MenuItem>
            <MenuItem value="inner">inner </MenuItem>
            <MenuItem value="cross">cross</MenuItem>
            <MenuItem value="self">self</MenuItem>
          </TextField>

          {handleAddJoinField()}

          <InputField
            name="join_conditions"
            label="Join Condition"
            value={formField.join_conditions}
            onChange={handleInputChange}
            size="small"
            disabled={disableForm}
            required
          />

          <InputField
            name="select_cols"
            label="Select Columns"
            value={formField.select_cols}
            onChange={handleInputChange}
            size="small"
            disabled={disableForm}
            required
          />

          <InputField
            name="join_filter"
            label="Join Filter"
            value={formField.join_filter}
            onChange={handleInputChange}
            size="small"
            disabled={disableForm}
          />

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

          <InputField
            name="action"
            label="Action"
            value={formField.action}
            onChange={handleInputChange}
            size="small"
            disabled={disableForm}
          />
        </Grid>
      </Grid>
    </form>
  );
};

export default memo(NodeProperties_MultiJoin);
