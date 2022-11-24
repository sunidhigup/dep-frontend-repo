import React, { useState, useEffect } from 'react';
import { useSnackbar } from 'notistack';
import { EditFilled, DeleteFilled } from '@ant-design/icons';
import 'antd/dist/antd.css';
import './ManagementData.css';
import { Form, Input, Popconfirm, Space, Table, Typography, Button, Radio } from 'antd';
import {
  deleteManagementDetailUserApi,
  getAllManagementDetailsApi,
  updateManagementDetailUserApi,
} from "../../api's/ManagementApi";
import { ADMIN_ALWAYS } from '../../constants/Constant';

const plainOptions = ['executor', 'reader', 'admin'];
const EditableCell = ({ editing, dataIndex, title, inputType, record, index, children, ...restProps }) => {
  const inputNode = inputType === 'radio' ? <Radio.Group options={plainOptions} /> : <Input />;
  return (
    <td {...restProps}>
      {editing ? (
        <Form.Item
          name={dataIndex}
          style={{
            margin: 0,
            width: dataIndex === 'email' ? '15vw' : '10vw',
          }}
          rules={[
            {
              required: true,
              message: `Please Input ${title}!`,
            },
          ]}
        >
          {inputNode}
        </Form.Item>
      ) : (
        children
      )}
    </td>
  );
};

const ManagementData = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [form] = Form.useForm();
  const [usersdata, setUsersData] = useState([]);
  const [editingKey, setEditingKey] = useState('');
  const [loadingStatus, setloadingStatus] = useState(true);

  const isEditing = (record) => record.email === editingKey;

  const cancel = () => {
    setEditingKey('');
  };

  const save = async (record, email) => {
    try {
      const row = await form.validateFields();
      const newData = [...usersdata];
      const index = newData.findIndex((item) => email === item.email);

      if (index > -1) {
        const item = newData[index];
        newData.splice(index, 1, { ...item, ...row });
        const response = await updateManagementDetailUserApi(newData[index]);
        if (response.status === 200) {
          setUsersData(newData);
          setEditingKey('');
          enqueueSnackbar(` ${record.username} profile has been updated`, {
            variant: 'success',
            autoHideDuration: 3000,
            anchorOrigin: { vertical: 'top', horizontal: 'right' },
          });
        } else {
          enqueueSnackbar(`server error`, {
            variant: 'error',
            autoHideDuration: 3000,
            anchorOrigin: { vertical: 'top', horizontal: 'right' },
          });
        }
      } else {
        newData.push(row);
        setUsersData(newData);
        setEditingKey('');
      }
    } catch (error) {
      // console.log('Validate Failed:', error);
      if (error.response.status === 403) {
        enqueueSnackbar('You have only Read Permission !!', {
          variant: 'error',
          autoHideDuration: 3000,
          anchorOrigin: { vertical: 'top', horizontal: 'right' },
        });
      }
    }
  };
  const DeleteRecord = async (record) => {
    try {
      const response = await deleteManagementDetailUserApi(record.id);
      if (response.status === 200) {
        const response = await getAllManagementDetailsApi();
        setUsersData(response.data);
        enqueueSnackbar(`${record.username} is deleted`, {
          variant: 'success',
          autoHideDuration: 3000,
          anchorOrigin: { vertical: 'top', horizontal: 'right' },
        });
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

  const fetchAllManagementData = async () => {
    const response = await getAllManagementDetailsApi();
    if (response.status === 200) {
      setUsersData(response.data);
      setloadingStatus(false);
    }
  };

  useEffect(() => {
    fetchAllManagementData();
    return () => {
      setUsersData([]);
    };
  }, []);

  const EditRecord = (record) => {
    console.log(record);
    form.setFieldsValue({
      name: '',
      age: '',
      role: '',
      ...record,
    });
    setEditingKey(record.email);
  };
  const columns = [
    {
      title: 'UserName',
      dataIndex: 'username',
      editable: true,
      align: 'center',
      width: '20vw',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      editable: false,
      align: 'center',
      width: '25vw',
      sorter: (a, b) => a.email.length - b.email.length,
    },
    {
      title: 'Role',
      dataIndex: 'role',
      editable: true,
      width: '10vw',
      filters: [
        {
          text: 'admin',
          value: 'admin',
        },
        {
          text: 'reader',
          value: 'reader',
        },
        {
          text: 'executor',
          value: 'executor',
        },
      ],
      render(text, record) {
        return {
          props: {
            style: {
              color: text === 'admin' ? 'red' : text === 'executor' ? 'blue' : 'green',
              fontWeight: 'bold',
              fontSize: 14,
            },
          },
          children: <div>{text}</div>,
        };
      },
      onFilter: (value, record) => record.role.indexOf(value) === 0,
    },
    {
      title: 'Domain',
      dataIndex: 'domainType',
      align: 'center',
      width: '15vw',
    },
    {
      title: 'user status',
      dataIndex: 'status',
      align: 'center',
      width: '10vw',
    },
    {
      title: 'Action',
      key: 'action',
      align: 'center',
      sorter: false,
      render: (_, record) => {
        const editable = isEditing(record);
        return !editable ? (
          <Space size="middle">
            <Typography.Link
              onClick={() => {
                // console.log(record)
                if (record.email !== ADMIN_ALWAYS) {
                  EditRecord(record);
                } else {
                  enqueueSnackbar(`You can't change role of ${ADMIN_ALWAYS} !!`, {
                    variant: 'error',
                    autoHideDuration: 3000,
                    anchorOrigin: { vertical: 'top', horizontal: 'right' },
                  });
                }
              }}
              style={{
                marginRight: 8,
              }}
            >
              <Button type="primary" shape="round" icon={<EditFilled />} size="small">
                Edit
              </Button>
            </Typography.Link>
            <Typography.Link
              onClick={() => {
                if (record.email !== ADMIN_ALWAYS) {
                  DeleteRecord(record);
                } else {
                  enqueueSnackbar(`You can't delete role of ${ADMIN_ALWAYS} !!`, {
                    variant: 'error',
                    autoHideDuration: 3000,
                    anchorOrigin: { vertical: 'top', horizontal: 'right' },
                  });
                }
              }}
              style={{
                marginRight: 8,
                color: 'red',
              }}
            >
              <Button type="primary" shape="round" danger icon={<DeleteFilled />} size="small">
                Delete
              </Button>
            </Typography.Link>
          </Space>
        ) : (
          <Space size="middle">
            <Typography.Link onClick={() => save(record, record.email)}>
              <Button type="primary" shape="round" size="small" style={{ color: 'white', backgroundColor: 'green' }}>
                save
              </Button>
            </Typography.Link>
            <Popconfirm title="Sure to cancel?" onConfirm={cancel}>
              <Button type="primary" shape="round" size="small">
                cancel
              </Button>
            </Popconfirm>
            <Typography.Link
              onClick={() => {
                DeleteRecord(record);
              }}
              style={{
                marginRight: 8,
                color: 'red',
              }}
            >
              <Button type="primary" shape="round" danger icon={<DeleteFilled />} size="small">
                Delete
              </Button>
            </Typography.Link>
          </Space>
        );
      },
    },
  ];

  const mergedColumns = columns.map((col) => {
    if (!col.editable) {
      return col;
    }

    return {
      ...col,
      onCell: (record) => ({
        record,
        inputType: col.dataIndex === 'role' ? 'radio' : 'text',
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
      }),
    };
  });
  return (
    <>
      <Form form={form} component={false}>
        <Table
          rowClassName={(record, index) => (index % 2 === 0 ? 'table-row-light' : 'table-row-light')}
          bordered="true"
          components={{
            body: {
              cell: EditableCell,
            },
          }}
          loading={loadingStatus}
          pagination={{
            position: ['bottomCenter'],
            defaultPageSize: 5,
          }}
          columns={mergedColumns}
          dataSource={usersdata}
        />
      </Form>
    </>
  );
};

export default ManagementData;
