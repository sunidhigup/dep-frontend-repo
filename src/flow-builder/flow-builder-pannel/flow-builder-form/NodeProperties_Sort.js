import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  TableContainer,
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableHead,
  Autocomplete,
  Box,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  MenuItem,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
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

const NodeProperties_Sort = ({ open, handleClose, nodeId, nodeName, nodes, edges, changeNodeName }) => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [formField, setFormField] = useState(INITIALSTATE);
  const [disableForm, setDisableForm] = useState(false);
  const [headerName, setHeaderName] = useState([]);
  const [fetchedHeader, setFetchedHeader] = useState([]);
  const [headers, setHeaders] = useState([]);

  const [sortingCol, setSortingCol] = useState([
    {
      header: '',
      sort: 'ascending',
      alias: '',
    },
  ]);

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
          alias: '',
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

      console.log(uniqueArray);

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
          setHeaderName(node.headerName);
          setFetchedHeader(node.fetchedHeader);
          setSortingCol(node.sorting);
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

  const handleSortChange = (event, index, dropdown) => {
    const data = [...sortingCol];

    if (dropdown) {
      data[index]['header'] = event.target.textContent;
    } else {
      data[index][event.target.name] = event.target.value;
    }

    setSortingCol(data);
  };

  const addFields = () => {
    const newfield = { header: '', sort: 'ascending', alias: '' };

    setSortingCol([...sortingCol, newfield]);
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
    const database_name = sourceData[0];

    return database_name;
  };

  const createStatement = async () => {
    let statement = 'SELECT ';

    headerName.forEach((ele, idx) => {
      if (idx !== headerName.length - 1) {
        if (ele.alias) {
          statement += `${ele.header} as ${ele.alias} ,`;
        } else {
          statement += `${ele.header} ,`;
        }
      } else if (idx === headerName.length - 1) {
        if (ele.alias) {
          statement += `${ele.header} as ${ele.alias}`;
        } else {
          statement += `${ele.header}`;
        }
      }
    });

    const database_name = await getDatabaseName();
    statement += ` FROM ${database_name} `;

    statement += ' ORDER BY ';
    sortingCol.forEach((ele, index) => {
      if (index === sortingCol.length - 1) {
        if (ele.sort === 'descending') {
          statement += `${ele.header} DESC`;

          // if (ele.alias === "") {

          // } else {

          //   statement += `${ele.header}  DESC`

          // }
        } else if (ele.sort === 'ascending') {
          statement += `${ele.header} ASC`;

          // if (ele.alias === "") {

          // } else {

          //   statement += `${ele.header}  ASC`

          // }
        }
      } else if (index !== sortingCol.length - 1) {
        if (ele.sort === 'descending') {
          statement += `${ele.header} DESC ,`;

          // if (ele.alias === "") {

          // } else {

          //   statement += `${ele.header}  DESC ,`

          // }
        } else if (ele.sort === 'ascending') {
          statement += `${ele.header} ASC ,`;

          // if (ele.alias === "") {

          // } else {

          //   statement += `${ele.header}  ASC ,`

          // }
        }
      }
    });

    formField.statement = statement;
    formField.db_name = 'default';
  };

  const handleFormsubmit = async (e) => {
    e.preventDefault();

    await createStatement();

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

    headerName.forEach((item) => {
      newHeaderName.push({ ...item, tableAlias: formField.alias });
    });

    setHeaderName(newHeaderName);

    const sendFormData = {
      y_axis,
      nodeId,
      nodeName,
      formField,
      disabled: true,
      step_name: nodeName,
      headerName: newHeaderName,
      fetchedHeader,
      sorting: sortingCol,
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
                Columns
              </Typography>
              <Typography variant="subtitle2" gutterBottom component="div">
                Sort By
              </Typography>
              {/* <Typography variant="subtitle2" gutterBottom component="div">
                Alias
              </Typography> */}
            </Box>
            {sortingCol.map((el, index) => {
              return (
                <Box
                  style={{
                    margin: '20px 0',
                    display: 'flex',
                    justifyContent: 'space-evenly',
                    alignItems: 'center',
                    marginRight: '20px',
                  }}
                  key={index}
                >
                  <Autocomplete
                    disablePortal
                    id="combo-box-demo"
                    value={el.header}
                    disabled={disableForm}
                    onChange={(event, newValue) => handleSortChange(event, index, true)}
                    options={headers}
                    sx={{ width: 200 }}
                    size="small"
                    renderInput={(params) => <TextField {...params} label="Header" />}
                  />

                  <FormControl>
                    <RadioGroup
                      row
                      aria-labelledby="demo-radio-buttons-group-label"
                      name="sort"
                      value={el.sort}
                      onChange={(e) => handleSortChange(e, index, false)}
                    >
                      <FormControlLabel
                        disabled={disableForm}
                        value="ascending"
                        control={<Radio />}
                        label="Ascending"
                      />
                      <FormControlLabel
                        disabled={disableForm}
                        value="descending"
                        control={<Radio />}
                        label="Descending"
                      />
                    </RadioGroup>
                  </FormControl>

                  {/* <TextField
                    name="alias"
                    label="Alias"
                    sx={{ width: '200px !important' }}
                    value={el.alias}
                    onChange={(e) => handleSortChange(e, index, false)}
                    size="small"
                    disabled={disableForm}
                  /> */}
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
            <TableContainer sx={{ maxHeight: 300 }}>
              <Table stickyHeader aria-label="sticky table">
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <Checkbox
                        color="primary"
                        disabled={disableForm}
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
          </div>
        </form>
      </Dialog>
    </div>
  );
};

export default NodeProperties_Sort;
