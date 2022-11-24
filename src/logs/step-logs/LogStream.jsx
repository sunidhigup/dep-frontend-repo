import React, { useContext, useEffect, useState } from 'react';
import { Breadcrumbs } from '@mui/material';
import { Box } from '@mui/system';
import { useSnackbar } from 'notistack';
import { Link, useNavigate, useParams } from 'react-router-dom';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import 'antd/dist/antd.css';
import { Space, Table, Typography, Button, Tooltip } from 'antd';
import { ArrowRightOutlined, PlayCircleFilled } from '@ant-design/icons';
import LoadingIcon from '../../reusable-components/LoadingIcon';
import { JobContext } from '../../context/JobProvider';
import { BatchContext } from '../../context/BatchProvider';
import { ClientContext } from '../../context/ClientProvider';
import { StreamContext } from '../../context/StreamProvider';

import { getFlowBuilderLogStreamApi, getFlowBuilderLogStreamApiStatus } from "../../api's/LogsApi";
import { getFlowBuilderFormApi, createFlowBuilderJsonApi } from "../../api's/FlowBuilderApi";
import convertToRequiredFormat from '../../flow-builder/JsonConverter';
import { updateExtractJobApi, runJobApi } from "../../api's/JobApi";
import { createBatchidApi } from "../../api's/BatchApi";

const LogStream = () => {
  const { enqueueSnackbar } = useSnackbar();
  const { client } = useContext(ClientContext);
  const { batch } = useContext(BatchContext);
  const { Job, setJob } = useContext(JobContext);
  const { setStream } = useContext(StreamContext);

  const navigate = useNavigate();
  const [logStream, setLogStream] = useState([]);
  const [loading, setloading] = useState(true);

  const params = useParams();
  console.log(params);

  const getEachLogStreamStatus = async (execution_id, timestamp, log_stream_name) => {
    try {
      const result = await getFlowBuilderLogStreamApiStatus(execution_id);
      const data = {
        status: result.data.status,
        timestamp,
        log_stream_name,
      };
      return data;
    } catch {
      const data = {
        status: 'Not found',
        timestamp,
        log_stream_name,
      };
      return data;
    }
  };

  const getLogs = async () => {
    setloading(true);
    const prefix = `${client.client_name}_${batch.batch_name}_${Job}`;
    const response = await getFlowBuilderLogStreamApi(prefix);
    const data = response.data;
    const array = [];
    data.forEach((ele) => {
      if (ele.timestamp) {
        const log_stream_name = ele.log_stream_name;
        if (log_stream_name.indexOf('___') !== -1) {
          array.push({ timestamp: ele.timestamp, log_stream_name });
        }
      }
    });

    const promises = [];
    array.forEach((ele) => {
      const execution_id = ele.log_stream_name.split('___')[0];
      if (execution_id) {
        promises.push(getEachLogStreamStatus(execution_id, ele.timestamp, ele.log_stream_name));
      }
    });

    const status = await Promise.all(promises);
    setloading(false);
    setLogStream(status);
  };

  useEffect(() => {
    getLogs();

    return () => {
      setLogStream();
    };
  }, []);

  const saveAndCreateJson = async (job) => {
    setStream(null);

    if (Job === job) {
      // setJob(job);
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

  const saveFormData = async (trackingId, TimestampType) => {
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
      const formData = convertToRequiredFormat(getAllDataFromLocalStorage, trackingId);
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

      // console.log(source);
      const createFormJson = await createFlowBuilderJsonApi(
        client.client_name,
        batch.batch_name,
        Job,
        formData,
        trackingId,
        TimestampType
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

  const handleRunJob = async (job, new_execution_id) => {
    // handleRunJobModalClose();

    if (Job !== job) {
      setJob(job);
    }

    try {
      // const batch_id = `${client.client_name}_${batch.batch_name}_${job}_dataProcessor_${new Date().getTime()}`;
      // const batch_id = `${client.client_name}_${batch.batch_name}_${job}_dataProcessor_${trackingId}`;
      const batch_id = `${new_execution_id}`;

      const client_job = `${client.client_name}_${batch.batch_name}_${job}_dataProcessor`;

      const data = {
        client_job: client_job.replaceAll(' ', ''),
        batch_id: batch_id.replaceAll(' ', ''),
      };

      const response = await createBatchidApi(data);

      const emrJob = {
        batch: batch.batch_name,
        job_id: params.job_id,
        execution_id: batch_id.replaceAll(' ', ''),
        client_id: client.client_id,
        batch_id: batch.batch_id,
        client_name: client.client_name,
      };

      // const snowFlake = {
      //   batch: batch.batch_name,
      //   job_id: source.job_id,
      //   execution_id: batch_id.replaceAll(' ', ''),
      //   client_id: client.client_id,
      //   batch_id: batch.batch_id,
      //   client_name: client.client_name,
      //   connectionType: region,
      //   connectionName,
      // };

      // let input;

      // if (region === '') {
      //   input = emrJob;
      // } else {
      //   input = snowFlake;
      // }

      const input = emrJob;

      const response1 = await runJobApi(input);

      if (response1.status === 200) {
        // setRunDisabled(true);
        // setJobStatus('In Progress');
        // setBatchId(batch_id);
        // handleBatchIdModalOpen();
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

  const runButtonClick = async (record) => {
    console.log(record);

    const new_execution_id = record.log_stream_name.split('___')[0];
    const spli = new_execution_id.split('_');
    const track_id = spli[spli.length - 1];

    console.log(new_execution_id);
    console.log(spli);
    console.log(track_id);
    console.log(Job);

    await saveAndCreateJson(Job);
    await saveFormData(track_id, 'Data_Processor');
    await UpdateExtractJob(track_id, Job);
    await handleRunJob(Job, new_execution_id);
  };

  const columns = [
    {
      title: 'Stream Name',
      dataIndex: 'log_stream_name',
      align: 'center',
      width: '50%',
      render: (text, record) => <div style={{ wordWrap: 'break-word', wordBreak: 'break-word' }}>{text}</div>,
    },
    {
      title: 'Timestamp',
      dataIndex: 'timestamp',
      align: 'center',
      width: '20%',
    },
    {
      title: 'Run',
      dataIndex: 'run',
      align: 'center',
      width: '5vw',
      render: (_, record) => (
        <Space size="middle">
          {
            <Typography.Link
              onClick={() => {
                runButtonClick(record);
              }}
              style={{ marginRight: 8, color: 'red' }}
            >
              <Tooltip title="Run">
                <Button
                  shape="circle"
                  icon={<PlayCircleFilled style={{ color: 'green', fontSize: 'medium' }} />}
                  size="medium"
                />
              </Tooltip>
            </Typography.Link>
          }
        </Space>
      ),
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
          text: 'Failed',
          value: 'Failed',
        },
        {
          text: 'Running',
          value: 'Running',
        },
      ],
      render(text, record) {
        return {
          props: {
            style: {
              color:
                (text === 'Completed' && 'green') ||
                (text === 'Failed' && 'red') ||
                (text === 'Runnung' && 'blue') ||
                'orange',
              fontWeight: 'bold',
              fontSize: 14,
            },
          },
          children: <div>{text}</div>,
        };
      },
      onFilter: (value, record) => record.status.indexOf(value) === 0,
    },
    {
      title: 'Action',
      key: 'action',
      align: 'center',
      render: (_, record) => (
        <Space size="middle">
          <Typography.Link
            onClick={() => {
              navigate(
                `/flow-builder/logs/step-logs/log-event/${batch.batch_name}/${record.log_stream_name}/${record.timestamp}/${record.status}`
              );
            }}
            style={{
              marginRight: 8,
              color: 'red',
            }}
          >
            <Button
              type="primary"
              shape="round"
              icon={<ArrowRightOutlined style={{ fontSize: 18, fontWeight: 'bold' }} />}
              size="small"
            >
              Detailed Logs
            </Button>
          </Typography.Link>
        </Space>
      ),
    },
  ];

  const tableColumns = columns.map((item) => ({ ...item }));

  return (
    <Box sx={{ backgroundColor: '#fff', borderRadius: '10px', p: 2 }}>
      <Breadcrumbs
        separator={<NavigateNextIcon fontSize="small" style={{ marginBottom: '15px' }} />}
        aria-label="breadcrumb"
      >
        <Link to={`/flow-builder`} style={{ textDecoration: 'none' }}>
          <p style={{ cursor: 'pointer' }}>{batch.batch_name}</p>
        </Link>

        <p style={{ color: '#6c757d' }}>{Job}</p>
      </Breadcrumbs>
      {loading && (
        <Box>
          <LoadingIcon />
        </Box>
      )}

      {!loading && (
        <>
          {logStream && logStream.length === 0 ? (
            <h3 style={{ margin: '20px 0' }}> No Logs Found.</h3>
          ) : (
            <div style={{ marginTop: 10, border: '2px solid black' }}>
              <Table
                rowClassName={(record, index) => (index % 2 === 0 ? 'table-row-light' : 'table-row-light')}
                bordered="true"
                pagination={{
                  position: ['bottomCenter'],
                  defaultPageSize: 5,
                }}
                columns={tableColumns}
                dataSource={logStream}
                style={{ maxWidth: '800px !important' }}
              />
            </div>
          )}
        </>
      )}
    </Box>
  );
};

export default LogStream;
