import React, { useState, useEffect, useContext } from 'react';
import { useSnackbar } from 'notistack';
import 'antd/dist/antd.css';
import { CheckCircleOutlined, DeleteFilled } from '@ant-design/icons';
import axios from 'axios';
import './ApprovalData.css';
import { Form, Space, Table, Typography, Button } from 'antd';

import { deleteEmployeeDetailApi, getAllEmployeeDetailsApi } from "../../api's/UserApprovalApi";
import { postManagementDetailUserApi } from "../../api's/ManagementApi";
import { AuthContext } from '../../context/AuthProvider';

const ApprovalData = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [form] = Form.useForm();
  const [usersdata, setUsersData] = useState([]);
  const [loadingStatus, setloadingStatus] = useState(true);
  const { userId } = useContext(AuthContext);
  const DeleteRecord = async (record) => {
    try {
      const response = await deleteEmployeeDetailApi(record.id);
      if (response.status === 200) {
        // const response = await getAllEmployeeDetailsApi();
        // setUsersData(response.data);
        enqueueSnackbar(`${record.username} is deleted`, {
          variant: 'success',
          autoHideDuration: 3000,
          anchorOrigin: { vertical: 'top', horizontal: 'right' },
        });
        await fetchAllEmployeeData();
      } else if (response.status === 404) {
        enqueueSnackbar(`deletion failed ${record.name}`, {
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

  const ApproveRecord = async (record) => {
    try {
      const response = await postManagementDetailUserApi(record, userId);
      if (response.status === 201) {
        // const response = await deleteEmployeeDetailApi(record.id);
        // setUsersData(response.data);
        await fetchAllEmployeeData();
        enqueueSnackbar(`${record.username} is approved`, {
          variant: 'success',
          autoHideDuration: 3000,
          anchorOrigin: { vertical: 'top', horizontal: 'right' },
        });
      } else if (response.status === 404) {
        enqueueSnackbar(`${record.username} approval failed `, {
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

  const fetchAllEmployeeData = async () => {
    const response = await getAllEmployeeDetailsApi();
    if (response.status === 200) {
      setUsersData(response.data);
      setloadingStatus(false);
    }
  };

  useEffect(() => {
    fetchAllEmployeeData();
    // console.log(usersdata)
    return () => {
      setUsersData([]);
    };
  }, []);

  const columns = [
    {
      title: 'Name',
      dataIndex: 'username',
      align: 'center',
      width: '15vw',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      align: 'center',
      width: '25vw',
      sorter: (a, b) => a.email.length - b.email.length,
    },
    {
      title: 'Role',
      dataIndex: 'role',
      align: 'center',
      width: '15vw',
    },
    {
      title: 'Domain',
      dataIndex: 'domainType',
      align: 'center',
      width: '10vw',
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
        dataSource={usersdata}
      />
    </>
  );
};

export default ApprovalData;
