import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import { useSnackbar } from 'notistack';
import {
  Button,
  ButtonGroup,
  IconButton,
  TextField,
  Dialog,
  AppBar,
  Toolbar,
  Typography,
  Slide,
  Autocomplete,
  Box,
  FormControl,
  MenuItem,
  Select,
  OutlinedInput,
  Chip,
  InputLabel,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import InputField from '../../../reusable-components/InputField';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
    },
  },
};

function getStyles(name, rulename, theme) {
  return {
    fontWeight: rulename.indexOf(name) === -1 ? theme.typography.fontWeightRegular : theme.typography.fontWeightMedium,
  };
}

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

const NodeModal_Aggregate = ({ open, handleClose, nodeId, nodeName, nodes, edges, changeNodeName }) => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();

  const [formField, setFormField] = useState(INITIALSTATE);
  const [disableForm, setDisableForm] = useState(false);
  const [headerName, setHeaderName] = useState([]);
  const [fetchedHeader, setFetchedHeader] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [groupBy, setGroupBy] = useState([]);
  const [aggregateCol, setAggregateCol] = useState([
    {
      aggregate: 'Count',
      header: '',
      alias: '',
    },
  ]);

  const handleGroupChange = (event) => {
    const {
      target: { value },
    } = event;
    setGroupBy(typeof value === 'string' ? value.split(',') : value);
  };

  const handleAggregateChange = (event, index, dropdown) => {
    const data = [...aggregateCol];

    if (dropdown) {
      data[index]['header'] = event.target.textContent;
    } else {
      data[index][event.target.name] = event.target.value;
    }

    setAggregateCol(data);
  };

  const store = JSON.parse(sessionStorage.getItem('allNodes'));

  const getSourceData = () => {
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

      uniqueArray.map((el) => {
        return { ...el, header: el.alias ? el.alias : el.header, alias: el.alias ? '' : el.alias };
      });

      uniqueArray.forEach((el) => {
        head.push({ label: el.header });
      });

      setHeaders(head);

      store.forEach((node) => {
        if (node.nodeId === nodeId) {
          setFormField(node.formField);
          setHeaderName(node.headerName);
          setAggregateCol(node.aggregate);
          setGroupBy(node.groupBy);
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
    setHeaderName([]);
    setHeaders([]);
    setGroupBy([]);
    setAggregateCol([
      {
        aggregate: 'Count',
        header: '',
        alias: '',
      },
    ]);
    getSourceData();
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

  const addFields = () => {
    const newfield = { header: '', aggregate: '', alias: '' };

    setAggregateCol([...aggregateCol, newfield]);
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

  const handleResetForm = () => {
    setFormField(INITIALSTATE);
  };

  const getDatabaseName = async () => {
    const findSrcNodeId = [];
    edges.forEach((el) => {
      if (el.target === nodeId) {
        findSrcNodeId.push(el.source);
      }
    });

    const sourceData = [];
    if (store && findSrcNodeId) {
      findSrcNodeId.forEach((item, i) => {
        store.forEach((node) => {
          if (node.nodeId === item) {
            sourceData.push(node.formField.alias);
          }
        });
      });
    }
    let database_name = '';

    sourceData.forEach((ele, id) => {
      if (id !== sourceData.length - 1) {
        database_name += `${ele} ,`;
      } else {
        database_name += `${ele} `;
      }
    });

    return database_name;
  };

  const createStatement = async () => {
    let statement = 'SELECT ';

    let length = 0;

    aggregateCol.forEach((el) => {
      statement += `${el.aggregate}(${el.header}) as ${el.alias} `;
      if (length < aggregateCol.length - 1) statement += ', ';
      length++;
    });

    length = 0;

    const database_name = await getDatabaseName();
    statement += `FROM ${database_name}`;

    if (groupBy.length > 0) {
      statement += ' GROUP BY ';

      groupBy.forEach((el) => {
        statement += `${el} `;
        if (length < groupBy.length - 1) statement += ', ';
        length++;
      });
    }

    return statement;
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
        // y_axis = `${parseInt(el.position.y, 10)}`;
        el.data.label = formField.alias;
      }
    });

    const newHeaderName = [];

    aggregateCol.forEach((item) => {
      newHeaderName.push({ header: item.header, alias: item.alias, tableAlias: formField.alias });
    });

    setHeaderName(newHeaderName);

    const statement = await createStatement();
    setFormField({ ...formField, statement });

    const sendFormData = {
      y_axis,
      nodeId,
      nodeName,
      formField: { ...formField, statement, db_name: 'default' },
      disabled: true,
      step_name: nodeName,
      headerName: newHeaderName,
      aggregate: aggregateCol,
      groupBy,
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
                <Button
                  type="submit"
                  size="small"
                  variant="contained"
                  disabled={disableForm}
                  className="button-color"
                  // onClick={handleFormsubmit}
                >
                  Submit
                </Button>
              </ButtonGroup>
            </Toolbar>
          </AppBar>

          <div style={{ margin: '20px' }}>
            <div style={{ marginBottom: '20px' }}>
              <InputField
                name="alias"
                label="Alias"
                value={formField.alias}
                onChange={handleInputChange}
                size="small"
                disabled={disableForm}
                required
              />
              &emsp;
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
                style={{ width: '30%', marginTop: '15px' }}
              >
                <MenuItem value="true">true</MenuItem>
                <MenuItem value="false">false</MenuItem>
              </TextField>
            </div>
            <Box
              style={{
                margin: '20px 0',
                display: 'flex',
                justifyContent: 'space-around',
                alignItems: 'center',
                backgroundColor: '#F9FAFB',
                padding: '20px 0',
              }}
            >
              <Typography variant="subtitle2" gutterBottom component="div">
                Aggregate Function
              </Typography>
              <Typography variant="subtitle2" gutterBottom component="div">
                Columns
              </Typography>
              <Typography variant="subtitle2" gutterBottom component="div">
                Alias
              </Typography>
            </Box>
            {aggregateCol.map((el, index) => {
              return (
                <Box
                  style={{
                    margin: '20px 0',
                    display: 'flex',
                    justifyContent: 'space-around',
                    alignItems: 'center',
                  }}
                  key={index}
                >
                  <TextField
                    id="outlined-basic"
                    select
                    disabled={disableForm}
                    variant="outlined"
                    name="aggregate"
                    value={el.aggregate}
                    onChange={(e) => handleAggregateChange(e, index, false)}
                    style={{ width: '25ch' }}
                    size="small"
                    required
                    label="Aggregate Function"
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
                    <MenuItem value="Sum">Sum</MenuItem>
                    <MenuItem value="Count">Count</MenuItem>
                    <MenuItem value="Min">Min</MenuItem>
                    <MenuItem value="Max">Max</MenuItem>
                    <MenuItem value="Avg">Avg</MenuItem>
                  </TextField>

                  <Autocomplete
                    disablePortal
                    id="combo-box-demo"
                    value={el.header}
                    disabled={disableForm}
                    onChange={(event, newValue) => handleAggregateChange(event, index, true)}
                    options={headers}
                    sx={{ width: 200 }}
                    size="small"
                    renderInput={(params) => <TextField required {...params} label="Header" />}
                  />

                  <TextField
                    name="alias"
                    label="Alias"
                    sx={{ width: '200px !important' }}
                    value={el.alias}
                    onChange={(e) => handleAggregateChange(e, index, false)}
                    size="small"
                    disabled={disableForm}
                    required
                  />
                </Box>
              );
            })}

            <Box
              style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-evenly', alignItems: 'center' }}
            >
              <Button
                disabled={disableForm}
                variant="outlined"
                startIcon={<AddCircleOutlineIcon />}
                onClick={addFields}
              >
                Add Columns
              </Button>
            </Box>

            <FormControl sx={{ m: 1, width: 200 }}>
              <InputLabel id="demo-multiple-chip-label">Group By</InputLabel>
              <Select
                labelId="demo-multiple-chip-label"
                id="demo-multiple-chip"
                multiple
                size="small"
                value={groupBy}
                disabled={disableForm}
                onChange={handleGroupChange}
                input={<OutlinedInput id="select-multiple-chip" label="Group By" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => value && <Chip key={value} label={value} size="small" />)}
                  </Box>
                )}
                MenuProps={MenuProps}
                required
              >
                {headers.map((header, i) => {
                  return (
                    <MenuItem value={header.label} key={i} style={getStyles(header.label, groupBy, theme)}>
                      {header.label}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
          </div>
        </form>
      </Dialog>
    </div>
  );
};

export default NodeModal_Aggregate;
