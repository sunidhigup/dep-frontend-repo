import React, { useState, useContext, useEffect } from 'react';
import { useSnackbar } from 'notistack';
import { Box, Paper } from '@mui/material';
import { Button, Form, Modal, Select, Space, Switch, Table, Tooltip, Typography } from 'antd';
import {
  CheckCircleOutlined,
  PauseCircleOutlined,
  PlayCircleFilled,
  ReloadOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DoNotDisturbOnIcon from '@mui/icons-material/DoNotDisturbOn';
import StopCircleIcon from '@mui/icons-material/StopCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import PendingIcon from '@mui/icons-material/Pending';
import Error from '@mui/icons-material/Error';
import { useNavigate } from 'react-router-dom';
import { ClientContext } from '../../context/ClientProvider';
import RealTimeHead from './RealTimeHead';
import { createEmr, terminateEmr } from "../../api's/EmrApi";
import { AuthContext } from '../../context/AuthProvider';
import { getStreamStatus } from "../../api's/StreamApi";

const RealTimePannelNew = () => {
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const { client } = useContext(ClientContext);
  const [fetchedStream, setFetchedStream] = useState([]);
  const [clusterId, setClusterId] = useState([]);
  const [loadingStatus, setloadingStatus] = useState(false);
  const { userRole } = useContext(AuthContext);
  const openStreamConfig = (record) => {
    navigate('/real-time-streaming/steps', { state: record });
  };

  const startStream = async (record) => {
    const clusterName = `${record.client_name}_${record.stream_name}`;
    const cluster = {
      clusterName,
    };
    record.status = 'RUNNING';

    const response = await createEmr(cluster);

    if (response.status === 200) {
      enqueueSnackbar('Creating EMR cluster!', {
        variant: 'success',
        autoHideDuration: 3000,
        anchorOrigin: { vertical: 'top', horizontal: 'right' },
      });
      record.clusterId = response.data;
    }
  };

  const terminateStream = async (record) => {
    record.status = 'TERMINATED';
    const response = await terminateEmr(record.clusterId);
    if (response.status === 200) {
      enqueueSnackbar('Terminating EMR cluster!', {
        variant: 'success',
        autoHideDuration: 3000,
        anchorOrigin: { vertical: 'top', horizontal: 'right' },
      });
      record.clusterId = '';
    }
  };

  const fetchEmrStatus = async (record) => {
    const clusterName = `${record.client_name}_${record.stream_name}`;
    const response = await getStreamStatus(record.client_name, record.stream_name, record.clusterId, clusterName);
    if (response.status === 200) {
      const streams = fetchedStream;

      streams.forEach((el) => {
        if (el.stream_id === response.data.stream_id) {
          el.clusterId = response.data.clusterId;
          el.clusterName = response.data.clusterName;
          el.status = response.data.status;
        }
      });

      setFetchedStream(streams);
    }
  };

  const columns = [
    {
      title: 'Stream Name',
      dataIndex: 'stream_name',
      align: 'center',
      width: '30%',
      sorter: (a, b) => a.stream_name.localeCompare(b.stream_name),
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
      title: 'Action',
      dataIndex: 'action',
      align: 'center',
      width: '30%',
      render: (_, record) => {
        return (
          <Space size="middle">
            <Typography.Link
              onClick={() => {
                if (record.status === 'RUNNING' || record.status === 'STARTING' || record.status === 'WAITING') {
                  terminateStream(record);
                } else if (record.status === 'TERMINATED' || record.status === 'unknown') {
                  startStream(record);
                }
              }}
              style={{ marginRight: 8, color: 'red' }}
            >
              <Tooltip
                title={record.status === 'TERMINATED' || record.status === 'unknown' ? 'Start EMR' : 'Terminate EMR'}
              >
                <Button
                  shape="circle"
                  icon={
                    record.status === 'TERMINATED' || record.status === 'unknown' ? (
                      <PlayCircleFilled style={{ color: 'green', fontSize: 'medium' }} />
                    ) : (
                      <StopCircleIcon style={{ color: 'red', fontSize: 'medium' }} />
                    )
                  }
                  size="medium"
                  disabled={userRole === 'ROLE_reader'}
                />
              </Tooltip>
            </Typography.Link>

            <Typography.Link
              onClick={() => {
                openStreamConfig(record);
              }}
              style={{
                marginRight: 8,
                color: 'red',
              }}
            >
              <Tooltip title="config">
                <Button
                  shape="circle"
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
          text: 'STARTING',
          value: 'STARTING',
        },
        {
          text: 'RUNNING',
          value: 'RUNNING',
        },
        {
          text: 'WAITING',
          value: 'WAITING',
        },
        {
          text: 'unknown',
          value: 'unknown',
        },
        {
          text: 'TERMINATED',
          value: 'TERMINATED',
        },
      ],
      render: (text, record) => {
        return {
          props: {
            style: { color: (record.status === 'TERMINATED' && 'green') || 'red', fontWeight: 'bold', fontSize: 14 },
          },
          children: (
            <Space size="middle">
              <Typography.Link
                onClick={() => {
                  fetchEmrStatus(record);
                }}
                style={{
                  marginRight: 28,
                  marginTop: -40,
                }}
              >
                <Tooltip title="Refresh">
                  <Button
                    shape="circle"
                    icon={<ReloadOutlined style={{ color: 'black', fontSize: 'medium' }} />}
                    size="medium"
                  />
                </Tooltip>
              </Typography.Link>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  width: '30%',
                }}
              >
                {record.status === 'TERMINATED' && (
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
                {record.status === 'RUNNING' && (
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
                {record.status === 'unknown' && (
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

                {record.status === 'WAITING' && (
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
      <RealTimeHead setFetchedStream={setFetchedStream} setClusterId={setClusterId} />

      <Paper elevation={5}>
        <div style={{ margin: 10, border: '2px solid black' }}>
          <Table
            rowClassName={(record, index) => (index % 2 === 0 ? 'table-row-light' : 'table-row-light')}
            bordered="true"
            loading={loadingStatus}
            pagination={{
              total: fetchedStream.length,
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} Streams `,
              position: ['bottomCenter'],
              defaultPageSize: 10,
              defaultCurrent: 1,
            }}
            columns={tableColumns}
            dataSource={fetchedStream}
          />
        </div>
      </Paper>
    </>
  );
};

export default RealTimePannelNew;
