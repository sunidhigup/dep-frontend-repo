import { Box, Button, Paper } from '@mui/material';
import { useSnackbar } from 'notistack';
import React, { useEffect, useState } from 'react';
import { addNewEntity, getAllEntity } from "../../api's/EntityApi";

import CreateMDMModal from '../../pages/modal/CreateMDMModal';
import EntityTable from './EntityTable';
import EntityTop from './EntityTop';

const component = {
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: '#fff',
  borderRadius: '10px',
  overflow: 'hidden',
};

const Entity = () => {
  const [open, setOpen] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const [entityName, setEntityName] = useState('');
  const [listEntity, setListEntity] = useState([]);

  const handleSetEntityName = (name) => {
    setEntityName(name);
  };

  const addEntity = async () => {
    const entity = {
      entityName,
    };
    try {
      const response = await addNewEntity(entity);

      if (response.status === 201) fetchAllEntities();
    } catch (error) {
      if (error.response.status === 409) {
        enqueueSnackbar('This Entity Already Exist!', {
          variant: 'Error',
          autoHideDuration: 3000,
          anchorOrigin: { vertical: 'top', horizontal: 'right' },
        });
      }
    }

    handleClose();
  };

  const fetchAllEntities = async () => {
    const response = await getAllEntity();
    if (response.status === 200) setListEntity(response.data);
  };
  useEffect(() => {
    fetchAllEntities();
  }, []);

  return (
    <Paper>
      <Box style={component}>
        <EntityTop handleOpen={handleOpen} />
      </Box>
      <EntityTable listEntity={listEntity} />
      <CreateMDMModal
        open={open}
        handleClose={handleClose}
        handleSetEntityName={handleSetEntityName}
        addEntity={addEntity}
      />
    </Paper>
  );
};

export default Entity;
