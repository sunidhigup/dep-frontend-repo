import React, { useState, useEffect, useContext } from 'react';
import { useSnackbar } from 'notistack';
import 'antd/dist/antd.css';
import { CheckCircleOutlined, DeleteFilled } from '@ant-design/icons';

import '../ApprovalData.css';
import { Form, Space, Table, Typography, Button } from 'antd';

import { getClientApi, updateClientDetail } from "../../../api's/ClientApi";
import { AuthContext } from '../../../context/AuthProvider';

const ClientApprovalData = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [form] = Form.useForm();
  const { userId } = useContext(AuthContext);
  const [ClientApproval_data, setClientApproval_data] = useState([]);
  const [loadingStatus, setloadingStatus] = useState(true);

  const DeleteRecord = async (record) => {
    const data = {
      client_id: record.client_id,
      client_name: record.client_name,
      data_id: record.data_id,
      data_region: record.data_region,
      infra_id: record.infra_id,
      infra_region: record.infra_region,
      status: 'rejected',
      year_created: record.year_created,
    };
    const response = await updateClientDetail(data, userId);
    if (response.status === 200) {
      const array = [];
      const response1 = await getClientApi();
      const data1 = response1.data;
      for (let index = 0; index < data1.length; index++) {
        if (data1[index]['status'] === 'pending') {
          array.push(data1[index]);
        }
      }
      setClientApproval_data(array);
      enqueueSnackbar(`${record.client_name} is deleted`, {
        variant: 'success',
        autoHideDuration: 3000,
        anchorOrigin: { vertical: 'top', horizontal: 'right' },
      });
      fetchAllEmployeeData();
    } else if (response.status === 404) {
      enqueueSnackbar(`deletion failed ${record.client_name}`, {
        variant: 'error',
        autoHideDuration: 3000,
        anchorOrigin: { vertical: 'top', horizontal: 'right' },
      });
    }
  };

  const ApproveRecord = async (record) => {
    console.log(userId);
    const data = {
      client_id: record.client_id,
      client_name: record.client_name,
      data_id: record.data_id,
      data_region: record.data_region,
      infra_id: record.infra_id,
      infra_region: record.infra_region,
      status: 'approved',
      year_created: record.year_created,
    };
    const response = await updateClientDetail(data, userId);
    if (response.status === 200) {
      const array = [];
      const response1 = await getClientApi();
      const data1 = response1.data;
      for (let index = 0; index < data1.length; index++) {
        if (data1[index]['status'] === 'pending') {
          array.push(data1[index]);
        }
      }
      setClientApproval_data(array);
      enqueueSnackbar(`${record.client_name} is approved`, {
        variant: 'success',
        autoHideDuration: 3000,
        anchorOrigin: { vertical: 'top', horizontal: 'right' },
      });
      fetchAllEmployeeData();
    } else if (response.status === 404) {
      enqueueSnackbar(`${record.client_name} approval failed `, {
        variant: 'error',
        autoHideDuration: 3000,
        anchorOrigin: { vertical: 'top', horizontal: 'right' },
      });
    }
  };

  const fetchAllEmployeeData = async () => {
    const array = [];
    const response = await getClientApi();
    if (response.status === 200) {
      const data = response.data;
      for (let index = 0; index < data.length; index++) {
        if (data[index]['status'] === 'pending') {
          array.push(data[index]);
        }
      }
      setloadingStatus(false);
      setClientApproval_data(array);
    }
  };

  useEffect(() => {
    fetchAllEmployeeData();
    return () => {
      setClientApproval_data([]);
    };
  }, []);

  const columns = [
    {
      title: 'Client Name',
      dataIndex: 'client_name',
      align: 'center',
      width: '30vw',
      sorter: (a, b) => a.client_name.length - b.client_name.length,
    },
    {
      title: 'Created Year',
      dataIndex: 'year_created',
      align: 'center',
      width: '15vw',
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
      <Table
        rowClassName={(record, index) => (index % 2 === 0 ? 'table-row-light' : 'table-row-light')}
        bordered="true"
        pagination={{
          position: ['bottomCenter'],
          defaultPageSize: 5,
        }}
        loading={loadingStatus}
        columns={tableColumns}
        dataSource={ClientApproval_data}
      />
    </>
  );
};

export default ClientApprovalData;
