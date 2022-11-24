import React, { useState, useEffect, useContext, memo } from 'react';
import { useSnackbar } from 'notistack';
import 'antd/dist/antd.css';
import { DeleteFilled } from '@ant-design/icons';
import { Button, Popconfirm, Space, Table, Typography } from 'antd';
import { deleteClientApi, getClientApi, getClientByUserId } from "../../api's/ClientApi";
import { CountContext } from '../../context/CountProvider';
import { AuthContext } from '../../context/AuthProvider';

const ClientTable = ({ fetchedClient }) => {
  const { userId, userRole } = useContext(AuthContext);
  const { CountData, setCountData } = useContext(CountContext);
  const { enqueueSnackbar } = useSnackbar();
  const [updateClient, setupdateClient] = useState(true);
  // const fetchClient = async () => {
  //   try {
  //     let response = null;
  //     if (userRole === 'ROLE_executor') {
  //       response = await getClientByUserId(userId);
  //     } else {
  //       response = await getClientApi();
  //     }

  //     if (response.status === 200) {
  //       const data = response.data.sort((a, b) => {
  //         if (a.client_name > b.client_name) return 1;

  //         return 1;
  //       });
  //       setFetchedClient(data);
  //     }
  //   } catch (error) {
  //     setFetchedClient([]);
  //   }
  // };

  // useEffect(() => {
  //   fetchClient();
  // }, [updateClient]);

  const clientCountData = () => {
    let approved = 0,
      pending = 0,
      rejected = 0;
    for (let index = 0; index < fetchedClient.length; index++) {
      const ele = fetchedClient[index];
      if (ele.status === 'pending') {
        pending++;
      } else if (ele.status === 'approved') {
        approved++;
      } else if (ele.status === 'rejected') {
        rejected++;
      }
    }
    setCountData({
      ...CountData,
      Client_approved: approved,
      Client_rejected: rejected,
      Client_pending: pending,
      Client_ready: !CountData.Client_ready,
      update_dashboard: !CountData.update_dashboard,
    });
  };

  useEffect(() => {
    clientCountData();
  }, [fetchedClient]);

  const handleDeleteClient = async (record) => {
    try {
      const response = await deleteClientApi(record.client_id);
      if (response.status === 200) {
        setupdateClient(!updateClient);
        enqueueSnackbar(`${record.client_name} is deleted`, {
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

  const confirm = (e, record) => {
    console.log(record);
    // handleDeleteClient(record)
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
      filterSearch: true,
      filters: filterData(
        fetchedClient.map((item) => item.client_name).filter((value, index, self) => self.indexOf(value) === index)
      ),
      onFilter: (value, record) => record.client_name.indexOf(value) === 0,
      sorter: (a, b) => a.client_name.localeCompare(b.client_name),
    },
    {
      title: 'Created year',
      dataIndex: 'year_created',
      align: 'center',
      width: '25vw',
    },
    {
      title: 'Infra Region',
      dataIndex: 'infra_region',
      align: 'center',
      width: '15vw',
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
              color: (text === 'approved' && 'green') || (text === 'rejected' && 'red') || 'orange',
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
                handleDeleteClient(record)
              }}
              style={{
                marginRight: 8,
                color: 'red'
              }}
            >
              <Button type="primary" shape="round" danger icon={<DeleteFilled color='red' />} size="medium" />
            </Typography.Link> */}
            <Popconfirm
              title="Are you sure to delete this client ?"
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
        <Table
          rowClassName={(record, index) => (index % 2 === 0 ? 'table-row-light' : 'table-row-light')}
          bordered="true"
          pagination={{
            position: ['bottomCenter'],
            defaultPageSize: 5,
          }}
          columns={tableColumns}
          dataSource={fetchedClient}
        />
      </div>
    </>
  );
};

export default memo(ClientTable);
