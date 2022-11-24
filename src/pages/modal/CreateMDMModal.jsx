import { Box, Button, Modal, Stack, TextField, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import React from 'react';

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

const CreateMDMModal = ({ open, handleClose, handleSetEntityName, addEntity }) => {
  const classes = useStyles();
  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={style}>
        <form className={classes.formStyle} autoComplete="off">
          <div className={classes.formDiv}>
            <TextField
              style={{ marginBottom: '10px' }}
              fullWidth
              label="Entity Name"
              id="entityName"
              onChange={(e) => handleSetEntityName(e.target.value)}
            />

            <Stack>
              <Button variant="contained" className="button-color" sx={{ mr: 1 }} onClick={addEntity}>
                Create
              </Button>
            </Stack>
          </div>
        </form>
      </Box>
    </Modal>
  );
};

export default CreateMDMModal;
