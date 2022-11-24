import React, { useState, useContext, useEffect, memo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { IconButton, Modal, Stack, Switch, TableRow, Typography, Box, Button } from '@mui/material';

import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import { alpha, styled } from '@mui/material/styles';
import { useSnackbar } from 'notistack';

import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import LogsIcon from '@mui/icons-material/Storage';
import LoadingButton from '@mui/lab/LoadingButton';
import SaveIcon from '@mui/icons-material/Save';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SettingsIcon from '@mui/icons-material/Settings';

import Tooltip from '@mui/material/Tooltip';

import StopCircleIcon from '@mui/icons-material/StopCircle';
import CachedIcon from '@mui/icons-material/Cached';

import LoadingIcon from '../../reusable-components/LoadingIcon';

import { JobContext } from '../../context/JobProvider';
import { JobListContext } from '../../context/JobListProvider';
import { BatchContext } from '../../context/BatchProvider';
import { ClientContext } from '../../context/ClientProvider';

import { deleteJobApi, disableJobApi, enableJobApi, ApprovedfetchJobsApi, runJobApi } from "../../api's/JobApi";
import { createBatchidApi, fetchBatchidApi, getStepfunctionStatusApi } from "../../api's/BatchApi";
import {
  deleteFlowBuilderEdgesApi,
  deleteFlowBuilderFormApi,
  deleteFlowBuilderJobInputApi,
  deleteFlowBuilderJsonApi,
  deleteFlowBuilderNodesApi,
  getFlowBuilderEdgesApi,
  getFlowBuilderFormApi,
  getFlowBuilderNodesApi,
} from "../../api's/FlowBuilderApi";
import { createEmr, getEmrStatus, terminateEmr } from "../../api's/EmrApi";

const label = { inputProps: { 'aria-label': 'Switch demo' } };

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: '#fff',
  border: '1px solid #000',
  borderRadius: '10px',
  boxShadow: 24,
  p: 4,
};

const styleLoading = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
};

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  padding: '5px 10px',
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  '&:last-child td, &:last-child th': {
    border: 0,
  },
  padding: '5px 10px',
}));

const GreenSwitch = styled(Switch)(({ theme }) => ({
  '& .MuiSwitch-switchBase.Mui-checked': {
    color: '#0dd398',
    '&:hover': {
      backgroundColor: alpha('#0dd398', theme.palette.action.hoverOpacity),
    },
  },
  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
    backgroundColor: '#0dd398',
  },
}));

const StreamTableRow = ({ rowNo, source, chipData, countItem, clusterId, setClusterId }) => {
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  const { Job, setJob } = useContext(JobContext);
  const { batch } = useContext(BatchContext);
  const { client } = useContext(ClientContext);
  const { jobList, setJobList } = useContext(JobListContext);

  const [TotalJobItem, setTotalJobItem] = useState(0);

  const [jobStatus, setJobStatus] = useState('Loading...');
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [openBatchIdModal, setOpenBatchIdModal] = useState(false);
  const [openLoadingModal, setOpenLoadingModal] = useState(false);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [runDisabled, setRunDisabled] = useState(false);
  const [batchId, setBatchId] = useState(false);
  const [jobDisable, setJobDisable] = useState(false);
  const [includeRow, setincludeRow] = useState(false);
  const [status, setStatus] = useState('');
  const handleLoadingModalOpen = () => setOpenLoadingModal(true);

  const handleLoadingModalClose = () => setOpenLoadingModal(false);

  const handleDeleteModalOpen = () => setOpenDeleteModal(true);

  const handleDeleteModalClose = () => setOpenDeleteModal(false);

  const handleBatchIdModalOpen = () => setOpenBatchIdModal(true);

  const handleBatchIdModalClose = () => {
    setOpenBatchIdModal(false);
    setBatchId('');
  };

  const handleDeleteJob = async (e) => {
    e.preventDefault();
    setLoadingBtn(true);

    try {
      const deleteJob = await deleteJobApi(client.client_id, batch.batch_id, Job);

      const deleteForm = await deleteFlowBuilderFormApi(client.client_id, batch.batch_id, Job);

      const deleteNodes = await deleteFlowBuilderNodesApi(client.client_id, batch.batch_id, Job);

      const deleteEdges = await deleteFlowBuilderEdgesApi(client.client_id, batch.batch_id, Job);

      const deleteReadInput = await deleteFlowBuilderJobInputApi(client.client_id, batch.batch_id, Job);

      const deleteJson = deleteFlowBuilderJsonApi(batch.batch_name, Job);

      if (deleteJob.status === 200) {
        try {
          const res = await ApprovedfetchJobsApi(client.client_id, batch.batch_id);

          if (res.status === 200) {
            // createJobList(res);
            setJobList(res.data);
          }
        } catch (error) {
          setJobList([]);
        }

        enqueueSnackbar('Job Deleted Successfully!', {
          variant: 'success',
          autoHideDuration: 3000,
          anchorOrigin: { vertical: 'top', horizontal: 'right' },
        });
      }
    } catch (error) {
      if (error.response.status === 403) {
        enqueueSnackbar('You have only Read Permission !!', {
          variant: 'error',
          autoHideDuration: 3000,
          anchorOrigin: { vertical: 'top', horizontal: 'right' },
        });
      }
    }
    setLoadingBtn(false);
    handleDeleteModalClose();
  };

  const fetchJobNodes = async (job) => {
    handleLoadingModalOpen();

    if (Job !== job) {
      setJob(job);
      sessionStorage.removeItem('allNodes');
      sessionStorage.removeItem('node');
      sessionStorage.removeItem('elementCount');
      sessionStorage.removeItem('saved_node');
      sessionStorage.removeItem('edges');
    }
    let response;

    try {
      response = await getFlowBuilderNodesApi(batch.client_id, batch.batch_id, job);
    } catch (error) {
      if (error.response.status === 404) {
        handleLoadingModalClose();
        navigate(`/flow-builder/flow/${batch.batch_name}/${job}`);
      }
      return;
    }

    const getEdges = await getFlowBuilderEdgesApi(batch.client_id, batch.batch_id, job);

    const getNodesData = await getFlowBuilderFormApi(batch.client_id, batch.batch_id, job);

    let elemCount = 0;
    let nodes = '';
    let nodeData = '';
    let edges = '';

    if (response.status === 200 || getNodesData.status === 200) {
      nodes = response.data.nodes;

      nodes.forEach((el) => {
        if (el.type === 'editableNode') {
          el['id'] = `${el.id}_fetched`;
        }
      });

      nodeData = getNodesData.data.nodes;

      const newSavedElement = [];
      nodeData.forEach((el) => {
        el['nodeId'] = `${el.nodeId}_fetched`;
        elemCount++;
        newSavedElement.push(el.nodeId);
      });

      edges = getEdges.data.edges;

      edges.forEach((el) => {
        if (el.source && el.target) {
          el['id'] = `${el.id}_fetched`;
          el['source'] = `${el.source}_fetched`;
          el['target'] = `${el.target}_fetched`;
        }
      });

      sessionStorage.setItem('allNodes', JSON.stringify(nodeData));
      sessionStorage.setItem('elementCount', elemCount);
      sessionStorage.setItem('node', JSON.stringify(nodes));
      sessionStorage.setItem('edges', JSON.stringify(edges));
      sessionStorage.setItem('saved_node', JSON.stringify(newSavedElement));
      handleLoadingModalClose();
      navigate(`/flow-builder/flow/${batch.batch_name}/${job}`);
    }
  };

  const OpenLogsPage = (job) => {
    navigate(`/flow-builder/logs/step-logs/${batch.batch_name}`);
  };

  const openStreamConfig = (source) => {
    navigate('/real-time-streaming/steps', { state: source });
  };

  const sendToParentStatus = {
    jobStatus,
  };

  useEffect(() => {
    if (chipData.length === 0) {
      setTotalJobItem((count) => count + 1);
      countItem(sendToParentStatus);
      setincludeRow(true);
    } else {
      let isPresent = false;
      chipData.map((el) => {
        if (el.label === jobStatus) {
          isPresent = true;
        }
      });
      if (isPresent) {
        setincludeRow(true);
        countItem(sendToParentStatus);
      } else {
        setincludeRow(false);
      }
    }
  }, [chipData]);
  console.log(clusterId);
  console.log(source);

  const startStream = async (clusterName) => {
    const cluster = {
      clusterName,
    };

    console.log(cluster)
    const response = await createEmr(cluster);

    if (response.status === 200) {
      enqueueSnackbar('Creating EMR cluster!', {
        variant: 'success',
        autoHideDuration: 3000,
        anchorOrigin: { vertical: 'top', horizontal: 'right' },
      });

      const tempClusterId = [...clusterId];

      tempClusterId[rowNo] = response.data;
      setClusterId(tempClusterId);
    }
  };

  const terminateStream = async () => {
    const response = await terminateEmr(clusterId[rowNo]);
    if (response.status === 200) {
      enqueueSnackbar('Terminating EMR cluster!', {
        variant: 'success',
        autoHideDuration: 3000,
        anchorOrigin: { vertical: 'top', horizontal: 'right' },
      });
      const tempClusterId = [...clusterId];

      tempClusterId[rowNo] = '';
      setClusterId(tempClusterId);
    }
  };

  const fetchEmrStatus = async () => {
    const clusterName = `${client.client_name}_${source}`;
    const response = await getEmrStatus(clusterId[rowNo], clusterName);

    if (response.status === 200) {
      setStatus(response.data.status);
      const tempClusterId = [...clusterId];

      tempClusterId[rowNo] = response.data.clusterId;
      setClusterId(tempClusterId);
    }
  };
  useEffect(() => {
    fetchEmrStatus();
  }, [source, clusterId[rowNo]]);

  return (
    <>
      {includeRow && (
        <>
          <StyledTableRow>
            <StyledTableCell align="center">{source}</StyledTableCell>
            <StyledTableCell align="center">
              <Tooltip title="Disable/Enable Job">
                <IconButton>
                  <GreenSwitch {...label} checked={source.active} size="small" />
                </IconButton>
              </Tooltip>

              {status === 'RUNNING' || status === 'STARTING' || status === 'WAITING' ? (
                <Tooltip title="Terminate Stream">
                  <IconButton color="error" onClick={terminateStream} disabled={status === 'TERMINATING'}>
                    <StopCircleIcon sx={{ fontSize: '1rem' }} />
                  </IconButton>
                </Tooltip>
              ) : (
                <Tooltip title="Start Stream">
                  <IconButton
                    color="warning"
                    onClick={() => startStream(`${client.client_name}_${source}`)}
                    disabled={status === 'TERMINATING'}
                  >
                    <PlayArrowIcon sx={{ fontSize: '1rem' }} />
                  </IconButton>
                </Tooltip>
              )}
            </StyledTableCell>
            <StyledTableCell>
              <Tooltip title="flow">
                <IconButton onClick={() => openStreamConfig(source)} color="success">
                  <SettingsIcon sx={{ fontSize: '1rem' }} />
                </IconButton>
              </Tooltip>
            </StyledTableCell>
            <StyledTableCell
              align="center"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                <Tooltip title="Refresh">
                  <IconButton color="success" onClick={fetchEmrStatus}>
                    <CachedIcon sx={{ fontSize: '1rem' }} />
                  </IconButton>
                </Tooltip>
                <p>{status}</p>
              </div>
            </StyledTableCell>
          </StyledTableRow>
        </>
      )}
      <Modal
        open={openDeleteModal}
        onClose={handleDeleteModalClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          Are you sure you want to delete this job?
          <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
            <Button
              variant="outlined"
              color="secondary"
              type="submit"
              onClick={handleDeleteModalClose}
              className="outlined-button-color"
              disabled={loadingBtn}
            >
              Cancel
            </Button>

            {!loadingBtn ? (
              <Button
                variant="contained"
                color="secondary"
                type="submit"
                onClick={handleDeleteJob}
                className="button-color"
              >
                Delete
              </Button>
            ) : (
              <LoadingButton loading loadingPosition="start" startIcon={<SaveIcon />} variant="outlined" sx={{ mt: 2 }}>
                Delete
              </LoadingButton>
            )}
          </Stack>
        </Box>
      </Modal>
      <Modal
        open={openBatchIdModal}
        onClose={handleBatchIdModalClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="transition-modal-title" variant="h6" component="h2">
            Running Job Batch_id -
          </Typography>
          <Typography id="transition-modal-description" sx={{ mt: 2, fontWeight: 'bold' }}>
            {batchId}
          </Typography>
          <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
            <Button
              variant="contained"
              color="secondary"
              type="submit"
              onClick={handleBatchIdModalClose}
              className="button-color"
            >
              Close
            </Button>
          </Stack>
        </Box>
      </Modal>
      <Modal open={openLoadingModal} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description">
        <Box sx={styleLoading}>
          <LoadingIcon />
        </Box>
      </Modal>
    </>
  );
};

export default memo(StreamTableRow);
