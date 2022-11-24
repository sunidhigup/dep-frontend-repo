import React, { useState, useEffect, useContext } from 'react';
import { useSnackbar } from 'notistack';
import 'antd/dist/antd.css';
import { CheckCircleOutlined, DeleteFilled } from '@ant-design/icons';
import { Box, Divider, Paper } from '@mui/material';
import { Button, Popconfirm, Space, Table, Typography } from 'antd';
import { deleteBatchApi, getBatchApi } from "../../api's/BatchApi";
import { getClientApi, getClientByUserId } from "../../api's/ClientApi";
import { CountContext } from '../../context/CountProvider';
import { AuthContext } from '../../context/AuthProvider';

const BatchTable = ({ fetchedBatch }) => {
  const { enqueueSnackbar } = useSnackbar();
  const { CountData, setCountData } = useContext(CountContext);
  const [fetchedClient, setFetchedClient] = useState([]);
  const [fetchedClientDataRecieved, setfetchedClientDataRecieved] = useState(false);
  const [fetchedBatchDataRecieved, setfetchedBatchDataRecieved] = useState(false);
  // const [fetchedBatch, setFetchedBatch] = useState([]);
  const { userRole, userId } = useContext(AuthContext);
  const fetchClient = async () => {
    try {
      let response = null;
      if (userRole === 'ROLE_executor') {
        response = await getClientByUserId(userId);
      } else {
        response = await getClientApi();
      }

      if (response.status === 200) {
        setFetchedClient(response.data);
        setfetchedClientDataRecieved(!fetchedClientDataRecieved);
      }
    } catch (error) {
      setFetchedClient([]);
    }
  };

  const setBatchCount = async () => {
    let approved = 0,
      pending = 0,
      rejected = 0,
      unknown = 0;
    for (let index = 0; index < fetchedBatch.length; index++) {
      const ele = fetchedBatch[index];
      if (ele.status === 'pending') {
        pending++;
      } else if (ele.status === 'approved') {
        approved++;
      } else if (ele.status === 'rejected') {
        rejected++;
      } else {
        unknown++;
      }
    }
    setCountData({
      ...CountData,
      Batch_approved: approved,
      Batch_rejected: rejected,
      Batch_pending: pending,
      Batch_unknown: unknown,
      Batch_ready: !CountData.Batch_ready,
    });
  };

  const fetchBatch = async () => {
    const array = [];
    const result = fetchedClient.map(async (el) => {
      const client_id = el.client_id;
      const client_name = el.client_name;
      await getBatchApi(client_id)
        .then((response) => {
          // console.log(response.data)
          response.data.map((item) => {
            const obj = { client_name, batch_id: item.batch_id, batch_name: item.batch_name, status: item.status };
            array.push(obj);
          });
        })
        .catch((error) => {
          // console.log(error)
          const obj = { client_name, batch_name: 'null', status: 'unknown' };
          // array.push(obj);
        });
      return array;
    });
    const res1 = await Promise.all(result);
    return array;
  };
  useEffect(() => {
    fetchClient();
  }, []);

  useEffect(() => {
    setBatchCount();
  }, [fetchedClientDataRecieved]);

  const handleDeleteBatch = async (batch) => {
    try {
      const response = await deleteBatchApi(batch.batch_id);
      if (response.status === 200) {
        enqueueSnackbar(`${batch.batch_name} is deleted`, {
          variant: 'success',
          autoHideDuration: 3000,
          anchorOrigin: { vertical: 'top', horizontal: 'right' },
        });
      } else {
        enqueueSnackbar(`Internal server error`, {
          variant: 'error',
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

  useEffect(() => {
    setBatchCount();
  }, []);

  const confirm = (e, record) => {
    console.log(record);
    // handleDeleteBatch(record)
  };

  const cancel = (e) => {
    // console.log(e);
  };

  const filterData = (data) =>
    data.map((item) => ({
      key: item,
      value: item,
      text: item,
    }));

  const columns = [
    {
      title: 'Client Name',
      dataIndex: 'client_name',
      align: 'center',
      width: '15vw',
      filters: filterData(
        fetchedClient.map((item) => item.client_name).filter((value, index, self) => self.indexOf(value) === index)
      ),
      onFilter: (value, record) => record.client_name.indexOf(value) === 0,
      sorter: (a, b) => a.client_name.localeCompare(b.client_name),
    },
    {
      title: 'Batch Name',
      dataIndex: 'batch_name',
      align: 'center',
      width: '25vw',
      filterSearch: true,
      filters: filterData(
        fetchedBatch.map((item) => item.batch_name).filter((value, index, self) => self.indexOf(value) === index)
      ),
      onFilter: (value, record) => record.batch_name.indexOf(value) === 0,
      sorter: (a, b) => a.batch_name.localeCompare(b.batch_name),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      align: 'center',
      width: '15vw',
      filters: [
        {
          text: 'approved',
          value: 'approved',
        },
        {
          text: 'pending',
          value: 'pending',
        },
        {
          text: 'rejected',
          value: 'rejected',
        },
      ],
      render(text, record) {
        return {
          props: {
            style: {
              color:
                (text === 'approved' && 'green') ||
                (text === 'rejected' && 'red') ||
                (text === 'unknown' && 'grey') ||
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
      dataIndex: 'action',
      align: 'center',
      render: (text, record) => {
        return (
          <Space>
            {/* <Typography.Link
              onClick={() => {
                handleDeleteBatch(record)
              }}
              style={{
                marginRight: 8,
                color: 'red'
              }}
            >
              <Button type="primary" shape="round" danger icon={<DeleteFilled color='red' />} size="medium" />
            </Typography.Link> */}
            <Popconfirm
              title="Are you sure to delete this batch ?"
              onConfirm={(e) => confirm(e, record)}
              onCancel={cancel}
              okText="Yes"
              cancelText="No"
            >
              <Button type="primary" shape="round" danger icon={<DeleteFilled color="red" />} size="medium" />
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  const tableColumns = columns.map((item) => ({ ...item }));
  return (
    <>
      <div style={{ marginTop: 10 }}>
        <Divider />
        <Table
          rowClassName={(record, index) => (index % 2 === 0 ? 'table-row-light' : 'table-row-light')}
          bordered="true"
          pagination={{
            position: ['bottomCenter'],
            defaultPageSize: 5,
          }}
          columns={tableColumns}
          dataSource={fetchedBatch}
        />
      </div>
    </>
  );
};

export default BatchTable;
