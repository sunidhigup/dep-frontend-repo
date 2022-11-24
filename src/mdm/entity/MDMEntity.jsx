import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  tableCellClasses,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { styled } from '@mui/styles';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import DoneIcon from '@mui/icons-material/Done';
import React, { useEffect, useState } from 'react';

import { useNavigate, useParams } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { getMDMEntityEdge, getMDMEntityNode, getMDMFlowBuilderForm } from "../../api's/MDMApi";
import { addNewEntity, deleteEntity, getEntity } from "../../api's/EntityApi";
import MDMEntityTableRow from './MDMEntityTableRow';
import MDMEntityUpdateModal from '../../pages/modal/MDMEntityUpdateModal ';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: 'lightBlue',
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
    border: '1px solid',
  },
}));

const component = {
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: '#fff',
  borderRadius: '10px',
  overflow: 'hidden',
};
const MDMEntity = () => {
  const [entity, setEntity] = useState();
  const [attribute, setAttribute] = useState([]);
  const [attributeObject, setAttributeObject] = useState({
    label: '',
    name: '',
    type: '',
    required: false,
  });
  const [openModal, setOpen] = useState(false);
  const [editAttributeObject, setEditAttributeObject] = useState({
    label: '',
    name: '',
    type: '',
    required: false,
    index: -1,
  });

  const handleOpenEnityUpdate = () => setOpen(true);
  const handleCloseEnityUpdate = () => setOpen(false);

  const { enqueueSnackbar } = useSnackbar();

  const navigate = useNavigate();

  const updateEntity = async (attr) => {
    const updatedEntity = { ...entity, attribute: attr };
    const response = await addNewEntity(updatedEntity);

    return response.status;
  };
  const handleRequiredChange = (event) => {
    setAttributeObject({ ...attributeObject, required: event.target.value === 'true' });
  };

  const addAttributeHandle = () => {
    // setMyArray(oldArray => [...oldArray, newElement]);
    if (!attribute) {
      setAttribute([attributeObject]);
      updateEntity([attributeObject]);
    } else {
      setAttribute([...attribute, attributeObject]);
      updateEntity([...attribute, attributeObject]);
    }

    setAttributeObject({
      label: '',
      name: '',
      type: '',
      required: false,
    });
  };

  const { entityId } = useParams();
  const fetchEntity = async () => {
    const response = await getEntity(entityId);
    if (response.status === 200) {
      setEntity(response.data);
      setAttribute(response.data.attribute);
    }
  };

  const handleDeleteEntity = async () => {
    const response = await deleteEntity(entityId);

    if (response.status === 200) {
      enqueueSnackbar('Entity Deleted Successfully!', {
        variant: 'success',
        autoHideDuration: 3000,
        anchorOrigin: { vertical: 'top', horizontal: 'right' },
      });
      navigate('/mdm');
    }
  };

  const deleteAttributeAction = (i) => {
    let attr = attribute;

    attr = attr.filter((e, index) => index !== i);
    setAttribute(attr);
    const status = updateEntity(attr);
    if (status === 201) fetchEntity();
  };

  const updateEntityAction = () => {
    const attr = attribute;

    attr.splice(editAttributeObject.index, 1, {
      label: editAttributeObject.label,
      name: editAttributeObject.name,
      type: editAttributeObject.type,
      required: editAttributeObject.required,
    });

    setAttribute(attr);
    const status = updateEntity(attr);
    if (status === 201) fetchEntity();

    handleCloseEnityUpdate();
  };

  const handleMDMFlow = async () => {
    sessionStorage.removeItem('allNodes');
    sessionStorage.removeItem('node');
    sessionStorage.removeItem('elementCount');
    sessionStorage.removeItem('saved_node');
    sessionStorage.removeItem('edges');

    let response;

    try {
      response = await getMDMEntityNode(entity.entityName);
    } catch (error) {
      if (error.response.status === 404) {
        navigate(`/mdm/entity/${entity.entityId}/flow`, { state: { entity } });
      }
      return;
    }

    const getEdges = await getMDMEntityEdge(entity.entityName);

    const getNodesData = await getMDMFlowBuilderForm(entity.entityName);

    let elemCount = 0;
    let nodes = '';
    let nodeData = '';
    let edges = '';

    if (response.status === 200 || getNodesData.status === 200) {
      nodes = response.data.nodes;

      nodes.forEach((el) => {
        if (el.type === 'editableNode') {
          el['id'] = `${el.id}`;
        }
      });

      nodeData = getNodesData.data.nodes;

      const newSavedElement = [];
      nodeData.forEach((el) => {
        el['nodeId'] = `${el.nodeId}`;
        elemCount++;
        newSavedElement.push(el.nodeId);
      });

      edges = getEdges.data.edges;

      edges.forEach((el) => {
        if (el.source && el.target) {
          el['id'] = `${el.id}`;
          el['source'] = `${el.source}`;
          el['target'] = `${el.target}`;
        }
      });

      sessionStorage.setItem('allNodes', JSON.stringify(nodeData));
      sessionStorage.setItem('elementCount', elemCount);
      sessionStorage.setItem('node', JSON.stringify(nodes));
      sessionStorage.setItem('edges', JSON.stringify(edges));
      sessionStorage.setItem('saved_node', JSON.stringify(newSavedElement));

      navigate(`/mdm/entity/${entity.entityId}/flow`, { state: { entity } });
    }
  };
  useEffect(() => {
    fetchEntity();
  }, []);
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: 50 }}>
        <Typography variant="h4" align="center">
          {entity && entity.entityName}
        </Typography>
        <Tooltip title="Delete Entity">
          <Button variant="contained" color="error" onClick={handleDeleteEntity}>
            <DeleteForeverIcon />
          </Button>
        </Tooltip>

        <Tooltip title="Create Flow">
          <Button variant="contained" color="success" onClick={handleMDMFlow}>
            Create Flow
          </Button>
        </Tooltip>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: 10 }}>
        <TextField
          id="outlined-basic"
          label="Label"
          variant="outlined"
          value={attributeObject.label}
          onChange={(e) => {
            setAttributeObject({ ...attributeObject, label: e.target.value });
          }}
        />
        <TextField
          id="outlined-basic"
          label="Name"
          variant="outlined"
          value={attributeObject.name}
          onChange={(e) => {
            setAttributeObject({ ...attributeObject, name: e.target.value });
          }}
        />
        <TextField
          id="outlined-basic"
          label="Type"
          variant="outlined"
          value={attributeObject.type}
          onChange={(e) => {
            setAttributeObject({ ...attributeObject, type: e.target.value });
          }}
        />
        <FormControl style={{ width: 110 }}>
          <InputLabel id="demo-simple-select-label">Required</InputLabel>
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            label="Required"
            value={String(attributeObject.required)}
            onChange={handleRequiredChange}
          >
            <MenuItem value={'true'}>True</MenuItem>
            <MenuItem value={'false'}>False</MenuItem>
          </Select>
        </FormControl>
        <Tooltip title="Add Attribute">
          <Button variant="contained" className="button-color" sx={{ mr: 1 }} onClick={addAttributeHandle}>
            <DoneIcon />
          </Button>
        </Tooltip>
      </div>

      <TableContainer sx={{ minWidth: 700 }} aria-label="customized table">
        <Table>
          <TableHead>
            <TableRow>
              <StyledTableCell>Label</StyledTableCell>
              <StyledTableCell>Name</StyledTableCell>
              <StyledTableCell>Type</StyledTableCell>
              <StyledTableCell>Required</StyledTableCell>
              <StyledTableCell>Action</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {attribute &&
              attribute.map((e, i) => {
                return (
                  <MDMEntityTableRow
                    key={i}
                    rowAttribute={e}
                    handleOpenEnityUpdate={handleOpenEnityUpdate}
                    setEditAttributeObject={setEditAttributeObject}
                    deleteAttributeAction={deleteAttributeAction}
                    index={i}
                  />
                );
              })}
          </TableBody>
        </Table>
      </TableContainer>
      <MDMEntityUpdateModal
        openModal={openModal}
        handleCloseModal={handleCloseEnityUpdate}
        editAttributeObject={editAttributeObject}
        setEditAttributeObject={setEditAttributeObject}
        updateEntityAction={updateEntityAction}
      />
    </div>
  );
};

export default MDMEntity;
