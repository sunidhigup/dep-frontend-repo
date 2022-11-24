import React, { useState, useContext, useEffect, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IconButton,
  Stack,
  Switch,
  TableRow,
  Typography,
  Box,
  Button,
  Autocomplete,
  FormControl,
  InputLabel,
  MenuItem,
  TextField,
} from '@mui/material';

import MModal from '@mui/material/Modal';
import MSelect from '@mui/material/Select';
import { Form, Input, Modal, Radio, Select } from 'antd';

import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import { alpha, styled } from '@mui/material/styles';
import { useSnackbar } from 'notistack';

import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import LogsIcon from '@mui/icons-material/Storage';
import LoadingButton from '@mui/lab/LoadingButton';
import SaveIcon from '@mui/icons-material/Save';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import Tooltip from '@mui/material/Tooltip';
import RefreshIcon from '@mui/icons-material/Refresh';
import Error from '@mui/icons-material/Error';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DoNotDisturbOnIcon from '@mui/icons-material/DoNotDisturbOn';
import CancelIcon from '@mui/icons-material/Cancel';
import PendingIcon from '@mui/icons-material/Pending';
import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';

import LoadingIcon from '../reusable-components/LoadingIcon';

import { JobContext } from '../context/JobProvider';
import { JobListContext } from '../context/JobListProvider';
import { BatchContext } from '../context/BatchProvider';
import { ClientContext } from '../context/ClientProvider';
import { StreamContext } from '../context/StreamProvider';
import {
  deleteJobApi,
  disableJobApi,
  enableJobApi,
  runJobApi,
  fetchJobsAndStatusApi,
  updateJobRunTypeApi,
  updateExtractJobApi,
  fetchCurrentJobStatusApi,
} from "../api's/JobApi";
import { createBatchidApi, fetchBatchidApi, getStepfunctionStatusApi } from "../api's/BatchApi";
import {
  AllFilesOfS3,
  AllFoldersOfS3,
  deleteFlowBuilderEdgesApi,
  deleteFlowBuilderFormApi,
  deleteFlowBuilderJobInputApi,
  deleteFlowBuilderJsonApi,
  deleteFlowBuilderNodesApi,
  getFlowBuilderEdgesApi,
  getFlowBuilderFormApi,
  getFlowBuilderNodesApi,
  createFlowBuilderEdgesApi,
  createFlowBuilderFormApi,
  createFlowBuilderJobInputApi,
  createFlowBuilderJsonApi,
  createFlowBuilderNodesApi,
  getFlowBuilderJobInputApi,
} from "../api's/FlowBuilderApi";
import { GetConnectionData } from "../api's/AdminPannelApi";
import { AuthContext } from '../context/AuthProvider';
import convertToRequiredFormat from './JsonConverter';

const { Option } = Select;
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

const JobsTableRow = ({ source, chipData, countItem, fetchJob }) => {
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  const { Job, setJob } = useContext(JobContext);
  const { batch } = useContext(BatchContext);
  const { client } = useContext(ClientContext);
  const { jobList, setJobList } = useContext(JobListContext);
  const { setStream } = useContext(StreamContext);
  const { user } = useContext(AuthContext);

  const [TotalJobItem, setTotalJobItem] = useState(0);

  const [jobStatus, setJobStatus] = useState('Loading...');
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [openBatchIdModal, setOpenBatchIdModal] = useState(false);
  const [openLoadingModal, setOpenLoadingModal] = useState(false);
  const [openRunJobModal, setOpenRunJobModal] = useState(false);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [runDisabled, setRunDisabled] = useState(false);
  const [batchId, setBatchId] = useState(false);
  const [jobDisable, setJobDisable] = useState(false);
  const [includeRow, setincludeRow] = useState(false);
  const [region, setRegion] = useState('');
  const [connectionData, setConnectionData] = useState([]);
  const [connectionName, setConnectionName] = useState('');
  const [connDisable, setConnDisabled] = useState(false);
  const [editEnable, setEditEnable] = useState(false);

  const [TimestampType, setTimestampType] = useState('RuleEngine');

  const { userRole } = useContext(AuthContext);
  const [form] = Form.useForm();
  const [FoldersData, setFoldersData] = useState([]);
  const [FilesData, setFilesData] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleLoadingModalOpen = () => setOpenLoadingModal(true);

  const handleLoadingModalClose = () => setOpenLoadingModal(false);

  const handleDeleteModalOpen = () => setOpenDeleteModal(true);

  const handleDeleteModalClose = () => setOpenDeleteModal(false);

  const handleBatchIdModalOpen = () => setOpenBatchIdModal(true);

  const handleRunJobModalOpen = () => setOpenRunJobModal(true);

  const handleRunJobModalClose = () => {
    setOpenRunJobModal(false);
    setConnDisabled(false);
    setRegion('');
  };

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
          const res = await fetchJobsAndStatusApi(client.client_id, batch.batch_id);

          if (res.status === 200) {
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

    setStream(null);

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
      response = await getFlowBuilderNodesApi(client.client_id, batch.batch_id, job);
    } catch (error) {
      if (error.response.status === 404) {
        handleLoadingModalClose();
        navigate(`/flow-builder/flow/${batch.batch_name}/${job}`);
      }
      return;
    }

    const getEdges = await getFlowBuilderEdgesApi(client.client_id, batch.batch_id, job);

    const getNodesData = await getFlowBuilderFormApi(client.client_id, batch.batch_id, job);

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
      handleLoadingModalClose();
      navigate(`/flow-builder/flow/${batch.batch_name}/${job}`);
    }
  };

  const OpenLogsPage = (job) => {
    navigate(`/flow-builder/logs/step-logs/${batch.batch_name}/${source.job_id}`);
  };

  const handleRunJob = async (job, trackingId) => {
    handleRunJobModalClose();

    if (Job !== job) {
      setJob(job);
    }

    try {
      let batch_id;
      if (trackingId === 'snowflake-garbageTID') {
        batch_id = `${client.client_name}_${batch.batch_name}_${job}_dataProcessor_${new Date().getTime()}`;
      } else {
        batch_id = `${client.client_name}_${batch.batch_name}_${job}_dataProcessor_${trackingId}`;
      }

      const client_job = `${client.client_name}_${batch.batch_name}_${job}_dataProcessor`;

      const data = {
        client_job: client_job.replaceAll(' ', ''),
        batch_id: batch_id.replaceAll(' ', ''),
      };

      const response = await createBatchidApi(data);

      const emrJob = {
        batch: batch.batch_name,
        job_id: source.job_id,
        execution_id: batch_id.replaceAll(' ', ''),
        client_id: client.client_id,
        batch_id: batch.batch_id,
        client_name: client.client_name,
        connectionType: 'EMR',
        connectionName: 'EMR',
        trackingId,
      };

      const snowFlake = {
        batch: batch.batch_name,
        job_id: source.job_id,
        execution_id: batch_id.replaceAll(' ', ''),
        client_id: client.client_id,
        batch_id: batch.batch_id,
        client_name: client.client_name,
        connectionType: source.connectionType,
        connectionName: source.connectionName,
        trackingId,
      };
      const GLUE = {
        batch: batch.batch_name,
        job_id: source.job_id,
        execution_id: batch_id.replaceAll(' ', ''),
        client_id: client.client_id,
        batch_id: batch.batch_id,
        client_name: client.client_name,
        connectionType: source.connectionType,
        connectionName: source.connectionName,
        trackingId,
      };

      let input;

      if (source.connectionType && source.connectionName) {
        source.connectionType === 'snowflake' ? (input = snowFlake) : (input = GLUE);
      } else {
        input = emrJob;
      }

      // const input = emrJob;

      const response1 = await runJobApi(input);

      if (response1.status === 200) {
        setRunDisabled(true);
        setJobStatus('In Progress');
        setBatchId(batch_id);
        handleBatchIdModalOpen();
        enqueueSnackbar('Job is running in progress.', {
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
  };

  const fetchJobList = async () => {
    const res = await fetchJobsAndStatusApi(client.client_id, batch.batch_id);
    if (res.status === 200) {
      setJobList(res.data);
    }
  };

  const handleDisableJob = (e, job) => {
    if (Job !== job) {
      setJob(job);
    }

    if (e.target.checked) {
      setJobDisable(false);
    } else {
      setJobDisable(true);
    }
    toggleJob(e, job);
  };

  const toggleJob = async (e, job) => {
    try {
      const disable = e.target.checked;

      let response;
      if (disable) {
        response = await enableJobApi(client.client_id, batch.batch_id, job);

        if (response.status === 200) {
          enqueueSnackbar('Job Enabled.', {
            variant: 'success',
            autoHideDuration: 3000,
            anchorOrigin: { vertical: 'top', horizontal: 'right' },
          });
        }
      } else {
        response = await disableJobApi(client.client_id, batch.batch_id, job);

        if (response.status === 200) {
          enqueueSnackbar('Job Disabled.', {
            variant: 'success',
            autoHideDuration: 3000,
            anchorOrigin: { vertical: 'top', horizontal: 'right' },
          });
        }
      }

      if (response.status === 200) {
        fetchJobList();
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
  };

  const refreshBtn = async (batchname, job) => {
    const batchID = `${client.client_name}_${batchname}_${job}_dataProcessor`;

    try {
      const result = await fetchCurrentJobStatusApi(source.job_id, batchID.replaceAll(' ', ''));
      console.log(result);
      let status = 'Unknown';

      if (result.status === 200) {
        if (result.data.job_status === 'Completed') {
          status = 'Completed';
          setRunDisabled(false);
          setJobStatus(result.data.job_status);
        } else if (result.data.job_status === 'Running') {
          status = 'Running';
          setRunDisabled(false);
          setJobStatus(result.data.job_status);
        } else if (result.data.job_status === 'Failed') {
          status = 'Failed';
          setRunDisabled(false);
          setJobStatus(result.data.job_status);
        } else if (result.data.job_status === 'Unknown') {
          status = 'Unknown';
          setRunDisabled(false);
          setJobStatus(result.data.job_status);
        } else {
          const time = result.data.execution_id.split('-')[1];
          const triggeredTime = new Date(time);
          const currentTime = new Date();

          const diffTime = currentTime - triggeredTime;

          const elapsedTime = Math.floor(diffTime / 60e3);

          if (elapsedTime < 5) {
            status = 'In Progress';
            setRunDisabled(true);
            setJobStatus('In Progress');
          } else {
            status = 'Failed';
            setRunDisabled(false);
            setJobStatus('Failed');
          }
        }

        const newJobList = [...jobList];
        newJobList.forEach((el) => {
          if (el.job_id === result.data.job_id) {
            el.job_status = status;
          }
        });

        setJobList(newJobList);
        enqueueSnackbar(`Status Refreshed.`, {
          variant: 'success',
          autoHideDuration: 3000,
          anchorOrigin: { vertical: 'top', horizontal: 'right' },
        });
      }
    } catch (error) {
      if (error.response.status === 500) {
        setRunDisabled(false);
        setJobStatus('Failed');
        enqueueSnackbar(`Job is not running`, {
          variant: 'warning',
          autoHideDuration: 3000,
          anchorOrigin: { vertical: 'top', horizontal: 'right' },
        });
      }
    }
  };

  const loadJobStatus = async () => {
    if (source.job_status === 'Completed') {
      setRunDisabled(false);
      setJobStatus(source.job_status);
    } else if (source.job_status === 'Running') {
      setRunDisabled(true);
      setJobStatus(source.job_status);
    } else if (source.job_status === 'Failed') {
      setRunDisabled(false);
      setJobStatus(source.job_status);
    } else if (source.job_status === 'Unknown') {
      setRunDisabled(false);
      setJobStatus('Unknown');
    } else {
      const time = source.execution_id.split('_')[1];
      const triggeredTime = new Date(time);
      const currentTime = new Date();

      const diffTime = currentTime - triggeredTime;

      const elapsedTime = Math.floor(diffTime / 60e3);

      if (elapsedTime < 5) {
        setRunDisabled(true);
        setJobStatus('In Progress');
      } else {
        setRunDisabled(false);
        setJobStatus('Failed');
      }
    }
  };

  const fetchConnection = async () => {
    try {
      if (region === 'glue') {
        const data = [
          {
            connectionName: 'glue',
            connectionType: 'glue',
          },
        ];
        setConnectionData(data);
      } else if (region === 'emr') {
        const data = [
          {
            connectionName: 'emr',
            connectionType: 'emr',
          },
        ];
        setConnectionData(data);
      } else {
        const response = await GetConnectionData(region, user);
        if (response.status === 200) {
          setConnectionData(response.data);
        }
      }
    } catch (error) {
      enqueueSnackbar('No Connection Found !', {
        variant: 'error',
        autoHideDuration: 3000,
        anchorOrigin: { vertical: 'top', horizontal: 'right' },
      });
    }
  };

  const updateConnections = async (e) => {
    e.preventDefault();
    try {
      const data = {
        job_id: source.job_id,
        connectionName,
        connectionType: region,
      };
      const res = await updateJobRunTypeApi(data);
      if (res.status === 200) {
        fetchJob();
        setRegion('');
        setConnectionName('');
      }
    } catch (error) {
      enqueueSnackbar('Update Failed !', {
        variant: 'error',
        autoHideDuration: 3000,
        anchorOrigin: { vertical: 'top', horizontal: 'right' },
      });
    }
    setEditEnable(false);
  };

  useEffect(() => {
    loadJobStatus();

    return () => {
      setRunDisabled(false);
      setJobStatus('');
    };
  }, []);

  useEffect(() => {
    region && fetchConnection();
  }, [region]);

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

  const getAllFiles = async (prefix) => {
    setFilesData([]);
    // console.log(prefix);
    const res = await AllFilesOfS3(prefix);
    if (res.status === 200) {
      setFilesData(res.data);
    }
  };

  const saveAndCreateJson = async (job) => {
    setStream(null);

    if (Job !== job) {
      setJob(job);
      sessionStorage.removeItem('allNodes');
      sessionStorage.removeItem('node');
      sessionStorage.removeItem('elementCount');
      sessionStorage.removeItem('saved_node');
      sessionStorage.removeItem('edges');
    }

    const getNodesData = await getFlowBuilderFormApi(client.client_id, batch.batch_id, job);
    let nodeData = '';

    if (getNodesData.status === 200) {
      nodeData = getNodesData.data.nodes;

      sessionStorage.setItem('allNodes', JSON.stringify(nodeData));
    }
  };

  const saveFormData = async (trackingId, TimestampType, bucket_name, data_region_code) => {
    // setLoadBtn(true);
    try {
      const getAllDataFromLocalStorage = JSON.parse(sessionStorage.getItem('allNodes'));

      getAllDataFromLocalStorage.sort((a, b) => a.y_axis - b.y_axis);
      let count = 1;
      getAllDataFromLocalStorage.forEach((el) => {
        el.formField.step_no = count;
        count++;
      });

      const tempFormData = getAllDataFromLocalStorage;

      getAllDataFromLocalStorage.sort((a, b) => a.formField.step_no - b.formField.step_no);
      const formData = convertToRequiredFormat(getAllDataFromLocalStorage, trackingId, client.bucket_name);
      console.log(formData);

      tempFormData.forEach((el) => {
        if (el.nodeName === 'Data Cleansing') {
          el.cleansingRules = el.cleansingRules.filter((el) => {
            return !el.deleted;
          });
        }
      });

      tempFormData.forEach((el) => {
        if (el.nodeName === 'Data Cleansing') {
          el.initial_rules = el.cleansingRules;
        }
      });

      if (formData.steps[formData.steps.length - 1] === null) {
        formData.steps.pop();
      }

      const createFormJson = await createFlowBuilderJsonApi(
        client.client_name,
        batch.batch_name,
        source.input_ref_key,
        formData,
        trackingId,
        TimestampType,
        bucket_name,
        data_region_code
      );

      if (createFormJson.status === 200) {
        localStorage.removeItem('allNodes');
        localStorage.removeItem('node');
        localStorage.removeItem('elementCount');
        localStorage.removeItem('saved_node');
      }
    } catch (error) {
      console.log(error);
      if (error.response.status === 403) {
        enqueueSnackbar('You have only Read Permission !!', {
          variant: 'error',
          autoHideDuration: 3000,
          anchorOrigin: { vertical: 'top', horizontal: 'right' },
        });
      }
      // setLoadBtn(false);
    }
  };

  const UpdateExtractJob = async (tracking_id, job) => {
    const data = {
      client_id: client.client_id,
      client_name: client.client_name,
      batch_id: batch.batch_id,
      batch_name: batch.batch_name,
      job_name: job,
      tracking_id,
      filename: job,
    };

    const response = await updateExtractJobApi(data);
    if (response.status === 200) {
      console.log('sa');
    } else {
      console.log('sfaf');
    }
  };

  const EmrButtonClick = async (values) => {
    let trackingId = '';
    if (TimestampType === 'RuleEngine') {
      console.log(values);
      trackingId = values.Folders.split('/')[6];
    } else if (TimestampType === 'DataProcessor') {
      trackingId = values.Folders.split('/')[5];
    }

    setIsModalVisible(false);
    await saveAndCreateJson(source.input_ref_key);
    await saveFormData(trackingId, TimestampType, client.bucket_name, client.data_region_code);
    await UpdateExtractJob(trackingId, source.input_ref_key);
    await handleRunJob(source.input_ref_key, trackingId);
    form.setFieldsValue({
      Folders: '',
      Files: '',
    });
  };

  const pad2 = (n) => {
    return n < 10 ? `0${n}` : n;
  };

  const SimpleRun = async () => {
    let trackingId = '';
    const date = new Date();
    trackingId = `${date.getFullYear().toString()}${pad2(date.getMonth() + 1).toString()}${pad2(date.getDate())}${pad2(
      date.getHours()
    )}${pad2(date.getMinutes())}${pad2(date.getSeconds())}${pad2(date.getMilliseconds())}`;

    await saveAndCreateJson(source.input_ref_key);
    await saveFormData(trackingId, TimestampType, client.bucket_name, client.data_region_code);
    await UpdateExtractJob(trackingId, source.input_ref_key);
    await handleRunJob(source.input_ref_key, trackingId, client);
    setIsModalVisible(false);
    form.setFieldsValue({
      Folders: '',
      Files: '',
    });
  };

  const onFinish = async (values) => {
    if (TimestampType !== 'Input') {
      EmrButtonClick(values);
    } else {
      SimpleRun();
    }
  };

  const showModal = async (client_name, batch_name, table_name) => {
    try {
      const response = await getFlowBuilderFormApi(client.client_id, batch.batch_id, table_name);
      if (response.status === 200) {
        setIsModalVisible(true);
        const res1 = await AllFoldersOfS3(client_name, batch_name, table_name, 'RuleEngine', client.client_id);
        if (res1.status === 200) {
          setFoldersData(res1.data);
        }
      }
    } catch (error) {
      enqueueSnackbar('No Flow Found, Create Flow First!', {
        variant: 'error',
        autoHideDuration: 3000,
        anchorOrigin: { vertical: 'top', horizontal: 'right' },
      });
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setTimestampType('');
    form.setFieldsValue({
      Folders: '',
      Files: '',
    });
  };

  const onChangeTimeStamp = async (e) => {
    setTimestampType(e.target.value);
    if (e.target.value === 'DataProcessor' || e.target.value === 'RuleEngine') {
      const res1 = await AllFoldersOfS3(
        client.client_name,
        batch.batch_name,
        source.input_ref_key,
        e.target.value,
        client.client_id
      );
      if (res1.status === 200) {
        setFoldersData(res1.data);
      }
    } else {
      // console.log("")
    }
  };

  const snowFlakeButtonClick = async () => {
    await saveAndCreateJson(source.input_ref_key);
    await saveFormData('snowflake-garbageTID', 'snowflake-garbageTS', 'snowflake', 'snowflake');
    await UpdateExtractJob('snowflake-garbageTID', source.input_ref_key);
    await handleRunJob(source.input_ref_key, 'snowflake-garbageTID');
  };

  const GLueButtonClick = async () => {
    let trackingId = '';
    const date = new Date();
    trackingId = `${date.getFullYear().toString()}${pad2(date.getMonth() + 1).toString()}${pad2(date.getDate())}${pad2(
      date.getHours()
    )}${pad2(date.getMinutes())}${pad2(date.getSeconds())}${pad2(date.getMilliseconds())}`;

    await saveAndCreateJson(source.input_ref_key);
    await saveFormData(trackingId, 'glue-TS', client.bucket_name, client.data_region_code);
    await UpdateExtractJob(trackingId, source.input_ref_key);
    await handleRunJob(source.input_ref_key, trackingId);
  };

  return (
    <>
      {includeRow && (
        <>
          <StyledTableRow>
            <StyledTableCell align="left">
              <div style={{ whiteSpace: 'nowrap', width: '350px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {!source.active || jobDisable ? (
                  <a
                    onClick={() => fetchJobNodes(source.input_ref_key)}
                    href="#"
                    style={{
                      textDecoration: 'none',
                      pointerEvents: 'none',
                      color: '#bbb',
                    }}
                  >
                    <span
                      style={{ whiteSpace: 'nowrap', width: '150px', overflow: 'hidden', textOverflow: 'ellipsis' }}
                    >
                      {source.input_ref_key}
                    </span>
                  </a>
                ) : (
                  <a
                    onClick={() => fetchJobNodes(source.input_ref_key)}
                    href="#"
                    style={{
                      textDecoration: 'none',
                    }}
                  >
                    <span
                      style={{ whiteSpace: 'nowrap', width: '150px', overflow: 'hidden', textOverflow: 'ellipsis' }}
                    >
                      {source.input_ref_key}
                    </span>
                  </a>
                )}
              </div>
            </StyledTableCell>
            <StyledTableCell align="left">
              <form onSubmit={updateConnections}>
                <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
                  {editEnable && (
                    <>
                      <FormControl fullWidth sx={{ width: '150px' }}>
                        <InputLabel id="demo-simple-select-label">Conn. Type</InputLabel>
                        <MSelect
                          labelId="demo-simple-select-label"
                          id="demo-simple-select"
                          value={region}
                          label="Connection Type"
                          onChange={(e) => setRegion(e.target.value)}
                          size="small"
                          required
                        >
                          <MenuItem value="aws">AWS</MenuItem>
                          <MenuItem value="snowflake">SNOWFLAKE</MenuItem>
                          <MenuItem value="glue">GLUE</MenuItem>
                          <MenuItem value="emr">EMR</MenuItem>
                        </MSelect>
                      </FormControl>

                      {region === 'glue' || region === 'emr' ? (
                        <Autocomplete
                          disablePortal
                          id="combo-box-demo"
                          value={region}
                          disabled={region === ''}
                          // hidden
                          onChange={(event, newValue) => setConnectionName(newValue.connectionName)}
                          options={connectionData}
                          getOptionLabel={(option) => {
                            return option.connectionName;
                          }}
                          size="small"
                          sx={{ ml: 1, width: '150px' }}
                          renderInput={(params) => <TextField {...params} label="Conn. Name " required />}
                        />
                      ) : (
                        <Autocomplete
                          disablePortal
                          id="combo-box-demo"
                          // value={connectionName}
                          disabled={region === ''}
                          onChange={(event, newValue) => setConnectionName(newValue.connectionName)}
                          options={connectionData}
                          getOptionLabel={(option) => {
                            return option.connectionName;
                          }}
                          size="small"
                          sx={{ ml: 1, width: '150px' }}
                          renderInput={(params) => <TextField {...params} label="Conn. Name " required />}
                        />
                      )}
                      <IconButton disabled={jobDisable || !source.active} color="success" type="submit">
                        <CheckIcon sx={{ fontSize: '1rem' }} />
                      </IconButton>
                      <IconButton
                        disabled={jobDisable || !source.active}
                        color="error"
                        onClick={() => {
                          setEditEnable(false);
                          setRegion('');
                          setConnectionName('');
                        }}
                      >
                        <ClearIcon sx={{ fontSize: '1rem' }} />
                      </IconButton>
                    </>
                  )}
                  {!editEnable && (
                    <div style={{ dispaly: 'flex', alignItems: 'center', flexDirection: 'row' }}>
                      {source.connectionType === 'glue' ? (
                        <>
                          <span>{source.connectionType}</span>
                        </>
                      ) : source.connectionType === 'emr' ? (
                        <>
                          <span>{source.connectionType}</span>
                        </>
                      ) : (
                        // source.connectionType !== 'emr' &&
                        // source.connectionType !== 'glue' &&
                        // source.connectionName(
                        //   <>
                        <span>
                          {source.connectionType}, {source.connectionName}
                        </span>
                        // </>
                      )}
                      &emsp;
                      <IconButton
                        disabled={jobDisable || !source.active || userRole === 'ROLE_reader'}
                        onClick={() => setEditEnable(true)}
                        color="secondary"
                      >
                        <EditIcon sx={{ fontSize: '1rem' }} />
                      </IconButton>
                    </div>
                  )}
                </div>
              </form>
            </StyledTableCell>
            <StyledTableCell align="center">
              <Tooltip title="Disable/Enable Job">
                <IconButton
                  onChange={(e) => handleDisableJob(e, source.input_ref_key)}
                  disabled={userRole === 'ROLE_reader'}
                >
                  <GreenSwitch {...label} checked={!jobDisable || source.active} size="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Edit Flow Builder">
                <IconButton
                  disabled={jobDisable || !source.active || userRole === 'ROLE_reader'}
                  onClick={() => fetchJobNodes(source.input_ref_key)}
                  color="secondary"
                >
                  <EditIcon sx={{ fontSize: '1rem' }} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete Flow Builder">
                <IconButton
                  // disabled={jobDisable === true ? true : source.active === false ? true : false}
                  disabled={jobDisable || !source.active || userRole === 'ROLE_reader'}
                  onClick={() => {
                    setJob(source.input_ref_key);
                    handleDeleteModalOpen();
                  }}
                  color="error"
                >
                  <DeleteIcon sx={{ fontSize: '1rem' }} />
                </IconButton>
              </Tooltip>
              <Tooltip title="View Logs">
                <IconButton
                  // disabled={jobDisable === true ? true : source.active === false ? true : false}
                  disabled={jobDisable || !source.active}
                  onClick={() => {
                    setJob(source.input_ref_key);
                    OpenLogsPage(source.input_ref_key);
                  }}
                  color="primary"
                >
                  <LogsIcon sx={{ fontSize: '1rem' }} />
                </IconButton>
              </Tooltip>

              <Tooltip title="Run Job">
                <IconButton
                  disabled={runDisabled || jobDisable || !source.active || userRole === 'ROLE_reader'}
                  onClick={() => {
                    if (source.connectionType === 'snowflake' && source.connectionName) {
                      snowFlakeButtonClick();
                    } else if (source.connectionType === 'glue') {
                      GLueButtonClick();
                    } else {
                      showModal(client.client_name, batch.batch_name, source.input_ref_key);
                    }
                  }}
                  color="warning"
                >
                  <PlayArrowIcon sx={{ fontSize: '1rem' }} />
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
              {jobStatus === 'Loading...' && jobStatus}
              {jobStatus === 'Completed' && (
                <p
                  style={{
                    color: 'green',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <CheckCircleOutlineIcon style={{ fontSize: '18px' }} /> &nbsp;
                  {jobStatus}
                </p>
              )}
              {jobStatus === 'Running' && (
                <p
                  style={{
                    color: '#ffc300',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <AccessTimeIcon style={{ fontSize: '18px' }} /> &nbsp; {jobStatus}
                </p>
              )}
              {jobStatus === 'Unknown' && (
                <p
                  style={{
                    color: 'grey',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <DoNotDisturbOnIcon style={{ fontSize: '18px' }} /> &nbsp;
                  {jobStatus}
                </p>
              )}

              {jobStatus === 'Error' && (
                <p
                  style={{
                    color: 'red',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Error style={{ fontSize: '18px' }} /> &nbsp;
                  {jobStatus}
                </p>
              )}

              {jobStatus === 'Failed' && (
                <p
                  style={{
                    color: 'red',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <CancelIcon style={{ fontSize: '18px' }} /> &nbsp;
                  {jobStatus}
                </p>
              )}

              {jobStatus === 'In Progress' && (
                <p
                  style={{
                    color: '#98c1d9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <PendingIcon style={{ fontSize: '18px' }} /> &nbsp;
                  {source.job_status}
                </p>
              )}

              <Tooltip title="Refresh Status">
                <IconButton
                  onClick={(e) => refreshBtn(batch.batch_name, source.input_ref_key)}
                  disabled={jobDisable || !source.active}
                >
                  <RefreshIcon sx={{ fontSize: '1rem' }} />
                </IconButton>
              </Tooltip>
            </StyledTableCell>
          </StyledTableRow>
        </>
      )}
      <MModal
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
      </MModal>
      <MModal
        open={openBatchIdModal}
        onClose={handleBatchIdModalClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style} style={{ width: 'max-content' }}>
          <Typography id="transition-modal-title" variant="h6" component="h2">
            Running Job Batch_id -
          </Typography>
          <p
            id="transition-modal-description"
            style={{
              marginTop: 2,
              fontWeight: 'bold',
            }}
          >
            {batchId}
          </p>
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
      </MModal>
      <MModal open={openLoadingModal} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description">
        <Box sx={styleLoading}>
          <LoadingIcon />
        </Box>
      </MModal>

      <MModal
        open={openRunJobModal}
        onClose={handleRunJobModalClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Button
            variant="contained"
            color="secondary"
            type="submit"
            onClick={() => handleRunJob(source.input_ref_key)}
            className="button-color"
            disabled={connDisable}
            sx={{ mr: 2 }}
          >
            Run on EMR <PlayArrowIcon sx={{ fontSize: '1rem' }} />
          </Button>
          <Button
            variant="contained"
            color="secondary"
            type="submit"
            onClick={() => setConnDisabled(true)}
            className="button-color"
          >
            Run on Snowflake <PlayArrowIcon sx={{ fontSize: '1rem' }} />
          </Button>
          {connDisable && (
            <>
              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel id="demo-simple-select-label">Connection Type</InputLabel>
                <MSelect
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  value={region}
                  label="Connection Type"
                  onChange={(e) => setRegion(e.target.value)}
                >
                  <MenuItem value="aws">AWS</MenuItem>
                  <MenuItem value="snowflake">SNOWFLAKE</MenuItem>
                </MSelect>
              </FormControl>

              <Autocomplete
                disablePortal
                id="combo-box-demo"
                // value={connectionName}
                disabled={region === ''}
                onChange={(event, newValue) => setConnectionName(newValue.connectionName)}
                options={connectionData}
                getOptionLabel={(option) => {
                  return option.connectionName;
                }}
                fullWidth
                sx={{ mt: 2 }}
                renderInput={(params) => <TextField {...params} label="Connection Name " />}
              />
              <Button
                variant="outlined"
                color="secondary"
                type="submit"
                onClick={() => handleRunJob(source.input_ref_key)}
                className="outlined-button-color"
                sx={{ mt: 2 }}
              >
                Run
              </Button>
            </>
          )}
        </Box>
      </MModal>
      <Modal
        title="Flow builder Execution "
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        centered
        maskClosable
      >
        <Form form={form} labelCol={{ span: 6 }} wrapperCol={{ span: 22 }} layout="horizontal" onFinish={onFinish}>
          <Form.Item>
            <Radio.Group onChange={onChangeTimeStamp} value={TimestampType}>
              <Radio value="RuleEngine"> Rule Engine Output </Radio>
              <Radio value="DataProcessor"> Data Processor Input </Radio>
              <Radio value="Input">Execute</Radio>
            </Radio.Group>
          </Form.Item>
          {(TimestampType === 'DataProcessor' || TimestampType === 'RuleEngine') && (
            <>
              <Form.Item
                name="Folders"
                label="Tracking Id"
                rules={[
                  {
                    required: true,
                    message: 'Please select folder!',
                  },
                ]}
              >
                <Select onChange={getAllFiles}>
                  {FoldersData &&
                    FoldersData.map((ele, idx) => {
                      return (
                        <Option key={idx} value={ele.value}>
                          {ele.label}
                        </Option>
                      );
                    })}
                </Select>
              </Form.Item>
            </>
          )}
          {/* {TimestampType === 'Input' && (
            <>
              <Form.Item
                name="Files"
                label="Input location"
                rules={[
                  {
                    required: true,
                    message: 'Please input path!',
                  },
                ]}
              >
                <Input />
              </Form.Item>
            </>
          )} */}
          <Form.Item style={{ marginLeft: '40%' }}>
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default memo(JobsTableRow);
