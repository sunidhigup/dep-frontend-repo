import React, { useState, useContext } from 'react';
import { useSnackbar } from 'notistack';
import { Box, Paper } from '@mui/material';
import { Button, Form, Modal, Select, Space, Switch, Table, Tooltip, Typography } from 'antd';
import {
  CheckCircleOutlined,
  EditFilled,
  PlayCircleFilled,
  RedoOutlined,
  SettingOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DoNotDisturbOnIcon from '@mui/icons-material/DoNotDisturbOn';
import CancelIcon from '@mui/icons-material/Cancel';
import PendingIcon from '@mui/icons-material/Pending';
import Error from '@mui/icons-material/Error';
import { useNavigate, Link } from 'react-router-dom';
import { BatchContext } from '../context/BatchProvider';
import { ClientContext } from '../context/ClientProvider';
import { JobContext } from '../context/JobProvider';
import { AuthContext } from '../context/AuthProvider';
import HeadOptions from '../pages/HeadOptions';
import { BUCKET_NAME } from '../constants/Constant';
import {
  AllFilesOfS3,
  AllFoldersOfS3,
  disablePreProcessorJob,
  executePreprocessApi,
  fetchPreprocessApi,
  fetchPreprocessWithStatusApi,
} from "../api's/PreprocessApi";
import { deleteJobApi, disableJobApi, enableJobApi, runJobApi } from "../api's/JobApi";
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

const { Option } = Select;

const upperComponent = {
  borderBottom: '5px solid #e9ecef',
  padding: '10px 20px',
};

const ProcessingNew = () => {
  const { enqueueSnackbar } = useSnackbar();
  const { userId } = useContext(AuthContext);
  const { batch } = useContext(BatchContext);
  const { client } = useContext(ClientContext);
  const { Job, setJob } = useContext(JobContext);
  const navigate = useNavigate();
  const { userRole } = useContext(AuthContext);
  const [fetchedPreprocess, setFetchedPreprocess] = useState([]);
  const [openLoadingModal, setOpenLoadingModal] = useState(false);

  const CountStatus_IS = {
    Completed: 0,
    Unknown: 0,
    Pending: 0,
    Failed: 0,
    'In Progress': 0,
  };
  const [statusCount, setStatusCount] = useState(CountStatus_IS);
  const [form] = Form.useForm();
  const [FoldersData, setFoldersData] = useState([]);
  const [FilesData, setFilesData] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loadingStatus, setloadingStatus] = useState(false);
  const [tableName, setTableName] = useState('');

  const handleLoadingModalOpen = () => setOpenLoadingModal(true);

  const handleLoadingModalClose = () => setOpenLoadingModal(false);

  const fetchJob = async () => {
    try {
      setloadingStatus(true);
      const response = await fetchPreprocessWithStatusApi(client.client_name, batch.batch_name);

      if (response.status === 200) {
        const statusTable = response.data;

        setFetchedPreprocess(statusTable);
        const obj = {
          ProcessedStatus: 0,
          PendingStatus: 0,
          ProgressStatus: 0,
          FailedStatus: 0,
          UnknownStatus: 0,
        };
        statusTable.forEach((ele) => {
          if (ele.status === 'Completed') {
            obj.ProcessedStatus += 1;
          } else if (ele.status === 'Pending') {
            obj.PendingStatus += 1;
          } else if (ele.status === 'In Progress') {
            obj.ProgressStatus += 1;
          } else if (ele.status === 'Failed') {
            obj.FailedStatus += 1;
          } else {
            obj.UnknownStatus += 1;
          }
        });
        setStatusCount({
          Completed: obj.ProcessedStatus,
          Pending: obj.PendingStatus,
          Failed: obj.FailedStatus,
          'In Progress': obj.ProgressStatus,
          Unknown: obj.UnknownStatus,
        });
        setloadingStatus(false);
      }
    } catch (error) {
      setFetchedPreprocess([]);

      if (error.response.status === 404) {
        enqueueSnackbar('No tables found!', {
          variant: 'warning',
          autoHideDuration: 3000,
          anchorOrigin: { vertical: 'top', horizontal: 'right' },
        });
      }
      setloadingStatus(false);
    }
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

  const getAllFiles = async (prefix) => {
    setFilesData([]);
    // console.log(prefix)
    const res = await AllFilesOfS3(client.bucket_name, client.data_region_code, prefix);
    if (res.status === 200) {
      setFilesData(res.data);
    }
  };

  const onFinish = async (values) => {
    setIsModalVisible(false);
    try {
      const response = await executePreprocessApi(
        client.bucket_name,
        client.data_region_code,
        values.Files.slice(0, values.Files.length - 1)
      );
      if (response.status === 200) {
        enqueueSnackbar(`${values.Files.split('/')[3]} Lamda Trigger`, {
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
    form.setFieldsValue({
      Folders: '',
      Files: '',
    });
  };

  const showModal = async (e, client_name, batch_name, table_name) => {
    setIsModalVisible(true);
    setTableName(table_name);
    console.log(client);
    const res1 = await AllFoldersOfS3(client.bucket_name, client.data_region_code, client_name, batch_name, table_name);
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

  const disableEnableJob = async (checked, record) => {
    try {
      const data = {
        id: record.id,
        batch_name: record.batch_name,
        client_name: record.client_name,
        disableJob: checked,
        extension: record.extension,
        fileDestination: record.fileDestination,
        pattern: record.pattern,
        skip_PreProcess: record.skip_PreProcess,
        table_name: record.table_name,
      };

      const response = await disablePreProcessorJob(data);
      if (response.status === 200) {
        record.disableJob = checked;
        const message = !checked ? `Disabling ${record.table_name} Job` : `Enabling ${record.table_name} Job`;
        enqueueSnackbar(message, {
          variant: 'success',
          autoHideDuration: 3000,
          anchorOrigin: { vertical: 'top', horizontal: 'right' },
        });
      }
    } catch (error) {
      if (error.response.status === 500) {
        enqueueSnackbar('Internal Server Error', {
          variant: 'error',
          autoHideDuration: 3000,
          anchorOrigin: { vertical: 'top', horizontal: 'right' },
        });
      }
    }
  };

  const openStreamConfig = (record) => {
    // navigate(`/preprocessor/steps`, { state: record });
    navigate(`/preprocessor/steps/${record.table_name}`, { state: record });
  };

  const columns = [
    {
      title: 'Job Name',
      dataIndex: 'table_name',
      align: 'center',
      width: '30%',
      sorter: (a, b) => a.table_name.localeCompare(b.table_name),
      render(text, record) {
        return {
          props: {
            style: {
              fontWeight: 'bold',
              fontSize: 14,
            },
          },
          children: <div>{text}</div>,
        };
      },
    },
    {
      title: 'Extension',
      dataIndex: 'extension',
      align: 'center',
      width: '10%',
      filters: [
        {
          text: 'zip',
          value: 'zip',
        },
        {
          text: 'pdf',
          value: 'pdf',
        },
        {
          text: 'mp4',
          value: 'mp4',
        },
        {
          text: 'csv',
          value: 'csv',
        },
      ],
      render(text, record) {
        return {
          props: {
            style: {
              fontWeight: 'bold',
              fontSize: 14,
            },
          },
          children: <div>{text}</div>,
        };
      },
      onFilter: (value, record) => record.extension.indexOf(value) === 0,
    },
    {
      title: 'Action',
      dataIndex: 'action',
      align: 'center',
      width: '30%',
      render: (_, record) => {
        return (
          <Space size="middle">
            <Typography.Link
              onClick={() => {
                // console.log(record)
                // fetchJobNodes(record.table_name)
              }}
              style={{ marginRight: 8, color: 'red' }}
            >
              {record.disableJob && (
                <Link to={`/preprocessor/Edit`} style={{ textDecoration: 'none' }} state={{ record }}>
                  <Tooltip title="Edit">
                    <Button
                      shape="circle"
                      disabled={!record.disableJob}
                      icon={<EditFilled style={{ color: 'blue', fontSize: 'medium' }} />}
                      size="medium"
                    />
                  </Tooltip>
                </Link>
              )}
              {!record.disableJob && (
                <Tooltip title="Edit">
                  <Button
                    shape="circle"
                    disabled={!record.disableJob || userRole === 'ROLE_reader'}
                    icon={<EditFilled style={{ color: 'blue', fontSize: 'medium' }} />}
                    size="medium"
                  />
                </Tooltip>
              )}
            </Typography.Link>
            <Typography.Link style={{ marginRight: 8, color: 'red' }}>
              <Tooltip title={record.disableJob ? 'Disable' : 'Enable'}>
                <Switch
                  checked={record.disableJob}
                  onChange={(e) => {
                    disableEnableJob(e, record);
                  }}
                />
              </Tooltip>
            </Typography.Link>
            <Typography.Link
              onClick={(e) => {
                if (record.disableJob) {
                  showModal(e, record.client_name, record.batch_name, record.table_name);
                }
              }}
              style={{
                marginRight: 8,
                color: 'red',
              }}
            >
              <Tooltip title="Run">
                <Button
                  shape="circle"
                  disabled={!record.disableJob || userRole === 'ROLE_reader'}
                  icon={<PlayCircleFilled style={{ color: 'green', fontSize: 'medium' }} />}
                  size="medium"
                />
              </Tooltip>
            </Typography.Link>
            <Typography.Link style={{ marginRight: 8, color: 'red' }}>
              {record.disableJob && (
                <Link to={`/preprocessor/logs/${record.table_name}`} state={record}>
                  <Tooltip title="Logs">
                    <Button
                      shape="circle"
                      disabled={!record.disableJob}
                      icon={<UnorderedListOutlined style={{ color: 'blue', fontSize: 'medium' }} />}
                      size="medium"
                    />
                  </Tooltip>
                </Link>
              )}
              {!record.disableJob && (
                <Tooltip title="Logs">
                  <Button
                    shape="circle"
                    disabled={!record.disableJob}
                    icon={<UnorderedListOutlined style={{ color: 'blue', fontSize: 'medium' }} />}
                    size="medium"
                  />
                </Tooltip>
              )}
            </Typography.Link>
            {/* <Typography.Link
              onClick={() => {
                // console.log(record)
              }}
              style={{
                marginRight: 8,
                color: 'red',
              }}
            >
              <Tooltip title="refresh">
                <Button
                  shape="circle"
                  disabled={!record.disableJob}
                  icon={<RedoOutlined style={{ color: 'gray', fontSize: 'medium' }} />}
                  size="medium"
                />
              </Tooltip>
            </Typography.Link> */}
            <Typography.Link
              onClick={() => {
                if (record.disableJob) {
                  openStreamConfig(record);
                }
              }}
              style={{
                marginRight: 8,
                color: 'red',
              }}
            >
              <Tooltip title="config">
                <Button
                  shape="circle"
                  disabled={!record.disableJob}
                  icon={<SettingOutlined style={{ color: 'red', fontSize: 'medium' }} />}
                  size="medium"
                />
              </Tooltip>
            </Typography.Link>
          </Space>
        );
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      align: 'center',
      width: '20%',
      filters: [
        {
          text: 'Completed',
          value: 'Completed',
        },
        {
          text: 'In Progress',
          value: 'In Progress',
        },
        {
          text: 'Unknown',
          value: 'Unknown',
        },
        {
          text: 'Pending',
          value: 'Pending',
        },
        {
          text: 'Failed',
          value: 'Failed',
        },
      ],
      render: (text, record) => {
        return {
          props: {
            style: { color: (record.status === 'Completed' && 'green') || 'red', fontWeight: 'bold', fontSize: 14 },
          },
          children: (
            <Space size="middle">
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  width: '30%',
                }}
              >
                {record.status === 'Loading...' && record.status}
                {record.status === 'Completed' && (
                  <p
                    style={{
                      color: 'green',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <CheckCircleOutlined style={{ fontSize: '18px' }} /> &nbsp;
                    {record.status}
                  </p>
                )}
                {record.status === 'In Progress' && (
                  <p
                    style={{
                      color: '#ffc300',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <AccessTimeIcon style={{ fontSize: '18px' }} /> &nbsp; {record.status}
                  </p>
                )}
                {record.status === 'Unknown' && (
                  <p
                    style={{
                      color: 'grey',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <DoNotDisturbOnIcon style={{ fontSize: '18px' }} /> &nbsp;
                    {record.status}
                  </p>
                )}

                {record.status === 'Error' && (
                  <p
                    style={{
                      color: 'red',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Error style={{ fontSize: '18px' }} /> &nbsp;
                    {record.status}
                  </p>
                )}

                {record.status === 'Failed' && (
                  <p
                    style={{
                      color: 'red',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <CancelIcon style={{ fontSize: '18px' }} /> &nbsp;
                    {record.status}
                  </p>
                )}

                {record.status === 'Pending' && (
                  <p
                    style={{
                      color: '#98c1d9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <PendingIcon style={{ fontSize: '18px' }} /> &nbsp;
                    {record.status}
                  </p>
                )}
              </div>
            </Space>
          ),
        };
      },
      onFilter: (value, record) => record.status.indexOf(value) === 0,
    },
  ];

  const tableColumns = columns.map((item) => ({ ...item }));

  return (
    <>
      <HeadOptions fetchJob={fetchJob} />

      <Paper elevation={5}>
        <Box style={upperComponent}>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <h3 style={{ color: 'blue', fontWeight: 'bold' }}>{batch.batch_name} </h3>
          </div>
        </Box>
        <Box>
          <div style={{ display: 'flex', flexDirection: 'row-reverse', marginTop: 5, marginRight: 20 }}>
            <div style={{ marginRight: '7px', color: 'gray', fontWeight: 'bold' }}>
              Unknown = {statusCount.Unknown} ;
            </div>
            <div style={{ marginRight: '7px', color: 'red', fontWeight: 'bold' }}>Failed = {statusCount.Failed} ;</div>
            <div style={{ marginRight: '7px', color: 'orange', fontWeight: 'bold' }}>
              Progress = {statusCount['In Progress']} ;
            </div>
            <div style={{ marginRight: '7px', color: 'blue', fontWeight: 'bold' }}>
              Pending = {statusCount.Pending} ;
            </div>
            <div style={{ marginRight: '7px', color: 'green', fontWeight: 'bold' }}>
              {' '}
              Completed = {statusCount.Completed} ;
            </div>
          </div>
        </Box>
        <div style={{ margin: 10, border: '2px solid black' }}>
          <Table
            rowClassName={(record, index) => (index % 2 === 0 ? 'table-row-light' : 'table-row-light')}
            bordered="true"
            loading={loadingStatus}
            pagination={{
              total: fetchedPreprocess.length,
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} Rules  `,
              position: ['bottomCenter'],
              defaultPageSize: 10,
              defaultCurrent: 1,
            }}
            columns={tableColumns}
            dataSource={fetchedPreprocess}
          />
        </div>
      </Paper>

      <Modal
        title={`${tableName} PreProcessor Execution`}
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

export default ProcessingNew;
