import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import {
  Button,
  Box,
  Typography,
  Toolbar,
  Dialog,
  Slide,
  IconButton,
  AppBar,
  ButtonGroup,
  MenuItem,
  TextField,
  TableContainer,
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableHead,
  Autocomplete,
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
      width: 250,
    },
  },
};

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="left" ref={ref} {...props} />;
});

const INITIALSTATE = {
  alias: '',
  join_conditions: '',
  select_cols: '',
  join_filter: '',
  persist: false,
  persist_type: '',
  action: '',
  distinct_rows: false,
  joins: {
    join1: '',
  },
  tables: {
    table1: '',
    table2: '',
  },
};

const NodeProperties_Join = ({ open, handleClose, nodeId, nodeName, getJoinProp, nodes, edges, changeNodeName }) => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [joinInputs, setJoinInputs] = useState([]);
  const [formField, setFormField] = useState(INITIALSTATE);
  const [disableForm, setDisableForm] = useState(false);
  const [personName, setPersonName] = useState([]);
  const [count, setCount] = useState({});
  const [combineHeader, setCombineHeader] = useState({});
  const [headerName, setHeaderName] = useState([]);
  const [fetchedHeader, setFetchedHeader] = useState([]);
  const [headerRow, setHeaderRow] = useState([]);

  const handleChange = (obj) => {
    const selectedIndex = headerRow.findIndex((object) => {
      return object.count === obj.count && object.row === obj.row;
    });

    if (selectedIndex === -1 && obj) {
      setHeaderRow([...headerRow, obj]);
    }

    if (selectedIndex !== -1 && obj) {
      setHeaderRow((current) =>
        current.map((object) => {
          if (object.count === obj.count && object.row === obj.row) {
            return { ...object, table1: obj.table1, table2: obj.table2 };
          }

          return object;
        })
      );
    }
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
          type: n.type ? n.type : 'string',
          deleted: n.deleted ? n.deleted : false,
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

  const getSourceData = () => {
    const findSrcNodeId = [];
    edges.forEach((el) => {
      if (el.target === nodeId) {
        findSrcNodeId.push(el.source);
      }
    });

    if (findSrcNodeId.length < 2) {
      handleClose();
      enqueueSnackbar('Connect at least 2 blocks', {
        variant: 'warning',
        autoHideDuration: 3000,
        anchorOrigin: { vertical: 'top', horizontal: 'right' },
      });
      return;
    }

    if (store && findSrcNodeId) {
      let fetchedCount;

      const sourceData = [];
      const countObj = {};
      let header = [];

      findSrcNodeId.forEach((item, i) => {
        store.forEach((node) => {
          if (node.nodeId === item) {
            sourceData.push(node.formField);
            header.push(...node.headerName);
          }
        });
        countObj[`count_${i + 1}`] = 1;
      });

      setCount(countObj);

      const newArr = [];

      header.forEach((el) => {
        const exist = el.header.split('.').length;

        if (exist === 2) {
          const head = el.header.split('.')[1];
          newArr.push({ ...el, header: head });
        } else {
          newArr.push({ ...el });
        }
      });

      if (newArr.length > 0) {
        header = newArr;
      }

      const uniqueArray = header;

      // const uniqueHeader = [];

      // const uniqueArray = header.filter((element) => {
      //   const isDuplicate = uniqueHeader.includes(element.header);

      //   if (!isDuplicate) {
      //     uniqueHeader.push(element.header);
      //     return true;
      //   }

      //   return false;
      // });

      const aliasHeader = [];

      uniqueArray.forEach((el) => {
        aliasHeader.push({
          ...el,
          header: el.alias ? `${el.tableAlias}.${el.alias}` : `${el.tableAlias}.${el.header}`,
          alias: el.alias ? '' : el.alias,
        });
      });

      setJoinInputs(sourceData);
      setFetchedHeader(aliasHeader);

      const headObj = {};
      headObj[`combine_header_3`] = aliasHeader.filter((el) => {
        if (el.tableAlias === sourceData[0].alias || el.tableAlias === sourceData[1].alias) {
          return el;
        }
      });

      for (let i = 2; i < sourceData.length; i++) {
        const indexHead = aliasHeader.filter((el) => {
          if (el.tableAlias === sourceData[i].alias) {
            return el;
          }
        });
        headObj[`combine_header_${i + 2}`] = headObj[`combine_header_${i + 1}`].concat(indexHead);
      }

      setCombineHeader(headObj);

      store.forEach((node) => {
        if (node.nodeId === nodeId) {
          setFormField(node.formField);
          setHeaderName(node.headerName);
          setFetchedHeader(node.fetchedHeader);
          setHeaderRow(node.onRow);
          if (node.count) fetchedCount = node.count;

          if (fetchedCount) {
            setCount(fetchedCount);
          }

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
    setHeaderRow([]);
    setCombineHeader({});
    setCount({});
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

    const tables = {};

    joinInputs.forEach((el, i) => {
      tables[`table${i + 1}`] = el.alias;
    });

    const joinCond = [];

    headerRow.forEach((el) => {
      joinCond.push(`${el.table1}=${el.table2}`);
    });

    const selectCols = [];

    headerName.forEach((el) => {
      selectCols.push(el.header);
    });

    const newHeaderName = [];

    headerName.forEach((item) => {
      newHeaderName.push({ ...item, tableAlias: formField.alias });
    });

    setHeaderName(newHeaderName);

    setFormField({
      ...formField,
      tables,
      join_conditions: joinCond.join(' and '),
      select_cols: selectCols.join(','),
    });

    const sendFormData = {
      y_axis,
      nodeId,
      nodeName,
      formField: { ...formField, tables, join_conditions: joinCond.join(' and '), select_cols: selectCols.join(',') },
      disabled: true,
      step_name: nodeName,
      headerName: newHeaderName,
      fetchedHeader,
      count,
      onRow: headerRow,
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

  const getHeader = (count, row, tableType) => {
    const findHeader = headerRow.find((el) => {
      if (el.count === count && el.row === row) {
        return el;
      }
    });

    let searchHeader;

    if (findHeader && tableType === 'table1') {
      searchHeader = fetchedHeader.find((el) => {
        if (el.header === findHeader.table1) return el;
      });
    }

    if (findHeader && tableType === 'table2') {
      searchHeader = fetchedHeader.find((el) => {
        if (el.header === findHeader.table2) return el;
      });
    }

    if (searchHeader) return searchHeader;
    return { header: '', alias: '', checked: true, tableAlias: '' };
  };

  const getCombineHeader = (count, row, combineHead) => {
    const findHeader = headerRow.find((el) => {
      if (el.count === count && el.row === row) {
        return el;
      }
    });

    let searchHeader;

    if (findHeader) {
      searchHeader = combineHeader[combineHead].find((el) => {
        if (el.header === findHeader.table1) return el;
      });
    }

    if (searchHeader) return searchHeader;
    return { header: '', alias: '', checked: true, tableAlias: '' };
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
            <Box style={{ display: 'flex', justifyContent: 'space-evenly', alignItems: 'center' }}>
              <h3>
                <span style={{ color: '#aaa' }}> Join Input 1 : </span> {joinInputs.length > 0 && joinInputs[0].alias}
              </h3>
              <TextField
                id="outlined-basic"
                select
                label="Join Type"
                variant="outlined"
                value={formField.joins.join1}
                onChange={(e) => {
                  setFormField({
                    ...formField,
                    joins: { ...formField.joins, join1: e.target.value },
                  });
                }}
                sx={{ width: '32ch' }}
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
                <MenuItem value="left">left</MenuItem>
                <MenuItem value="right">right</MenuItem>
                <MenuItem value="inner">inner </MenuItem>
                <MenuItem value="cross">cross</MenuItem>
                <MenuItem value="self">self</MenuItem>
              </TextField>
              <h3>
                <span style={{ color: '#aaa' }}>Join Input 2 : </span>
                {joinInputs.length > 0 && joinInputs[1].alias}
              </h3>
            </Box>
            {[...Array(count['count_1'])].map((el, i) => {
              return (
                <Box
                  key={i}
                  style={{ marginTop: '30px', display: 'flex', justifyContent: 'space-evenly', alignItems: 'center' }}
                >
                  <h3 style={{ fontWeight: 800 }}>On</h3>
                  <Autocomplete
                    disablePortal
                    id="combo-box-demo"
                    value={getHeader('count_1', `row${i + 1}`, 'table1')}
                    disabled={disableForm}
                    onChange={(event, newValue) => {
                      const selectedRow = headerRow.find((object) => {
                        return object.count === 'count_1' && object.row === `row${i + 1}`;
                      });
                      if (newValue) {
                        handleChange({
                          count: 'count_1',
                          row: `row${i + 1}`,
                          table1: newValue.header,
                          table2: selectedRow ? selectedRow.table2 : '',
                        });
                      } else if (selectedRow && selectedRow.table2 !== '') {
                        handleChange({
                          count: 'count_1',
                          row: `row${i + 1}`,
                          table1: '',
                          table2: selectedRow.table2,
                        });
                      } else {
                        const selectedRow = headerRow.filter((object) => {
                          return object.count !== 'count_1' && object.row !== `row${i + 1}`;
                        });
                        selectedRow ? setHeaderRow(selectedRow) : setHeaderRow([]);
                      }
                    }}
                    options={fetchedHeader.filter((option) => option.tableAlias === joinInputs[0].alias)}
                    getOptionLabel={(option) => option.header}
                    style={{ width: 200 }}
                    size="small"
                    renderInput={(params) => <TextField {...params} label="Table1 Column" />}
                  />
                  =
                  <Autocomplete
                    disablePortal
                    id="combo-box-demo"
                    value={getHeader('count_1', `row${i + 1}`, 'table2')}
                    disabled={disableForm}
                    onChange={(event, newValue) => {
                      const selectedRow = headerRow.find((object) => {
                        return object.count === 'count_1' && object.row === `row${i + 1}`;
                      });
                      if (newValue) {
                        handleChange({
                          count: 'count_1',
                          row: `row${i + 1}`,
                          table1: selectedRow ? selectedRow.table1 : '',
                          table2: newValue.header,
                        });
                      } else if (selectedRow && selectedRow.table1 !== '') {
                        handleChange({
                          count: 'count_1',
                          row: `row${i + 1}`,
                          table1: selectedRow.table1,
                          table2: '',
                        });
                      } else {
                        const selectedRow = headerRow.filter((object) => {
                          return object.count !== 'count_1' && object.row !== `row${i + 1}`;
                        });
                        selectedRow ? setHeaderRow(selectedRow) : setHeaderRow([]);
                      }
                    }}
                    options={fetchedHeader.filter((option) => option.tableAlias === joinInputs[1].alias)}
                    getOptionLabel={(option) => {
                      return option.header;
                    }}
                    sx={{ width: 200 }}
                    size="small"
                    renderInput={(params) => <TextField {...params} label="Table2 Column " />}
                  />
                </Box>
              );
            })}

            <Box style={{ marginTop: '30px', display: 'flex', justifyContent: 'space-evenly', alignItems: 'center' }}>
              <Button
                variant="outlined"
                startIcon={<AddCircleOutlineIcon />}
                onClick={() => setCount({ ...count, count_1: count['count_1'] + 1 })}
              >
                Add Join Condition
              </Button>
            </Box>

            {joinInputs.length > 0 &&
              joinInputs.map((item, i) => {
                if (i > 1) {
                  return (
                    <div key={i}>
                      <Box
                        style={{
                          marginTop: '30px',
                          display: 'flex',
                          justifyContent: 'space-evenly',
                          alignItems: 'center',
                        }}
                      >
                        <TextField
                          id="outlined-basic"
                          select
                          label="Join Type"
                          variant="outlined"
                          name={`table ${i}`}
                          value={formField['joins'][`join${i}`]}
                          onChange={(e) => {
                            setFormField({
                              ...formField,
                              joins: { ...formField.joins, [`join${i}`]: e.target.value },
                            });
                          }}
                          sx={{ width: '32ch' }}
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
                          <MenuItem value="left">left</MenuItem>
                          <MenuItem value="right">right</MenuItem>
                          <MenuItem value="inner">inner </MenuItem>
                          <MenuItem value="cross">cross</MenuItem>
                          <MenuItem value="self">self</MenuItem>
                        </TextField>

                        <h3>
                          <span style={{ color: '#aaa' }}>Join Input {i + 1} : </span>
                          {joinInputs.length > 0 && joinInputs[i].alias}
                        </h3>
                      </Box>

                      {[...Array(count[`count_${i}`])].map((el, j) => {
                        return (
                          <Box
                            key={j}
                            style={{
                              marginTop: '30px',
                              display: 'flex',
                              justifyContent: 'space-evenly',
                              alignItems: 'center',
                            }}
                          >
                            <h3 style={{ fontWeight: 800 }}>On</h3>
                            <Autocomplete
                              disablePortal
                              id="combo-box-demo"
                              value={getCombineHeader(`count_${i}`, `row${j + 1}`, `combine_header_${i + 1}`)}
                              disabled={disableForm}
                              onChange={(event, newValue) => {
                                const selectedRow = headerRow.find((object) => {
                                  return object.count === `count_${i}` && object.row === `row${j + 1}`;
                                });
                                if (newValue) {
                                  handleChange({
                                    count: `count_${i}`,
                                    row: `row${j + 1}`,
                                    table1: newValue.header,
                                    table2: selectedRow ? selectedRow.table2 : '',
                                  });
                                } else if (selectedRow && selectedRow.table2 !== '') {
                                  handleChange({
                                    count: `count_${i}`,
                                    row: `row${j + 1}`,
                                    table1: '',
                                    table2: selectedRow.table2,
                                  });
                                } else {
                                  const selectedRow = headerRow.filter((object) => {
                                    return object.count !== `count_${i}` && object.row !== `row${j + 1}`;
                                  });
                                  selectedRow ? setHeaderRow(selectedRow) : setHeaderRow([]);
                                }
                              }}
                              options={combineHeader[`combine_header_${i + 1}`]}
                              getOptionLabel={(option) => {
                                return option.header;
                              }}
                              sx={{ width: 200 }}
                              size="small"
                              renderInput={(params) => <TextField {...params} label="Columns" />}
                            />
                            =
                            <Autocomplete
                              disablePortal
                              id="combo-box-demo"
                              name={` Combine Headers ${i + 1}`}
                              value={getHeader(`count_${i}`, `row${j + 1}`, 'table2')}
                              disabled={disableForm}
                              onChange={(event, newValue) => {
                                const selectedRow = headerRow.find((object) => {
                                  return object.count === `count_${i}` && object.row === `row${j + 1}`;
                                });
                                if (newValue) {
                                  handleChange({
                                    count: `count_${i}`,
                                    row: `row${j + 1}`,
                                    table1: selectedRow ? selectedRow.table1 : '',
                                    table2: newValue.header,
                                  });
                                } else if (selectedRow && selectedRow.table1 !== '') {
                                  handleChange({
                                    count: `count_${i}`,
                                    row: `row${j + 1}`,
                                    table1: selectedRow.table1,
                                    table2: '',
                                  });
                                } else {
                                  const selectedRow = headerRow.filter((object) => {
                                    return object.count !== `count_${i}` && object.row !== `row${j + 1}`;
                                  });
                                  selectedRow ? setHeaderRow(selectedRow) : setHeaderRow([]);
                                }
                              }}
                              options={fetchedHeader.filter((option) => option.tableAlias === joinInputs[i].alias)}
                              getOptionLabel={(option) => {
                                return option.header;
                              }}
                              sx={{ width: 200 }}
                              size="small"
                              renderInput={(params) => <TextField {...params} label={`Table${i + 1} Column`} />}
                            />
                          </Box>
                        );
                      })}

                      <Box
                        style={{
                          marginTop: '30px',
                          display: 'flex',
                          justifyContent: 'space-evenly',
                          alignItems: 'center',
                        }}
                      >
                        <Button
                          variant="outlined"
                          startIcon={<AddCircleOutlineIcon />}
                          onClick={(e) => setCount({ ...count, [`count_${i}`]: count[`count_${i}`] + 1 })}
                        >
                          Add Join Condition
                        </Button>
                      </Box>
                    </div>
                  );
                }
              })}

            <Box
              component="form"
              sx={{
                '& .MuiTextField-root': { m: 3, width: '45ch' },
              }}
              noValidate
              autoComplete="off"
            >
              <InputField
                name="alias"
                label="Alias"
                value={formField.alias}
                onChange={handleInputChange}
                size="small"
                disabled={disableForm}
                required
              />
            </Box>

            <Box
              component="form"
              sx={{
                '& .MuiTextField-root': { m: 1, width: '32ch' },
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
                style={{ width: '30%' }}
              >
                <MenuItem value="true">true</MenuItem>
                <MenuItem value="false">false</MenuItem>
              </TextField>
            </Box>
            <TableContainer sx={{ maxHeight: 300, mt: 2 }}>
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
                                type: row.type ? row.type : 'string',
                                deleted: row.deleted ? row.deleted : false,
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
                              handleHeaderChange({
                                header: row.header,
                                alias: e.target.value,
                                checked: true,
                                type: row.type ? row.type : 'string',
                                deleted: row.deleted ? row.deleted : false,
                              })
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
          </div>
        </form>
      </Dialog>
    </div>
  );
};

export default NodeProperties_Join;
