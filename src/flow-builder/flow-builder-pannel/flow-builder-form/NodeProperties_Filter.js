import React, { useState, useEffect, memo } from 'react';
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
  TableContainer,
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableHead,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
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

const NodeProperties_Filter = ({ open, handleClose, nodeId, nodeName, nodes, edges, changeNodeName }) => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [formField, setFormField] = useState(INITIALSTATE);
  const [disableForm, setDisableForm] = useState(false);
  const [headerName, setHeaderName] = useState([]);
  const [fetchedHeader, setFetchedHeader] = useState([]);

  const handleHeaderChange = (obj) => {
    const selectedIndex = headerName.findIndex((object) => {
      return object.header === obj.header;
    });

    if (selectedIndex === -1 && obj.checked) {
      setHeaderName([...headerName, obj]);

      setFetchedHeader((current) =>
        current.map((object) => {
          if (object.header === obj.header) {
            return {
              header: obj.header,
              alias: obj.alias,
              checked: true,
              filter: obj.filter,
              op: obj.op,
              clause: obj.clause,
            };
          }

          return object;
        })
      );
    }

    if (selectedIndex !== -1 && obj.checked) {
      setHeaderName((current) =>
        current.map((object) => {
          if (object.header === obj.header) {
            return {
              ...object,
              header: obj.header,
              alias: obj.alias,
              filter: obj.filter,
              op: obj.op,
              clause: obj.clause,
            };
          }

          return object;
        })
      );

      setFetchedHeader((current) =>
        current.map((object) => {
          if (object.header === obj.header) {
            return {
              ...object,
              header: obj.header,
              alias: obj.alias,
              filter: obj.filter,
              op: obj.op,
              clause: obj.clause,
            };
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
            return { ...object, checked: false, alias: '', filter: '', op: '', clause: '' };
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
          filter: '',
          op: '',
          clause: '',
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

      const filterArray = uniqueArray.map((el) => {
        return { ...el, header: el.alias ? el.alias : el.header, alias: el.alias ? '' : el.alias, filter: '' };
      });

      setFetchedHeader(filterArray);

      store.forEach((node) => {
        if (node.nodeId === nodeId) {
          setFormField(node.formField);
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
    statement += ` FROM ${database_name} WHERE `;

    headerName.forEach((ele, idx) => {
      if (ele.filter) {
        statement += `${ele.header} ${ele.op} ${ele.filter} `;

        if (ele.clause) {
          statement += `${ele.clause} `;
        } else {
          statement += 'AND ';
        }
      }
    });

    const newStatement = statement.substring(0, statement.length - 4);
    formField.statement = newStatement;
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
                        checked={fetchedHeader.length === headerName.length}
                        onChange={handleSelectAllClick}
                        disabled={disableForm}
                      />
                      Select Columns
                    </TableCell>
                    <TableCell>Columns</TableCell>
                    <TableCell>Condition</TableCell>
                    <TableCell>Alias</TableCell>
                    <TableCell>Clause</TableCell>
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
                                filter: '',
                                op: '',
                                clause: '',
                                type: row.type ? row.type : 'string',
                                deleted: row.deleted ? row.deleted : false,
                              })
                            }
                            inputProps={{ 'aria-label': 'controlled' }}
                          />
                        </TableCell>
                        <TableCell>{row.header}</TableCell>
                        <TableCell style={{ display: 'flex' }}>
                          <FormControl>
                            {/* <InputLabel id="demo-simple-select-label">Age</InputLabel> */}
                            <Select
                              labelId="demo-simple-select-label"
                              id="demo-simple-select"
                              value={row.op}
                              label=""
                              size="small"
                              disabled={disableForm}
                              style={{ width: '60px' }}
                              onChange={(e) =>
                                handleHeaderChange({
                                  header: row.header,
                                  alias: row.alias,
                                  checked: true,
                                  filter: row.filter,
                                  op: e.target.value,
                                  clause: row.clause,
                                  type: row.type ? row.type : 'string',
                                  deleted: row.deleted ? row.deleted : false,
                                })
                              }
                            >
                              <MenuItem value=">">&#62;</MenuItem>
                              <MenuItem value=">=">&ge;</MenuItem>
                              <MenuItem value="<">&#60;</MenuItem>
                              <MenuItem value="<=">&le;</MenuItem>
                              <MenuItem value="=">&#9868;</MenuItem>
                              <MenuItem value="!=">&ne;</MenuItem>
                              <MenuItem value="not in">not in</MenuItem>
                              <MenuItem value="in">in</MenuItem>
                              <MenuItem value="is">is</MenuItem>
                            </Select>
                          </FormControl>

                          <TextField
                            name="filter"
                            label="Filter Condition"
                            multiline
                            value={row.filter}
                            style={{ marginLeft: '20px' }}
                            onChange={(e) =>
                              handleHeaderChange({
                                header: row.header,
                                alias: row.alias,
                                checked: true,
                                filter: e.target.value,
                                op: row.op,
                                clause: row.clause,
                                type: row.type ? row.type : 'string',
                                deleted: row.deleted ? row.deleted : false,
                              })
                            }
                            size="small"
                            disabled={disableForm}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            name="alias"
                            label="Alias"
                            value={row.alias}
                            onChange={(e) =>
                              handleHeaderChange({
                                header: row.header,
                                alias: e.target.value,
                                checked: true,
                                filter: row.filter,
                                op: row.op,
                                clause: row.clause,
                                type: row.type ? row.type : 'string',
                                deleted: row.deleted ? row.deleted : false,
                              })
                            }
                            size="small"
                            disabled={disableForm}
                          />
                        </TableCell>
                        <TableCell style={{ display: 'flex' }}>
                          <FormControl>
                            {/* <InputLabel id="demo-simple-select-label">Age</InputLabel> */}
                            <Select
                              labelId="demo-simple-select-label"
                              id="demo-simple-select"
                              value={row.clause}
                              label=""
                              size="small"
                              disabled={disableForm}
                              style={{ width: '80px' }}
                              onChange={(e) =>
                                handleHeaderChange({
                                  header: row.header,
                                  alias: row.alias,
                                  checked: true,
                                  filter: row.filter,
                                  op: row.op,
                                  clause: e.target.value,
                                  type: row.type ? row.type : 'string',
                                  deleted: row.deleted ? row.deleted : false,
                                })
                              }
                            >
                              <MenuItem value="AND">AND</MenuItem>
                              <MenuItem value="OR">OR</MenuItem>
                            </Select>
                          </FormControl>
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

export default memo(NodeProperties_Filter);
