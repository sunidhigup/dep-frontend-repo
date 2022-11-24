import { Box, Button, Modal, Stack, TextField } from '@mui/material';
import { makeStyles } from '@mui/styles';
import React, { useContext, useState } from 'react';
import { JobContext } from '../../context/JobProvider';

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
const JobModal = ({ openModal, handleCloseModal, checkData, job, setJob }) => {
  const classes = useStyles();
  // const {  } = useContext(JobContext);
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
              label="Job Name"
              id="jobName"
              value={job}
              onChange={(e) => setJob(e.target.value)}
            />

            <Stack>
              <Button variant="contained" className="button-color" sx={{ mr: 1 }} onClick={checkData}>
                Save
              </Button>
            </Stack>
          </div>
        </form>
      </Box>
    </Modal>
  );
};

export default JobModal;
