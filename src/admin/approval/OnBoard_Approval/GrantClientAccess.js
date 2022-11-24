import React, { useContext, useEffect, useState } from 'react';
import { Table, Typography, Input, Form, Popconfirm, Tag, Select } from 'antd';
import { AuthContext } from '../../../context/AuthProvider';
import { getClientApi, getClientByUserId, grantClientAccessToUser } from "../../../api's/ClientApi";
import { getAllUsersByAdminApi } from "../../../api's/ManagementApi";

const { Option } = Select;
const EditableCell = ({ editing, dataIndex, title, inputType, record, index, children, allusers, ...restProps }) => {
  const inputNode =
    inputType === 'typeSelect' ? (
      <Select>
        {allusers &&
          allusers.map((ftv) => {
            return (
              <Option key={ftv.id} value={ftv.email}>
                {ftv.username}
              </Option>
            );
          })}
      </Select>
    ) : (
      <Input />
    );
  return (
    <td {...restProps}>
      {editing ? (
        <Form.Item
          name={dataIndex}
          style={{
            margin: 0,
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
function GrantClientAccess() {
  const [allusers, setAllUsers] = useState([]);
  const { user, userId } = useContext(AuthContext);
  const [adminClients, setAdminClients] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [editingKey, setEditingKey] = useState('');
  const [form] = Form.useForm();
  const [loadingStatus, setloadingStatus] = useState(true);
  const isEditing = (record) => record.key === editingKey;
  const [isFetch, setIsFetch] = useState(false);
  const getAllUserFromAdminId = async () => {
    const response = await getAllUsersByAdminApi(userId);

    if (response.status === 200) {
      setAllUsers(response.data);
      await fetchClientByAdminId();
    }
  };
  const fetchClientByAdminId = async () => {
    const respoonse = await getClientApi();

    if (respoonse.status === 200) {
      setAdminClients(respoonse.data);
      setIsFetch(true);
    }
  };

  const loadUsers = async (record) => {
    const arr = [];
    return { ...record, arr };
  };
  const fetchClient = async () => {
    console.log(adminClients);
    console.log(allusers);
    const array = adminClients;
    const promises = [];
    array.forEach((ele) => {
      promises.push(loadUsers(ele));
    });
    const statusTable = await Promise.all(promises);
    console.log(statusTable);
    setTableData(statusTable);
  };

  // -------------- edit and save operation start ---------
  const edit = async (record) => {
    const response = await getAllUsersByAdminApi(userId);

    if (response.status === 200) {
      setAllUsers(response.data);
    }
    form.setFieldsValue({
      client_name: '',
      allusers: [],

      ...record,
    });
    setEditingKey(record.key);
  };

  const cancel = () => {
    setEditingKey('');
  };

  const save = async (key, record) => {
    try {
      const row = await form.validateFields();
      const newData = [...tableData];
      console.log(newData);
      const index = newData.findIndex((item) => key === item.client_id);

      if (index > -1) {
        const item = newData[index];
        newData.splice(index, 1, { ...item, ...row });
        setTableData(newData);
        setEditingKey('');
      } else {
        newData.push(row);
        setTableData(newData);
        setEditingKey('');
      }
      console.log(newData[index].allusers);
      console.log(key);
      const response = await grantClientAccessToUser(newData[index].allusers, key);
      if (response.status === 200) {
        console.log(response.data);
        // getAllUserFromAdminId();
      }
    } catch (errInfo) {
      console.log('Validate Failed:', errInfo);
    }
  };

  // ----------------------------fetch client and user for table ----

  useEffect(() => {
    getAllUserFromAdminId();
  }, []);

  useEffect(() => {
    if (isFetch) {
      fetchClient();
    }
  }, [isFetch]);
  const columns = [
    {
      title: 'Client Name',
      dataIndex: 'client_name',
      align: 'center',
      width: '15vw',
    },
    {
      title: 'User',
      dataIndex: 'allusers',
      align: 'center',
      width: '30%',
      editable: true,
      // render: (_, { allusers }) => (
      //   <>

      //         return (
      //           <Tag color={color} key={user.id}>
      //             {user.username}
      //           </Tag>
      //         );

      //   </>
      // ),
    },

    {
      title: 'Action',
      key: 'action',
      sorter: false,
      render: (_, record) => {
        const editable = isEditing(record);
        return editable ? (
          <span>
            <Typography.Link
              onClick={() => save(record.client_id, record)}
              style={{
                marginRight: 8,
              }}
            >
              Save
            </Typography.Link>
            <Popconfirm title="Sure to cancel?" onConfirm={cancel}>
              <a>Cancel</a>
            </Popconfirm>
          </span>
        ) : (
          <Typography.Link disabled={editingKey !== ''} onClick={() => edit(record)}>
            Edit
          </Typography.Link>
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
        inputType: col.dataIndex === 'allusers' ? 'typeSelect' : 'text',
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),

        allusers,
      }),
    };
  });

  return (
    <>
      <div style={{ margin: 10, border: '2px solid black' }}>
        <Form form={form} component={false}>
          <Table
            rowClassName={(record, index) => (index % 2 === 0 ? 'table-row-light' : 'table-row-light')}
            bordered="true"
            rowKey="client_name"
            // loading={loadingStatus}
            components={{
              body: {
                cell: EditableCell,
              },
            }}
            pagination={{
              total: tableData.length,
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} Users  `,
              position: ['bottomCenter'],
              defaultPageSize: 10,
              showSizeChanger: true,
              defaultCurrent: 1,
            }}
            columns={mergedColumns}
            dataSource={tableData}
          />
        </Form>
      </div>
    </>
  );
}

export default GrantClientAccess;
