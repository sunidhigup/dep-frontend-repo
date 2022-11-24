import React, { useState, memo, useEffect } from 'react';
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
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useSnackbar } from 'notistack';
import InputField from '../../reusable-components/InputField';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="left" ref={ref} {...props} />;
});

const INITIALSTATE = {
  alias: '',
};

const NodeModal_AttributeSelection = ({
  open,
  handleClose,
  nodeId,
  nodeName,
  getProp,
  nodes,
  edges,
  changeNodeName,
  entity,
}) => {
  const { enqueueSnackbar } = useSnackbar();
  const [formField, setFormField] = useState(INITIALSTATE);
  const [attribute, setAttribute] = useState([]);
  const [disableForm, setDisableForm] = useState(false);
  const [loadingBtn, setLoadingBtn] = useState(false);

  const handleAttributeChange = (obj) => {
    setAttribute((current) =>
      current.map((object) => {
        if (object.attribute === obj.attribute) {
          return { ...object, rule: obj.rule, source: obj.source };
        }

        return object;
      })
    );
  };

  const store = JSON.parse(sessionStorage.getItem('allNodes'));

  const getLocalData = () => {
    setLoadingBtn(true);

    if (store) {
      const attribute = entity.attribute;
      const newAttribute = [];

      attribute &&
        attribute.forEach((el) => {
          const obj = {
            attribute: el.name,
            rule: '',
            source: '',
          };
          newAttribute.push(obj);
        });

      setAttribute(newAttribute);

      store.forEach((node) => {
        if (node.nodeId === nodeId) {
          setFormField(node.formField);
          setAttribute(node.attribute);

          if (node.disabled) {
            setDisableForm(node.disabled);
          }
        }
      });
    }
    setLoadingBtn(false);
  };

  useEffect(() => {
    setFormField(INITIALSTATE);
    setDisableForm(false);
    setAttribute([]);
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
      attribute,
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
                name="alias"
                label="Alias"
                value={formField.alias}
                onChange={handleInputChange}
                size="small"
                disabled={disableForm}
                required
              />
            </Box>

            {!loadingBtn && attribute && (
              <TableContainer sx={{ maxHeight: 300 }}>
                <Table stickyHeader aria-label="sticky table">
                  <TableHead>
                    <TableRow>
                      <TableCell>Attributes</TableCell>
                      <TableCell>Rule Type</TableCell>
                      <TableCell>Source Name</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {attribute &&
                      attribute.map((row, i) => {
                        return (
                          <TableRow key={i}>
                            <TableCell>{row.attribute}</TableCell>
                            <TableCell>
                              <TextField
                                id="outlined-basic"
                                select
                                label="Rule"
                                variant="outlined"
                                value={row.rule}
                                onChange={(e) => {
                                  handleAttributeChange({
                                    attribute: row.attribute,
                                    rule: e.target.value,
                                    source: row.source,
                                  });
                                }}
                                sx={{ width: '25ch' }}
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
                                <MenuItem value="frequency">Frequency Rule</MenuItem>
                                <MenuItem value="aggregation">Aggregation Rule</MenuItem>
                                <MenuItem value="source_system">Source System Rule</MenuItem>
                              </TextField>
                            </TableCell>
                            <TableCell>
                              {row.rule === 'source_system' && (
                                <InputField
                                  label="Source Name"
                                  sx={{ width: '32ch', marginTop: '0px !important' }}
                                  value={row.source}
                                  onChange={(e) => {
                                    handleAttributeChange({
                                      attribute: row.attribute,
                                      rule: row.rule,
                                      source: e.target.value,
                                    });
                                  }}
                                  size="small"
                                  disabled={disableForm}
                                  required
                                />
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </div>
        </form>
      </Dialog>
    </div>
  );
};

export default memo(NodeModal_AttributeSelection);
