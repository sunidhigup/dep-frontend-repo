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
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import InputField from '../../reusable-components/InputField';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="left" ref={ref} {...props} />;
});

const INITIALSTATE = {
  alias: '',
  fuzzy_match: [],
  exact_match: [],
  threshold: 0,
  algo: '',
};

const NodeProperties_Join = ({ open, handleClose, nodeId, nodeName, getJoinProp, nodes, edges, changeNodeName }) => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [formField, setFormField] = useState(INITIALSTATE);
  const [disableForm, setDisableForm] = useState(false);
  const [fuzzyMatch, setFuzzyMatch] = useState([{ match: '' }]);
  const [exactMatch, setExactMatch] = useState([{ match: '' }]);

  const store = JSON.parse(sessionStorage.getItem('allNodes'));

  const getSourceData = () => {
    if (store) {
      store.forEach((node) => {
        if (node.nodeId === nodeId) {
          setFormField(node.formField);
          setExactMatch(node.exactMatch);
          setFuzzyMatch(node.fuzzyMatch);

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
    setFuzzyMatch([]);
    setExactMatch([]);
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

    const exact_match = [];

    exactMatch.forEach((el) => {
      exact_match.push(el.match);
    });

    const fuzzy_match = [];

    fuzzyMatch.forEach((el) => {
      fuzzy_match.push(el.match);
    });

    setFormField({
      ...formField,
      exact_match,
      fuzzy_match,
    });

    const sendFormData = {
      y_axis,
      nodeId,
      nodeName,
      formField: { ...formField, exact_match, fuzzy_match },
      disabled: true,
      step_name: nodeName,
      exactMatch,
      fuzzyMatch,
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

  const handleAddExactMatch = () => {
    setExactMatch([...exactMatch, { match: '' }]);
  };

  const handleExactMatchChange = (e, index) => {
    const { name, value } = e.target;
    const list = [...exactMatch];

    list[index][name] = value;
    setExactMatch(list);
  };

  const handleAddFuzzyMatch = () => {
    setFuzzyMatch([...fuzzyMatch, { match: '' }]);
  };

  const handleFuzzyMatchChange = (e, index) => {
    const { name, value } = e.target;
    const list = [...fuzzyMatch];

    list[index][name] = value;
    setFuzzyMatch(list);
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
            <Box style={{ display: 'flex', justifyContent: 'space-evenly', alignItems: 'center', flexWrap: 'wrap' }}>
              {exactMatch.map((match, index) => (
                <InputField
                  name="match"
                  type="text"
                  label="Exact Match"
                  value={match.match}
                  onChange={(e) => handleExactMatchChange(e, index)}
                  size="small"
                  disabled={disableForm}
                  required
                />
              ))}
            </Box>
            <Box style={{ marginTop: '30px', display: 'flex', justifyContent: 'space-evenly', alignItems: 'center' }}>
              <Button
                variant="outlined"
                startIcon={<AddCircleOutlineIcon />}
                disabled={disableForm}
                onClick={handleAddExactMatch}
              >
                Add Exact Match
              </Button>
            </Box>

            <Box style={{ display: 'flex', justifyContent: 'space-evenly', alignItems: 'center', flexWrap: 'wrap' }}>
              {fuzzyMatch.map((match, index) => (
                <InputField
                  name="match"
                  type="text"
                  label="Fuzzy Match"
                  value={match.match}
                  onChange={(e) => handleFuzzyMatchChange(e, index)}
                  size="small"
                  disabled={disableForm}
                  required
                />
              ))}
            </Box>
            <Box style={{ marginTop: '30px', display: 'flex', justifyContent: 'space-evenly', alignItems: 'center' }}>
              <Button
                variant="outlined"
                startIcon={<AddCircleOutlineIcon />}
                disabled={disableForm}
                onClick={handleAddFuzzyMatch}
              >
                Add Fuzzy Match
              </Button>
            </Box>

            <Box
              component="form"
              sx={{
                '& > :not(style)': { m: 2, width: '30ch' },
              }}
              noValidate
              autoComplete="off"
            >
              <FormControl fullWidth>
                <InputLabel id="demo-simple-select-label">Algorithm</InputLabel>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  name="algo"
                  value={formField.algo}
                  label="Algorithm"
                  size="small"
                  required
                  disabled={disableForm}
                  onChange={handleInputChange}
                >
                  <MenuItem value="levenshtein">Levenshtein</MenuItem>
                  <MenuItem value="Soundex">Soundex</MenuItem>
                </Select>
              </FormControl>

              <InputField
                name="threshold"
                label="Threshold"
                type="number"
                required
                value={formField.threshold}
                onChange={handleInputChange}
                size="small"
                disabled={disableForm}
              />
              <InputField
                name="alias"
                label="Alias"
                type="text"
                required
                value={formField.alias}
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

export default NodeProperties_Join;
