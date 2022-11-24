import React, { useState, memo, useEffect, useContext } from 'react';
import {
  Button,
  ButtonGroup,
  Box,
  IconButton,
  MenuItem,
  TextField,
  Dialog,
  AppBar,
  Toolbar,
  Typography,
  Slide,
  TableContainer,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableHead,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useSnackbar } from 'notistack';
import InputField from '../../reusable-components/InputField';
import LoadingIcon from '../../reusable-components/LoadingIcon';
import { getCsvData } from "../../api's/TableRuleApi";
import { getAllEntity } from "../../api's/EntityApi";
import { ClientContext } from '../../context/ClientProvider';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="left" ref={ref} {...props} />;
});

const INITIALSTATE = {
  path: '',
  format: 'csv',
  alias: '',
  source: '',
  sourceId: '',
  entity: '',
  delimiter: ',',
  mapping: [],
};

const NodeModal_Read = ({ open, handleClose, nodeId, nodeName, nodes, edges, changeNodeName, entity }) => {
  const { enqueueSnackbar } = useSnackbar();
  const { client } = useContext(ClientContext);
  const [formField, setFormField] = useState(INITIALSTATE);
  const [disableForm, setDisableForm] = useState(false);
  const [fetchedHeader, setFetchedHeader] = useState([]);
  const [loadingBtn, setLoadingBtn] = useState(false);

  const [selectedEntity, setSelectedEntity] = useState({});

  const handleHeaderChange = (obj) => {
    let count = 0;
    fetchedHeader.forEach((e) => {
      if (e.mapping) count++;
    });

    if (count > entity.attribute.length) {
      enqueueSnackbar('All fields are Mapped! ', {
        variant: 'error',
        autoHideDuration: 3000,
        anchorOrigin: { vertical: 'top', horizontal: 'right' },
      });
      return;
    }

    let countMap = 0;

    fetchedHeader.forEach((el) => {
      if (el.mapping === obj.mapping) {
        countMap++;
      }
    });

    if (countMap > 1) {
      enqueueSnackbar('Already Mapped field! ', {
        variant: 'error',
        autoHideDuration: 3000,
        anchorOrigin: { vertical: 'top', horizontal: 'right' },
      });

      return;
    }

    if (countMap === 0) {
      setFetchedHeader((current) =>
        current.map((object) => {
          if (object.header === obj.header) {
            return { ...object, header: obj.header, mapping: obj.mapping, validation: obj.validation };
          }

          return object;
        })
      );
    } else if (countMap === 1 && obj.validation !== '') {
      setFetchedHeader((current) =>
        current.map((object) => {
          if (object.header === obj.header) {
            return { ...object, header: obj.header, mapping: obj.mapping, validation: obj.validation };
          }

          return object;
        })
      );
    } else {
      enqueueSnackbar('Already Mapped field! ', {
        variant: 'error',
        autoHideDuration: 3000,
        anchorOrigin: { vertical: 'top', horizontal: 'right' },
      });
    }
  };

  const store = JSON.parse(sessionStorage.getItem('allNodes'));

  const getLocalData = () => {
    if (store) {
      store.forEach((node) => {
        if (node.nodeId === nodeId) {
          setFormField(node.formField);
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
    setSelectedEntity({});
    setDisableForm(false);
    setFetchedHeader([]);
    setSelectedEntity(entity);
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

  function uuidv4() {
    let d = new Date().getTime();
    let d2 = (typeof performance !== 'undefined' && performance.now && performance.now() * 1000) || 0;
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      let r = Math.random() * 16;
      if (d > 0) {
        r = (d + r) % 16 || 0;
        d = Math.floor(d / 16);
      } else {
        r = (d2 + r) % 16 || 0;
        d2 = Math.floor(d2 / 16);
      }
      return (c === 'x' ? r : (r && 0x3) || 0x8).toString(16);
    });
  }

  // console.log(uuidv4());

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

    let y_axis;

    nodes.forEach((el) => {
      if (nodeId === el.id) {
        y_axis = parseInt(el.position.x, 10);
        // y_axis = `${parseInt(el.position.y, 10)}`;
        el.data.label = formField.alias;
      }
    });

    const mapping = [];

    fetchedHeader.forEach((item) => {
      const obj = {};

      if (item.mapping) {
        obj[`${item.header}`] = item.mapping;
        mapping.push(obj);
      }
    });

    const sendFormData = {
      y_axis,
      nodeId,
      nodeName,
      formField: { ...formField, entity: selectedEntity.entityName, mapping, sourceId: `${uuidv4()}` },
      disabled: true,
      step_name: nodeName,
      fetchedHeader,
      selectedEntity,
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

  const fetchFileHeaderCSV = async () => {
    const regex = /^s3:\/\/.*csv$/;
    if (!regex.test(formField.path)) {
      enqueueSnackbar('S3 path is invalid!', {
        variant: 'error',
        autoHideDuration: 3000,
        anchorOrigin: { vertical: 'top', horizontal: 'right' },
      });
      return;
    }

    // if (selectedEntity) {
    //   enqueueSnackbar('Please select Entity first!', {
    //     variant: 'error',
    //     autoHideDuration: 3000,
    //     anchorOrigin: { vertical: 'top', horizontal: 'right' },
    //   });
    //   return;
    // }

    setLoadingBtn(true);

    const pathArr = formField.path.split('/');
    pathArr.shift(0);
    pathArr.shift(0);
    pathArr.shift(0);
    const newPath = pathArr.join('/');

    try {
      const data = {
        path: newPath,
        client_id: client.client_id,
      };
      const response = await getCsvData(data);
      if (response.status === 200) {
        const header = [];

        response.data.forEach((el) => {
          header.push({
            header: el,
            mapping: '',
            validation: '',
          });
        });

        setFetchedHeader(header);
      }
    } catch (error) {
      enqueueSnackbar('S3 path is invalid!', {
        variant: 'error',
        autoHideDuration: 3000,
        anchorOrigin: { vertical: 'top', horizontal: 'right' },
      });
    }
    setLoadingBtn(false);
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
            <input type="hidden" value={nodeId} />

            <Box
              component="form"
              sx={{
                '& > :not(style)': { m: 2, width: '32ch' },
              }}
              noValidate
              autoComplete="off"
            >
              <InputField
                name="Entity"
                label="Entity"
                size="small"
                required
                value={selectedEntity && selectedEntity.entityName}
                disabled
              />
              <InputField
                name="path"
                label="Path"
                size="small"
                required
                disabled={disableForm}
                value={formField.path}
                onChange={handleInputChange}
              />
              <Button
                style={{ width: '100px' }}
                variant="outlined"
                onClick={fetchFileHeaderCSV}
                className="outlined-button-color"
              >
                Fetch
              </Button>
            </Box>

            {loadingBtn && (
              <Box>
                <LoadingIcon />
              </Box>
            )}

            {!loadingBtn && fetchedHeader && (
              <TableContainer sx={{ maxHeight: 300 }}>
                <Table stickyHeader aria-label="sticky table">
                  <TableHead>
                    <TableRow>
                      <TableCell>Columns</TableCell>
                      <TableCell>Mapping</TableCell>
                      <TableCell>Validation</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {fetchedHeader &&
                      fetchedHeader.map((row, i) => {
                        return (
                          <TableRow key={i}>
                            <TableCell>{row.header}</TableCell>
                            <TableCell>
                              <TextField
                                id="outlined-basic"
                                select
                                label="Map to"
                                variant="outlined"
                                value={row.mapping}
                                onChange={(e) => {
                                  handleHeaderChange({
                                    header: row.header,
                                    mapping: e.target.value,
                                    validation: '',
                                  });
                                }}
                                sx={{ width: '32ch' }}
                                size="small"
                                disabled={disableForm}
                                InputProps={{
                                  style: {
                                    fontFamily: "'EB Garamond', serif ",
                                    fontWeight: 600,
                                  },
                                }}
                                InputLabelProps={{ style: { fontFamily: "'EB Garamond', serif " } }}
                              >
                                {selectedEntity &&
                                  selectedEntity.attribute.map((item) => (
                                    <MenuItem value={item.name}>{item.name}</MenuItem>
                                  ))}
                              </TextField>
                            </TableCell>

                            {row.mapping && (
                              <TableCell>
                                <TextField
                                  id="outlined-basic"
                                  select
                                  label="Format"
                                  variant="outlined"
                                  required
                                  value={row.validation}
                                  onChange={(e) => {
                                    handleHeaderChange({
                                      header: row.header,
                                      mapping: row.mapping,
                                      validation: e.target.value,
                                    });
                                  }}
                                  name="format"
                                  sx={{ width: '32ch' }}
                                  size="small"
                                  disabled={disableForm}
                                  InputProps={{
                                    style: {
                                      fontFamily: "'EB Garamond', serif ",
                                      fontWeight: 600,
                                    },
                                  }}
                                  InputLabelProps={{ style: { fontFamily: "'EB Garamond', serif " } }}
                                >
                                  <MenuItem value="name_validation">name_validation</MenuItem>
                                  <MenuItem value="dob_validation">dob_validation</MenuItem>
                                  <MenuItem value="pan_validation">pan_validation</MenuItem>
                                  <MenuItem value="validate_email">validate_email</MenuItem>
                                  <MenuItem value="zipcode_validation">zipcode_validation</MenuItem>
                                  <MenuItem value="phone_validation">phone_validation</MenuItem>
                                </TextField>
                              </TableCell>
                            )}
                          </TableRow>
                        );
                      })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            <Box
              component="form"
              sx={{
                '& > :not(style)': { m: 2, width: '32ch' },
              }}
              noValidate
              autoComplete="off"
            >
              <InputField
                name="delimiter"
                label="Delimiter"
                required
                value={formField.delimiter}
                onChange={handleInputChange}
                size="small"
                disabled={disableForm}
              />
              <InputField
                name="alias"
                label="Alias"
                required
                value={formField.alias}
                onChange={handleInputChange}
                size="small"
                disabled={disableForm}
              />

              <InputField
                name="source"
                label="Source Name"
                required
                value={formField.source}
                onChange={handleInputChange}
                size="small"
                disabled={disableForm}
              />
            </Box>
          </div>
        </form>
      </Dialog>
    </div>
  );
};

export default memo(NodeModal_Read);
