import React, { useState, useEffect, memo, useCallback, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { useTheme } from '@mui/material/styles';
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
  TableContainer,
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableHead,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  OutlinedInput,
  Box,
  Chip,
  Tooltip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import InputField from '../../../reusable-components/InputField';
import { getCustomRuleApi } from "../../../api's/CustomRuleApi";
import { BatchContext } from '../../../context/BatchProvider';
import { ClientContext } from '../../../context/ClientProvider';

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
  alias: '',
  distinct_rows: false,
};

const NodeModal_DataCleansing = ({ open, handleClose, nodeId, nodeName, nodes, edges, changeNodeName }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();

  const { batch } = useContext(BatchContext);
  const { client } = useContext(ClientContext);

  const [formField, setFormField] = useState(INITIALSTATE);
  const [disableForm, setDisableForm] = useState(false);
  const [headerName, setHeaderName] = useState([]);
  const [fetchedHeader, setFetchedHeader] = useState([]);
  const [cleansingRules, setCleansingRules] = useState([]);
  const [customRules, setCustomRules] = useState([]);
  const [checkedCols, setCheckedCols] = useState([]);
  const [swap_Cols, setswap_Cols] = useState([]);
  const [delete_cols, setdelete_cols] = useState([]);
  const [initial_rules, setinitial_rules] = useState([]);
  const [temp_rules, settemp_rules] = useState([]);

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = cleansingRules.map((el) => {
        const all = {
          header: el.header,
          type: el.type || 'string',
          rulename: el.rulename,
          deleted: el.deleted,
          checked: false,
          selected: !el.deleted,
        };
        return all;
      });
      setCleansingRules(newSelecteds);
    } else {
      const newSelecteds = cleansingRules.map((el) => {
        const all = {
          header: el.header,
          type: el.type || 'string',
          rulename: el.rulename,
          deleted: el.deleted,
          checked: false,
          selected: false,
        };
        return all;
      });
      setCleansingRules(newSelecteds);
    }
  };

  const isSelected = (name) => {
    const selectedIndex = cleansingRules.findIndex((object) => {
      return object.header === name && object.selected;
    });
    return selectedIndex !== -1;
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

      uniqueArray.map((el) => {
        return { ...el, header: el.alias ? el.alias : el.header, alias: el.alias ? '' : el.alias };
      });

      const rulesHeader = [];

      uniqueArray.forEach((el) => {
        rulesHeader.push({
          header: el.alias ? el.alias : el.header,
          type: el.type || 'string',
          rulename: [],
          deleted: el.deleted || false,
          checked: false,
          selected: el.selected || false,
        });
      });

      setinitial_rules(rulesHeader);
      setCleansingRules(rulesHeader);
      // setFetchedHeader(uniqueArray);

      store.forEach((node) => {
        if (node.nodeId === nodeId) {
          setFormField(node.formField);
          setHeaderName(node.headerName);
          setinitial_rules(node.initial_rules);
          setCleansingRules(node.cleansingRules);

          if (node.disabled) {
            setDisableForm(node.disabled);
          }
        }
      });
    }
  };

  useEffect(() => {
    setCleansingRules([]);
    setFormField(INITIALSTATE);
    setDisableForm(false);
    setinitial_rules([]);
    setHeaderName([]);
    getSourceData();
  }, [nodeId]);

  const fetchCustomRule = useCallback(async () => {
    try {
      const response = await getCustomRuleApi(client.client_id, batch.batch_id);

      if (response.status === 200) {
        setCustomRules(response.data);
      }
    } catch (error) {
      // console.log(error);
    }
  }, []);

  useEffect(() => {
    fetchCustomRule();

    return () => {
      setCustomRules([]);
    };
  }, []);

  const addColumn = (name, index) => {
    const obj = {
      header: name,
      type: 'string',
      rulename: [],
      deleted: false,
      checked: false,
      selected: false,
    };
    const data = [...cleansingRules];
    data[index] = obj;
    setCleansingRules(data);
  };

  const swapColumns = () => {
    if (checkedCols.length === 2) {
      const index1 = checkedCols[0].index;
      const index2 = checkedCols[1].index;

      setswap_Cols([...swap_Cols, { swap_col_one: index1, swap_col_two: index2 }]);
      setCleansingRules((prevState) => {
        const data = [...prevState];
        data[index1]['checked'] = false;
        data[index2]['checked'] = false;

        [data[index1], data[index2]] = [data[index2], data[index1]];

        return data;
      });

      setCheckedCols([]);
    }
  };

  useEffect(() => {
    swapColumns();
  }, [checkedCols]);

  const handleSwapColumns = (obj) => {
    setCheckedCols([...checkedCols, obj]);
  };

  const handleChange = (event, index, rulename, checked) => {
    const {
      target: { value },
    } = event;

    const data = [...cleansingRules];

    if (rulename) {
      data[index]['rulename'] = typeof value === 'string' ? value.split(',') : value;
    } else if (checked) {
      data[index]['checked'] = true;
    } else if (event.target.name === 'selected') {
      data[index][event.target.name] = event.target.checked;
    } else {
      data[index][event.target.name] = event.target.value;
    }

    setCleansingRules(data);
  };

  const handleDeleteColumn = (event, index) => {
    const data = [...cleansingRules];

    data[index]['deleted'] = true;
    data[index]['selected'] = false;
    setdelete_cols([...delete_cols, index]);

    setCleansingRules(data);
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

  const handleResetForm = () => {
    setFormField(INITIALSTATE);
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

  const getTablesConnected = async () => {
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
    const database_name = sourceData[0];

    return database_name;
  };

  const handleFormsubmit = async (e) => {
    e.preventDefault();

    const table_name = await getTablesConnected();

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

    cleansingRules.forEach((item) => {
      if (item.selected) {
        newHeaderName.push({ header: item.header, type: item.type, tableAlias: formField.alias });
      }
    });

    setHeaderName(newHeaderName);

    const newInitRule = [...initial_rules];

    cleansingRules.forEach((el) => {
      newInitRule.forEach((item) => {
        if (item.header === el.header) {
          item.type = el.type;
          item.rulename = el.rulename;
        }
      });
    });

    setinitial_rules(newInitRule);

    const sendFormData = {
      y_axis,
      nodeId,
      nodeName,
      formField,
      disabled: true,
      step_name: nodeName,
      headerName: newHeaderName,
      cleansingRules,
      initial_rules: newInitRule,
      customRules,
      table_name,
      swap_Cols,
      delete_cols,
      client_name: client['client_name'],
      batch_name: batch['batch_name'],
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
                <Button type="submit" size="small" variant="contained" disabled={disableForm} className="button-color">
                  Submit
                </Button>
              </ButtonGroup>
            </Toolbar>
          </AppBar>
          <div style={{ padding: '20px 30px' }}>
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
            <TableContainer sx={{ maxHeight: 400 }}>
              <Table stickyHeader aria-label="sticky table">
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <Checkbox
                        color="primary"
                        disabled={disableForm}
                        // checked={checkSelectAll}
                        onChange={handleSelectAllClick}
                      />
                      Select Columns
                    </TableCell>
                    <TableCell>Swap Columns</TableCell>
                    <TableCell>Headers</TableCell>
                    <TableCell>Field Type</TableCell>
                    <TableCell>Rulename</TableCell>
                    <TableCell>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {cleansingRules.map((row, index) => {
                    const isItemSelected = isSelected(row.header);
                    return (
                      <TableRow key={index}>
                        <TableCell>
                          <Checkbox
                            checked={isItemSelected}
                            name="selected"
                            disabled={disableForm || row.deleted}
                            onChange={(event) => handleChange(event, index, false, false)}
                            inputProps={{ 'aria-label': 'controlled' }}
                          />
                        </TableCell>
                        <TableCell>
                          <Checkbox
                            disabled={disableForm || row.deleted}
                            checked={row.checked}
                            onChange={(event) => {
                              handleChange(event, index, false, true);
                              handleSwapColumns({ index });
                            }}
                            inputProps={{ 'aria-label': 'controlled' }}
                          />
                        </TableCell>
                        <TableCell>
                          <div>{row.header}</div>
                        </TableCell>
                        <TableCell>
                          <TextField
                            id="outlined-basic"
                            select
                            disabled={disableForm || row.deleted}
                            variant="outlined"
                            name="type"
                            value={row.type}
                            onChange={(e) => handleChange(e, index, false, false)}
                            sx={{ m: 1 }}
                            size="small"
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
                            <MenuItem value="integer">integer</MenuItem>
                            <MenuItem value="string">string</MenuItem>
                            <MenuItem value="float">float</MenuItem>
                            <MenuItem value="double">double</MenuItem>
                            <MenuItem value="datetime">datetime</MenuItem>
                            <MenuItem value="date">date</MenuItem>
                            <MenuItem value="time">time</MenuItem>
                          </TextField>
                        </TableCell>

                        <TableCell>
                          <FormControl sx={{ m: 1, width: 200 }}>
                            <InputLabel id="demo-multiple-chip-label">Rulename</InputLabel>
                            <Select
                              labelId="demo-multiple-chip-label"
                              id="demo-multiple-chip"
                              multiple
                              size="small"
                              value={row.rulename}
                              disabled={disableForm || row.deleted}
                              onChange={(e) => handleChange(e, index, true, false)}
                              input={<OutlinedInput id="select-multiple-chip" label="Rulename" />}
                              renderValue={(selected) => (
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                  {selected.map((value) => value && <Chip key={value} label={value} size="small" />)}
                                </Box>
                              )}
                              MenuProps={MenuProps}
                            >
                              {customRules.map((ele, i) => {
                                return (
                                  ele.type === row.type && (
                                    <MenuItem value={ele.rulename} key={i} style={getStyles(ele, ele.rulename, theme)}>
                                      {ele.rulename}
                                    </MenuItem>
                                  )
                                );
                              })}
                            </Select>
                          </FormControl>
                        </TableCell>
                        <TableCell align="left">
                          <Tooltip title={`Delete ${row.header}`} disabled={disableForm || row.deleted}>
                            <IconButton
                              color="error"
                              aria-label="upload picture"
                              component="span"
                              onClick={(e) => {
                                handleDeleteColumn(e, index);
                              }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </div>
        </form>
      </Dialog>
    </div>
  );
};

export default memo(NodeModal_DataCleansing);
