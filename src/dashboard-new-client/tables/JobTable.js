import React, { useState, useEffect, useContext } from 'react';
import { useSnackbar } from 'notistack';
import 'antd/dist/antd.css';
import { Divider } from '@mui/material';
import { DeleteFilled } from '@ant-design/icons';
import { Button, Popconfirm, Space, Table, Typography } from 'antd';
import { CountContext } from '../../context/CountProvider';

const JobTable = ({ fetchedClient, fetchedBatch, JobFetched }) => {
  const { enqueueSnackbar } = useSnackbar();
  const { CountData, setCountData } = useContext(CountContext);

  const setJobsCount = async () => {
    let approved = 0,
      pending = 0,
      rejected = 0,
      unknown = 0;
    for (let index = 0; index < JobFetched.length; index++) {
      const ele = JobFetched[index];
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
      Jobs_approved: approved,
      Jobs_rejected: rejected,
      Jobs_pending: pending,
      Jobs_unknown: unknown,
      Jobs_ready: !CountData.Jobs_ready,
    });
  };

  useEffect(() => {
    setJobsCount();
  }, []);

  const handleDeleteJob = (client_id, batch_id, job_name) => {
    try {
      console.log(client_id, batch_id, job_name);
      // setfetchedBatchDataRecieved(!fetchedBatchDataRecieved)
      // const response = await deleteJobApi(client_id, batch_id, job_name)
      // if (response.status === 200) {
      //   enqueueSnackbar(`${job_name} is deleted`, {
      //     variant: 'success',
      //     autoHideDuration: 3000,
      //     anchorOrigin: { vertical: 'top', horizontal: 'right' },
      //   });
      // } else {
      //   enqueueSnackbar(`Internal server error`, {
      //     variant: 'error',
      //     autoHideDuration: 3000,
      //     anchorOrigin: { vertical: 'top', horizontal: 'right' },
      //   });
      // }
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
    // handleDeleteJob(record.client_id, record.batch_id, record.job_name)
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
      filters: filterData(
        fetchedBatch.map((item) => item.batch_name).filter((value, index, self) => self.indexOf(value) === index)
      ),
      onFilter: (value, record) => record.batch_name.indexOf(value) === 0,
      sorter: (a, b) => a.batch_name.localeCompare(b.batch_name),
    },
    {
      title: 'Job Name',
      dataIndex: 'input_ref_key',
      align: 'center',
      width: '25vw',
      filters: filterData(
        JobFetched.map((item) => item.input_ref_key).filter((value, index, self) => self.indexOf(value) === index)
      ),
      onFilter: (value, record) => record.input_ref_key.indexOf(value) === 0,
      sorter: (a, b) => a.input_ref_key.localeCompare(b.input_ref_key),
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
                // console.log(record)
                handleDeleteJob(record.client_id, record.batch_id, record.job_name)
              }}
              style={{
                marginRight: 8,
                color: 'red'
              }}
            >
              <Button type="primary" shape="round" danger icon={<DeleteFilled color='red' />} size="medium" />
            </Typography.Link> */}
            <Popconfirm
              title="Are you sure to delete this job ?"
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
          dataSource={JobFetched}
        />
      </div>
    </>
  );
};

export default JobTable;
