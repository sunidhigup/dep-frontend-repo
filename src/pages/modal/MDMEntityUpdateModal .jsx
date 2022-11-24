import { Box, Button, FormControl, InputLabel, MenuItem, Modal, Select, Stack, TextField } from '@mui/material';
import { makeStyles } from '@mui/styles';
import React, { useContext, useState } from 'react';

const useStyles = makeStyles({
  formStyle: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px 0',
  },
  formDiv: {
    width: '600px',
  },
});

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};
const MDMEntityUpdateModal = ({
  openModal,
  handleCloseModal,
  editAttributeObject,
  setEditAttributeObject,
  updateEntityAction,
}) => {
  const classes = useStyles();
  return (
    <Modal
      open={openModal}
      onClose={handleCloseModal}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={style}>
        <form className={classes.formStyle} autoComplete="off">
          <div className={classes.formDiv}>
            <TextField
              style={{ marginBottom: '10px' }}
              fullWidth
              label="Label"
              id="label"
              value={editAttributeObject && editAttributeObject.label}
              onChange={(e) => setEditAttributeObject({ ...editAttributeObject, label: e.target.value })}
            />
            <TextField
              style={{ marginBottom: '10px' }}
              fullWidth
              label="Name"
              id="name"
              value={editAttributeObject && editAttributeObject.name}
              onChange={(e) => setEditAttributeObject({ ...editAttributeObject, name: e.target.value })}
            />
            <TextField
              style={{ marginBottom: '10px' }}
              fullWidth
              label="Type"
              id="type"
              value={editAttributeObject && editAttributeObject.type}
              onChange={(e) => setEditAttributeObject({ ...editAttributeObject, type: e.target.value })}
            />
            <FormControl fullWidth style={{ marginBottom: '10px' }}>
              <InputLabel id="demo-simple-select-label">Required</InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                label="Required"
                value={editAttributeObject && String(editAttributeObject.required)}
                onChange={(e) =>
                  setEditAttributeObject({ ...editAttributeObject, required: e.target.value === 'true' })
                }
              >
                <MenuItem value={'true'}>True</MenuItem>
                <MenuItem value={'false'}>False</MenuItem>
              </Select>
            </FormControl>

            <Stack>
              <Button variant="contained" className="button-color" sx={{ mr: 1 }} onClick={() => updateEntityAction()}>
                Update
              </Button>
            </Stack>
          </div>
        </form>
      </Box>
    </Modal>
  );
};

export default MDMEntityUpdateModal;
