import { LoadingButton } from '@mui/lab';
import { Box, Button } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useSnackbar } from 'notistack';
import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SaveIcon from '@mui/icons-material/Save';
import {
  createFlowBuilderEdgesApi,
  createFlowBuilderFormApi,
  createFlowBuilderJsonApi,
  createFlowBuilderNodesApi,
} from "../../api's/FlowBuilderApi";
import JobModal from '../../pages/modal/JobModal';
import { createStream } from "../../api's/StreamApi";
import { createJobApi } from "../../api's/JobApi";
import { JobContext } from '../../context/JobProvider';
import { AuthContext } from '../../context/AuthProvider';
import convertToRequiredFormat from '../JsonConverter';

const useStyles = makeStyles({
  BulderComponent: {
    display: 'flex',
    alignItems: 'center',
  },

  BuilderRightComponent: {
    padding: '10px',
    marginLeft: 'auto',
  },
});

const RealTimeFlowBuilderTop = ({ client, stream, resetElements, nodes, edges, userRole }) => {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const { enqueueSnackbar } = useSnackbar();

  const [loadBtn, setLoadBtn] = useState(false);
  const [newJob, setNewJob] = useState('');
  const navigate = useNavigate();

  const { Job, setJob } = useContext(JobContext);
  const { userId } = useContext(AuthContext);

  const checkData = (e) => {
    e.preventDefault();

    const getNodeData = JSON.parse(sessionStorage.getItem('saved_node'));

    const getElementCount = parseInt(sessionStorage.getItem('elementCount') || 0, 10);

    if (getElementCount <= 0) {
      enqueueSnackbar('Please add some steps before saving!!', {
        variant: 'error',
        autoHideDuration: 3000,
        anchorOrigin: { vertical: 'top', horizontal: 'right' },
      });
      // return;
    } else if (!getNodeData) {
      enqueueSnackbar('Please enter and submit some data for the dragged steps!!', {
        variant: 'error',
        autoHideDuration: 3000,
        anchorOrigin: { vertical: 'top', horizontal: 'right' },
      });
      // return;
    } else if (getNodeData.length !== getElementCount) {
      enqueueSnackbar('All nodes are not submitted. Please submit all nodes! ', {
        variant: 'error',
        autoHideDuration: 3000,
        anchorOrigin: { vertical: 'top', horizontal: 'right' },
      });
      // return;
    } else {
      Job && saveFormData();

      !Job && handleOpen();
    }
  };

  const saveJob = async () => {
    const data = {
      batch_name: stream.stream_name,
      client_name: stream.client_name,
      batch_id: stream.stream_id,
      client_id: client.client_id,
      status: 'approved',
      input_ref_key: newJob,
    };

    const response = await createJobApi(data, client.bucket_name);
    if (response.status === 201) {
      setJob(newJob);
      saveFormData();
    }

    handleClose();
  };

  const saveFormData = async () => {
    setLoadBtn(true);
    try {
      const getAllDataFromLocalStorage = JSON.parse(sessionStorage.getItem('allNodes'));

      getAllDataFromLocalStorage.sort((a, b) => a.y_axis - b.y_axis);

      const getNodeData = JSON.parse(sessionStorage.getItem('saved_node'));

      const getElementCount = parseInt(sessionStorage.getItem('elementCount'), 10) || '';

      if (getNodeData.length === getElementCount) {
        let count = 1;
        getAllDataFromLocalStorage.forEach((el) => {
          el.formField.step_no = count;
          el.step_name = `${el.step_name}_${count}`;
          count++;
        });

        const createFormData = {
          client_id: client.client_id,
          batch_id: stream.stream_id,
          batch: stream.stream_name,
          jobName: newJob || Job,
          nodes: getAllDataFromLocalStorage,
        };

        const createForm = createFlowBuilderFormApi(createFormData);

        const createNodesData = {
          client_id: client.client_id,
          batch_id: stream.stream_id,
          batch: stream.stream_name,
          nodes,
          jobName: newJob || Job,
        };

        const createNodes = await createFlowBuilderNodesApi(createNodesData);

        const createEdgesData = {
          client_id: client.client_id,
          batch_id: stream.stream_id,
          batch: stream.stream_name,
          edges,
          jobName: newJob || Job,
        };

        const createEdges = await createFlowBuilderEdgesApi(createEdgesData);

        getAllDataFromLocalStorage.sort((a, b) => a.formField.step_no - b.formField.step_no);

        const formData = convertToRequiredFormat(getAllDataFromLocalStorage);

        if (formData.steps[formData.steps.length - 1] === null) {
          formData.steps.pop();
        }

        const createFormJson = await createFlowBuilderJsonApi(
          client.client_name,
          stream.stream_name,
          newJob || Job,
          formData,
          'snowflake-garbageTID',
          'snowflake-garbageTS',
          client.bucket_name,
          client.data_region
        );
        // if (createFormJson.status === 201) {

        const data = {
          ...stream,
          jobFilePrefix: `${client.client_name}/${stream.stream_name}/${newJob || Job}/Data_Processor/Scripts/${
            newJob || Job
          }.json`,
        };

        const response = createStream(data, client.client_id, userId);
        // }
        if (createNodes.status === 200 || createNodes.status === 201) {
          // localStorage.removeItem('allNodes');
          // localStorage.removeItem('node');
          // localStorage.removeItem('elementCount');
          // localStorage.removeItem('saved_node');
          enqueueSnackbar('Steps and Data are saved!', {
            variant: 'success',
            autoHideDuration: 3000,
            anchorOrigin: { vertical: 'top', horizontal: 'right' },
          });
          // resetElements();
          setJob();
        }
      }

      handleClose();
      setLoadBtn(false);
    } catch (error) {
      if (error.response.status === 403) {
        enqueueSnackbar('You have only Read Permission !!', {
          variant: 'error',
          autoHideDuration: 3000,
          anchorOrigin: { vertical: 'top', horizontal: 'right' },
        });
      }
      setLoadBtn(false);
    }
  };

  const handleMouseEnter = (e) => {
    e.target.style.color = 'blue';
  };
  const handleMouseLeave = (e) => {
    e.target.style.color = 'black';
  };

  const classes = useStyles();
  return (
    <>
      <Box className={classes.BulderComponent}>
        <Box className={classes.BuilderRightComponent}>
          {!loadBtn ? (
            <Button
              variant="contained"
              size="small"
              onClick={checkData}
              className="button-color"
              disabled={userRole === 'ROLE_reader'}
            >
              Save
            </Button>
          ) : (
            <LoadingButton loading loadingPosition="start" startIcon={<SaveIcon />} variant="outlined" size="small">
              Save
            </LoadingButton>
          )}
        </Box>
      </Box>

      {!Job && (
        <JobModal openModal={open} handleCloseModal={handleClose} setJob={setNewJob} checkData={saveJob} job={newJob} />
      )}
    </>
  );
};

export default RealTimeFlowBuilderTop;
