import React, { useState, useEffect } from 'react';
import { useSnackbar } from 'notistack';
import 'antd/dist/antd.css';
import { CheckCircleOutlined, DeleteFilled } from '@ant-design/icons';
import { Form, Space, Table, Typography, Button } from 'antd';
import { Box, Divider, Paper } from '@mui/material';
import { getAllBatchApi, updateBatchStatusApi } from "../../../api's/BatchApi";

const BatchApprovalData = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [fetchedClientDataRecieved, setfetchedClientDataRecieved] = useState(false);
  const [fetchedBatch, setFetchedBatch] = useState([]);
  const [loadingStatus, setloadingStatus] = useState(true);

  const DeleteRecord = async (record) => {
    const array = [];
    const data = { ...record, status: 'rejected' };
    const response = await updateBatchStatusApi(data);
    if (response.status === 200) {
      // setfetchedClientDataRecieved(!fetchedClientDataRecieved);
      enqueueSnackbar(`${record.batch_name} batch is deleted`, {
        variant: 'success',
        autoHideDuration: 3000,
        anchorOrigin: { vertical: 'top', horizontal: 'right' },
      });
      fetchAllBatch();
    } else if (response.status === 404) {
      enqueueSnackbar(`deletion failed ${record.batch_name}`, {
        variant: 'error',
        autoHideDuration: 3000,
        anchorOrigin: { vertical: 'top', horizontal: 'right' },
      });
    }
  };

  const ApproveRecord = async (record) => {
    const array = [];
    const data = { ...record, status: 'approved' };
    const response = await updateBatchStatusApi(data);
    if (response.status === 200) {
      // setfetchedClientDataRecieved(!fetchedClientDataRecieved);
      enqueueSnackbar(`${record.client_name}-${record.batch_name} is approved`, {
        variant: 'success',
        autoHideDuration: 3000,
        anchorOrigin: { vertical: 'top', horizontal: 'right' },
      });
      fetchAllBatch();
    } else if (response.status === 404) {
      enqueueSnackbar(`${record.client_name}-${record.batch_name} approval failed `, {
        variant: 'error',
        autoHideDuration: 3000,
        anchorOrigin: { vertical: 'top', horizontal: 'right' },
      });
    }
  };

  const fetchAllBatch = async () => {
    setloadingStatus(true);
    try {
      const response = await getAllBatchApi();

      if (response.status === 200) {
        const pendingBatch = [];
        response.data.map((item) => {
          if (item.status === 'pending') {
            pendingBatch.push(item);
          }
        });
        setFetchedBatch(pendingBatch);
      }
    } catch (error) {
      setFetchedBatch([]);
    }
    setloadingStatus(false);
  };

  useEffect(() => {
    fetchAllBatch();
  }, []);

  const columns = [
    {
      title: 'Client Name',
      dataIndex: 'client_name',
      align: 'center',
      width: '15vw',
      sorter: (a, b) => a.client_name.length - b.client_name.length,
    },
    {
      title: 'Batch Name',
      dataIndex: 'batch_name',
      align: 'center',
      width: '25vw',
      sorter: (a, b) => a.batch_name.length - b.batch_name.length,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      align: 'center',
      width: '15vw',
    },
    {
      title: 'Action',
      key: 'action',
      sorter: false,
      render: (_, record) => {
        return (
          <Space size="middle">
            <Typography.Link
              onClick={() => {
                ApproveRecord(record);
              }}
              style={{
                marginRight: 8,
                color: 'green',
              }}
            >
              <Button
                type="primary"
                shape="round"
                ghost
                style={{ color: 'white', backgroundColor: 'green' }}
                icon={<CheckCircleOutlined />}
                size="middle"
              >
                Approve
              </Button>
            </Typography.Link>
            <Typography.Link
              onClick={() => {
                DeleteRecord(record);
              }}
              style={{
                marginRight: 8,
                color: 'red',
              }}
            >
              <Button type="primary" shape="round" danger icon={<DeleteFilled />} size="medium">
                Reject
              </Button>
            </Typography.Link>
          </Space>
        );
      },
    },
  ];

  const tableColumns = columns.map((item) => ({ ...item }));
  return (
    <>
      <Divider />
      <Table
        rowClassName={(record, index) => (index % 2 === 0 ? 'table-row-light' : 'table-row-light')}
        bordered="true"
        loading={loadingStatus}
        pagination={{
          position: ['bottomCenter'],
          defaultPageSize: 5,
        }}
        columns={tableColumns}
        dataSource={fetchedBatch}
      />
    </>
  );
};

export default BatchApprovalData;
