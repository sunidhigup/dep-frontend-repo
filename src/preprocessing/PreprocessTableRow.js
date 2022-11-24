import React, { useState, useContext, useEffect, memo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { IconButton, Switch, TableRow, FormControlLabel, FormGroup } from '@mui/material';

import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import { alpha, styled } from '@mui/material/styles';
import { useSnackbar } from 'notistack';
import EditIcon from '@mui/icons-material/Edit';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import Tooltip from '@mui/material/Tooltip';
import RefreshIcon from '@mui/icons-material/Refresh';
import Error from '@mui/icons-material/Error';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DoNotDisturbOnIcon from '@mui/icons-material/DoNotDisturbOn';
import CancelIcon from '@mui/icons-material/Cancel';
import PendingIcon from '@mui/icons-material/Pending';
import { Button, Form, Modal, Select } from 'antd';
import { ExclamationCircleOutlined, PlayCircleOutlined } from '@ant-design/icons';

import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import { AllFilesOfS3, AllFoldersOfS3, executePreprocessApi } from "../api's/PreprocessApi";
import { JobContext } from '../context/JobProvider';
import { JobListContext } from '../context/JobListProvider';
import { BatchContext } from '../context/BatchProvider';
import { ClientContext } from '../context/ClientProvider';
import { BUCKET_NAME } from '../constants/Constant';
import { deleteJobApi, disableJobApi, enableJobApi, ApprovedfetchJobsApi, runJobApi } from "../api's/JobApi";
import { createBatchidApi, fetchBatchidApi, getStepfunctionStatusApi } from "../api's/BatchApi";
import {
  deleteFlowBuilderEdgesApi,
  deleteFlowBuilderFormApi,
  deleteFlowBuilderJobInputApi,
  deleteFlowBuilderJsonApi,
  deleteFlowBuilderNodesApi,
  getFlowBuilderEdgesApi,
  getFlowBuilderFormApi,
  getFlowBuilderNodesApi,
} from "../api's/FlowBuilderApi";
import { fetchJobStatus } from "../api's/LogsApi";

const label = { inputProps: { 'aria-label': 'Switch demo' } };
const { Option } = Select;

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

const PreprocessTableRow = ({ source, chipData, countItem }) => {
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  // console.log(source);
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
  const [disableRun, setDisableRun] = useState(false);
  const [runStatus, setRunStatus] = useState('Loading...');

  const [form] = Form.useForm();
  const [FoldersData, setFoldersData] = useState([]);
  const [FilesData, setFilesData] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);

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
    try {
      setLoadingBtn(true);

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
      setLoadingBtn(false);
      handleDeleteModalClose();
    } catch (error) {
      setLoadingBtn(false);
      handleDeleteModalClose();
      if (error.response.status === 403) {
        enqueueSnackbar('You have only Read Permission !!', {
          variant: 'error',
          autoHideDuration: 3000,
          anchorOrigin: { vertical: 'top', horizontal: 'right' },
        });
      }
    }
  };

  // useEffect(() => {
  //   console.log(source)
  // }, [])

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

  // console.log(chipData)

  // useEffect(() => {
  //   fetchJobList();
  // }, [batchid]);

  const sendToParentStatus = {
    jobStatus,
  };

  const runPreprocessor = async (e, tablename) => {
    e.preventDefault();

    handleLoadingModalOpen();

    const batch_table_id = `${client.client_name}_${batch.batch_name}_${tablename}_${new Date().getTime()}`;

    const client_job = `${client.client_name}_${batch.batch_name}_${tablename}`;

    const data = {
      client_job: client_job.replaceAll(' ', ''),
      batch_id: batch_table_id.replaceAll(' ', ''),
    };

    const res = await createBatchidApi(data);

    const input = {
      // batch: batch.batch_name,
      execution_id: batch_table_id.replaceAll(' ', ''),
      // client_id: client.client_id,
      // batch_id: batch.batch_name_id,
      // table_name: tablename,
      // client_name: client.client_name,
    };
    const response = await executePreprocessApi(input.execution_id);

    if (response.status === 200) {
      setDisableRun(true);
      setRunStatus('In Progress');
      handleLoadingModalClose();
      enqueueSnackbar('Table Rule is running!', {
        variant: 'Success',
        autoHideDuration: 3000,
        anchorOrigin: { vertical: 'top', horizontal: 'right' },
      });
    }
  };

  // const refreshBtn = async (e, batchname, tablename) => {
  //   e.stopPropagation();
  //   const batchID = `${client.client_name}_${batchname}_${tablename}`;

  //   try {
  //     const result = await fetchBatchidApi(batchID.replaceAll(' ', ''));

  //     if (result.status === 200) {
  //       const data = {
  //         id: `${result.data}`,
  //       };
  //       const result1 = await getPreprocessorLogStreamApiStatus(data);

  //       if (result1.data.status === 'Completed') {
  //         setDisableRun(false);
  //         setRunStatus(result1.data.status);
  //         enqueueSnackbar(`Rule Engine is ${result1.data.status}`, {
  //           variant: 'success',
  //           autoHideDuration: 3000,
  //           anchorOrigin: { vertical: 'top', horizontal: 'right' },
  //         });
  //       } else if (result1.data.status === 'Running') {
  //         setDisableRun(true);
  //         setRunStatus(result1.data.status);
  //         enqueueSnackbar(`Rule Engine is ${result1.data.status}`, {
  //           variant: 'warning',
  //           autoHideDuration: 3000,
  //           anchorOrigin: { vertical: 'top', horizontal: 'right' },
  //         });
  //       } else if (result1.data.status === 'Failed') {
  //         setDisableRun(false);
  //         setRunStatus(result1.data.status);
  //         enqueueSnackbar(`Rule Engine is ${result1.data.status}`, {
  //           variant: 'failed',
  //           autoHideDuration: 3000,
  //           anchorOrigin: { vertical: 'top', horizontal: 'right' },
  //         });
  //       } else {
  //         const time = result.data.split('~')[1];
  //         const triggeredTime = new Date(time);
  //         const currentTime = new Date();

  //         const diffTime = currentTime - triggeredTime;

  //         const elapsedTime = Math.floor(diffTime / 60e3);

  //         if (elapsedTime < 5) {
  //           setDisableRun(true);
  //           setRunStatus('In Progress');
  //           enqueueSnackbar(`Rule Engine is in progress.`, {
  //             variant: 'secondary',
  //             autoHideDuration: 3000,
  //             anchorOrigin: { vertical: 'top', horizontal: 'right' },
  //           });
  //         } else {
  //           setDisableRun(false);
  //           setRunStatus('Failed');
  //           enqueueSnackbar(`Rule Engine is failed.`, {
  //             variant: 'error',
  //             autoHideDuration: 3000,
  //             anchorOrigin: { vertical: 'top', horizontal: 'right' },
  //           });
  //         }
  //       }
  //     }
  //   } catch (error) {
  //     if (error.response.status === 404) {
  //       setRunStatus('Unknown');
  //       setDisableRun(false);
  //       enqueueSnackbar(`Rule Engine is not running`, {
  //         variant: 'warning',
  //         autoHideDuration: 3000,
  //         anchorOrigin: { vertical: 'top', horizontal: 'right' },
  //       });
  //     }
  //   }
  // };

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

  const runExecutePreprocess = async (e, client_name, batch_name, table_name) => {
    e.preventDefault();

    // handleLoadingModalOpen();

    // const batch_table_id = `${client.client_name}_${batch.batch_name}_${tablename}_${new Date().getTime()}`;

    // const client_job = `${client.client_name}_${batch.batch_name}_${tablename}`;

    // const data = {
    //   client_job: client_job.replaceAll(' ', ''),
    //   batch_id: batch_table_id.replaceAll(' ', ''),
    // };

    // const res = await executePreprocessApi(data);

    // const input = {
    //   batch: batch.batch_name,
    //   execution_id: batch_table_id.replaceAll(' ', ''),
    //   client_id: client.client_id,
    //   batch_id: batch.batch_name_id,
    //   table_name: tablename,
    //   client_name: client.client_name,
    // };

    // const response = await executePreprocessApi(client_name, batch_name, table_name);
  };

  const loadJobStatus = async () => {
    const id = `${client.client_name}_${batch.batch_name}_${source.table_name}`;
    const response = await fetchJobStatus(id);
    // console.log(response.data);
    if (response.status === 200) {
      setJobStatus(response.data.Status);
    }
  };

  useEffect(() => {
    loadJobStatus();
  }, [source.table_name]);

  const deleteTableRule1 = async (e, tablename) => {
    // const response = await deleteTableRule(client.client_id, batch.batch_name, tablename);
    // if (response.status === 200) {
    //   fetchTableRule();
    //   enqueueSnackbar(`${tablename} is deleted`, {
    //     variant: 'success',
    //     autoHideDuration: 3000,
    //     anchorOrigin: { vertical: 'top', horizontal: 'right' },
    //   });
    // } else {
    //   enqueueSnackbar(`Internal server error`, {
    //     variant: 'error',
    //     autoHideDuration: 3000,
    //     anchorOrigin: { vertical: 'top', horizontal: 'right' },
    //   });
    // }
  };

  const getAllFiles = async (prefix) => {
    setFilesData([]);
    console.log(prefix);
    const res = await AllFilesOfS3(prefix);
    if (res.status === 200) {
      setFilesData(res.data);
    }
  };

  const onFinish = async (values) => {
    console.log(values);
    // console.log(values.Files.slice(0, values.Files.length-1));
    setIsModalVisible(false);
    const response = await executePreprocessApi(`${BUCKET_NAME}`, values.Files.slice(0, values.Files.length - 1));
    form.setFieldsValue({
      Folders: '',
      Files: '',
    });
  };

  const showModal = async (e, client_name, batch_name, table_name) => {
    setIsModalVisible(true);
    const res1 = await AllFoldersOfS3(client_name, batch_name, table_name);
    if (res1.status === 200) {
      setFoldersData(res1.data);
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.setFieldsValue({
      Folders: '',
      Files: '',
    });
  };

  return (
    <>
      <StyledTableRow>
        <StyledTableCell align="center">
          <h3>{source.table_name}</h3>
        </StyledTableCell>
        {/* <StyledTableCell align="center">
          <h3>{source.skip_PreProcess.toString()}</h3>
        </StyledTableCell> */}
        <StyledTableCell align="center">
          <h3>{source.extension}</h3>
        </StyledTableCell>
        <StyledTableCell
          align="center"
          style={{
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <div style={{ width: '15%' }}>
            <Tooltip title="Edit">
              <IconButton
                // disabled={jobDisable === true ? true : source.active === false ? true : false}
                disabled={jobDisable}
                onClick={() => {
                  console.log(source);
                  fetchJobNodes(source.table_name);
                }}
                color="secondary"
              >
                <EditIcon sx={{ fontSize: '1rem' }} />
              </IconButton>
            </Tooltip>
          </div>

          <div style={{ width: '15%' }}>
            <Tooltip title="Disable/Enable Job">
              <IconButton>
                <GreenSwitch
                  {...label}
                  // checked={jobDisable === true ? false : source.active === false ? false : true}
                  checked={!jobDisable || source.active}
                  size="small"
                />
              </IconButton>
            </Tooltip>
          </div>

          <div style={{ width: '15%' }}>
            <Tooltip title="Run">
              <Button
                color="primary"
                shape="circle"
                onClick={(e) => {
                  showModal(e, source.client_name, source.batch_name, source.table_name);
                  // runExecutePreprocess(e, source.client_name, source.batch_name, source.table_name);
                }}
              >
                <PlayArrowIcon
                  {...(disableRun ? { color: 'disable' } : { color: 'success' })}
                  sx={{ fontSize: '1rem', mt: 0.5 }}
                />
              </Button>
            </Tooltip>
          </div>

          <div style={{ width: '15%' }}>
            <Tooltip title="View Logs">
              <Link to={`/preprocessor/logs/${source.table_name}`} style={{ textDecoration: 'none' }}>
                <IconButton
                  color="primary"
                  aria-label="upload picture"
                  component="span"
                  style={{ border: '1px solid #ccc', margin: ' 0 10px' }}
                >
                  <FormatListBulletedIcon sx={{ fontSize: '1rem' }} />
                </IconButton>
              </Link>
            </Tooltip>
          </div>

          <div style={{ width: '10%' }}>
            <Tooltip title="Refresh Status">
              <IconButton
                color="primary"
                aria-label="upload picture"
                component="span"
                style={{ border: '1px solid #ccc', margin: ' 0 10px' }}
                // onClick={(e) => refreshBtn(e, batch.batch_name, data.tablename)}
              >
                <RefreshIcon sx={{ fontSize: '1rem' }} />
              </IconButton>
            </Tooltip>
          </div>
        </StyledTableCell>
        <StyledTableCell style={{ justifyContent: 'right' }}>
          <FormGroup>
            <FormControlLabel control={<Switch />} />
          </FormGroup>
        </StyledTableCell>
        <StyledTableCell>
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

          {jobStatus === 'Processed' && (
            <p
              style={{
                color: '#98c1d9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <PendingIcon style={{ fontSize: '18px' }} /> &nbsp;
              {jobStatus}
            </p>
          )}

          {/* <Tooltip title="Refresh Status">
                <IconButton
                  // onClick={(e) => refreshBtn(batch.batch_name, source.input_ref_key)}
                  // disabled={jobDisable === true ? true : source.active === false ? true : false}
                  disabled={jobDisable || !source.active}
                >
                  <RefreshIcon sx={{ fontSize: '1rem' }} />
                </IconButton>
              </Tooltip> */}
        </StyledTableCell>

        {/* <StyledTableCell
              align="center"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <p>Status</p>  */}

        {/* </StyledTableCell> */}
      </StyledTableRow>

      <Modal
        title="PreProcessor Execution "
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        centered
        maskClosable
      >
        <Form form={form} labelCol={{ span: 6 }} wrapperCol={{ span: 22 }} layout="horizontal" onFinish={onFinish}>
          <Form.Item
            name="Folders"
            label="TimeStamp"
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

          <Form.Item
            name="Files"
            label="File"
            rules={[
              {
                required: true,
                message: 'Please select file!',
              },
            ]}
          >
            <Select>
              {FilesData &&
                FilesData.map((ele, idx) => {
                  return (
                    <Option key={idx} value={ele.value}>
                      {ele.label}
                    </Option>
                  );
                })}
            </Select>
          </Form.Item>
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

export default memo(PreprocessTableRow);
