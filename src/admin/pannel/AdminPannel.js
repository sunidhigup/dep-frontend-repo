import React, { useContext, useState, useEffect, useRef } from 'react';
import { Paper } from '@mui/material';
import { Space, Table, Typography, Button, Modal, Form, Input, Spin } from 'antd';

import { CheckCircleOutlined, PlusCircleTwoTone } from '@ant-design/icons';
import { useSnackbar } from 'notistack';
// import Select from 'react-select/dist/declarations/src/Select';
import Select from 'react-select';
import Draggable from 'react-draggable';
import Header from '../approval/Header';
import { AuthContext } from '../../context/AuthProvider';
import {
  CheckSecretKeyExist,
  createAwsSecretmangerCredential,
  createAwsSnowFlakeCredentialDynamo,
  createSnowflakeSecretmangerCredential,
  GetConnectionData,
  GetSecretData,
  updateAwsSecretMangerCredential,
  updateSnowFlakeSecretMangerCredential,
} from "../../api's/AdminPannelApi";

/* eslint-disable no-template-curly-in-string */
const validateMessages = {
  required: '${label} is required!',
};

const options = [
  { label: 'AWS', value: 'aws' },
  { label: 'SNOWFLAKE', value: 'snowflake' },
];
const regions = [
  { label: 'N.Virginia', value: 'us-east-1' },
  { label: 'Frankfurt', value: 'eu-central-1' },
];

const AdminPannel = () => {
  const { user } = useContext(AuthContext);
  const { enqueueSnackbar } = useSnackbar();
  const [region, setRegion] = useState(options[0]);
  const [currentCountry, setCurrentCountry] = useState(null);
  const [ConnectionData, setConnectionData] = useState([]);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [refresh, setrefresh] = useState(false);

  const [EditConnectionNAme, setEditConnectionNAme] = useState('');
  const [Mode, setMode] = useState();

  const [visible, setVisible] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [bounds, setBounds] = useState({
    left: 0,
    top: 0,
    bottom: 0,
    right: 0,
  });
  const draggleRef = useRef(null);

  const [Editvisible, setEditVisible] = useState(false);
  const [Editdisabled, setEditDisabled] = useState(false);
  const [Editbounds, setEditBounds] = useState({
    left: 0,
    top: 0,
    bottom: 0,
    right: 0,
  });
  const EditdraggleRef = useRef(null);

  const onchangeSelect = (item) => {
    setCurrentCountry(null);
    setRegion(item);
  };

  const getConnectionData = async () => {
    const response = await GetConnectionData(region.value, user);
    if (response.status === 200) {
      setConnectionData(response.data);
    } else {
      enqueueSnackbar('No Connection Found !', {
        variant: 'error',
        autoHideDuration: 3000,
        anchorOrigin: { vertical: 'top', horizontal: 'right' },
      });
    }
  };

  useEffect(() => {
    getConnectionData();
  }, [refresh]);

  const onFinish = async (values) => {
    setLoading(true);

    console.log(values);
    try {
      const res = await CheckSecretKeyExist(
        values.awsconnectionName || EditConnectionNAme || values.snowflakeconnectionName
      );
      if (res.status === 200) {
        let result;
        if (region.value === 'aws') {
          result = await updateAwsSecretMangerCredential(values, EditConnectionNAme);
        } else {
          result = await updateSnowFlakeSecretMangerCredential(values, EditConnectionNAme);
        }
        if (result.status === 200) {
          enqueueSnackbar(`${region.value} credential updated successfully`, {
            variant: 'success',
            autoHideDuration: 3000,
            anchorOrigin: { vertical: 'top', horizontal: 'right' },
          });
        } else {
          enqueueSnackbar('internal server error', {
            variant: 'error',
            autoHideDuration: 3000,
            anchorOrigin: { vertical: 'top', horizontal: 'right' },
          });
        }
      }
    } catch (error) {
      if (error.status === 404) {
        let result;
        let result1;
        if (region.value === 'aws') {
          result = await createAwsSecretmangerCredential(values, values.awsconnectionName);
          result1 = await createAwsSnowFlakeCredentialDynamo(values.awsconnectionName, region.value, user);
        } else {
          result = await createSnowflakeSecretmangerCredential(values, values.snowflakeconnectionName);
          result1 = await createAwsSnowFlakeCredentialDynamo(values.snowflakeconnectionName, region.value, user);
        }

        if (result.status === 201 && result1.status === 201) {
          setrefresh(!refresh);
          enqueueSnackbar(`${region.label} connection establised successfully`, {
            variant: 'success',
            autoHideDuration: 3000,
            anchorOrigin: { vertical: 'top', horizontal: 'right' },
          });
        } else {
          enqueueSnackbar('internal server error', {
            variant: 'error',
            autoHideDuration: 3000,
            anchorOrigin: { vertical: 'top', horizontal: 'right' },
          });
        }
        console.log('f');
        setLoading(false);
        setVisible(false);
      }
      if (error.response.status === 403) {
        enqueueSnackbar('You have only Read Permission !!', {
          variant: 'error',
          autoHideDuration: 3000,
          anchorOrigin: { vertical: 'top', horizontal: 'right' },
        });
      }
      setLoading(false);
      setVisible(false);
    }
    setLoading(false);
    setVisible(false);
  };

  const handleChange = () => {
    console.log('first');
  };

  useEffect(() => {
    setConnectionData([]);
    getConnectionData();
  }, [region.value]);

  const showModal = () => {
    setMode('create');
    setVisible(true);
  };

  const handleOk = (e) => {
    // console.log(e);
    setVisible(false);
  };

  const handleCancel = (e) => {
    // console.log(e);
    setVisible(false);
  };

  const onStart = (_event, uiData) => {
    const { clientWidth, clientHeight } = window.document.documentElement;
    const targetRect = draggleRef.current?.getBoundingClientRect();

    if (!targetRect) {
      return;
    }

    setBounds({
      left: -targetRect.left + uiData.x,
      right: clientWidth - (targetRect.right - uiData.x),
      top: -targetRect.top + uiData.y,
      bottom: clientHeight - (targetRect.bottom - uiData.y),
    });
  };

  // Edit

  const EditshowModal = () => {
    setMode('edit');
    setEditVisible(true);
  };

  // const EdithandleOk = (e) => {
  //     console.log(e);
  //     setEditVisible(false);
  // };

  const EdithandleCancel = (e) => {
    setMode('edit');
    setEditVisible(false);
  };

  const EditonStart = (_event, uiData, secretData) => {
    const { clientWidth, clientHeight } = window.document.documentElement;
    const targetRect = draggleRef.current?.getBoundingClientRect();

    if (!targetRect) {
      return;
    }

    setEditBounds({
      left: -targetRect.left + uiData.x,
      right: clientWidth - (targetRect.right - uiData.x),
      top: -targetRect.top + uiData.y,
      bottom: clientHeight - (targetRect.bottom - uiData.y),
    });

    // console.log(secretData);
  };

  const EditRecord = async (record) => {
    setEditVisible(true);
    setEditConnectionNAme(record.connectionName);
    const response1 = await GetSecretData(record.connectionName);

    const data = JSON.parse(response1.data.response);
    form.setFieldsValue({
      awsAccessKey: data.awsAccessKey,
      awsSecretKey: data.awsSecretKey,
      awsconnectionName: record.connectionName,
      snowflakeconnectionName: record.connectionName,
      user: data.user,
      password: data.password,
      db: data.db,
      role: data.role,
      warehouse: data.warehouse,
    });
    setMode('edit');
    EditshowModal(true);
  };

  const columns = [
    {
      title: 'Connection Name',
      dataIndex: 'connectionName',
      align: 'center',
      width: '25vw',
    },
    {
      title: 'Connection Type',
      dataIndex: 'connectionType',
      align: 'center',
      width: '20vw',
    },
    {
      title: 'Username',
      dataIndex: 'userName',
      align: 'center',
      width: '20vw',
    },
    {
      title: 'Action',
      key: 'action',
      sorter: false,
      align: 'center',
      render: (_, record) => {
        return (
          <Space size="middle">
            <Typography.Link
              onClick={() => {
                EditRecord(record);
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
                Edit
              </Button>
            </Typography.Link>
          </Space>
        );
      },
    },
  ];

  const tableColumns = columns.map((item) => ({ ...item }));

  const click = () => {
    setMode('create');
    showModal();
  };

  return (
    <>
      <Paper elevation={1} style={{ padding: '15px' }}>
        <Header name="CONNECTION" />
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginTop: 20 }}>
          <div style={{ flex: 1, fontSize: 18, fontWeight: 'bold' }}>Connection Type : </div>
          <div style={{ flex: 3 }}>
            <Select
              autoFocus
              isSearchable
              placeholder="Select Connection Type"
              value={region}
              onChange={onchangeSelect}
              options={options}
              getOptionValue={(option) => option.value}
              getOptionLabel={(option) => option.label}
            />
          </div>
          <div style={{ flex: 3 }} />
          <div style={{ flex: 1 }}>
            <Button
              type="primary"
              onClick={click}
              shape="round"
              icon={<PlusCircleTwoTone twoToneColor="#52c41a" />}
              size="large"
            >
              Create
            </Button>
          </div>
        </div>
        <div style={{ marginTop: 30, border: '2px solid black' }}>
          <Table
            rowClassName={(record, index) => (index % 2 === 0 ? 'table-row-light' : 'table-row-light')}
            bordered="true"
            pagination={{
              position: ['bottomCenter'],
              defaultPageSize: 5,
            }}
            columns={tableColumns}
            dataSource={ConnectionData}
          />
        </div>
      </Paper>
      {Mode === 'create' && (
        <>
          <Modal
            title={
              <div
                style={{
                  width: '100%',
                  cursor: 'move',
                }}
                onMouseOver={() => {
                  if (disabled) {
                    setDisabled(false);
                  }
                }}
                onMouseOut={() => {
                  setDisabled(true);
                }} // fix eslintjsx-a11y/mouse-events-have-key-events
                onFocus={() => {}}
                onBlur={() => {}} // end
              >
                Create {region.label} Connection
              </div>
            }
            visible={visible}
            // onOk={handleOk}
            onCancel={handleCancel}
            modalRender={(modal) => (
              <Draggable disabled={disabled} bounds={bounds} onStart={(event, uiData) => onStart(event, uiData)}>
                <div ref={draggleRef}>{modal}</div>
              </Draggable>
            )}
            footer={[null]}
          >
            <Form
              name="nest-messages"
              onFinish={onFinish}
              validateMessages={validateMessages}
              labelCol={{ span: 8 }}
              wrapperCol={{
                span: 12,
              }}
              layout="horizontal"
            >
              {region.value === 'aws' && (
                <>
                  <Form.Item
                    name="awsconnectionName"
                    label="ConnectionName"
                    rules={[{ required: true, message: 'connection name is required' }]}
                    style={{ fontSize: 20, fontWeight: 'bold' }}
                    wrapperCol={{
                      span: 12,
                    }}
                  >
                    <Input />
                  </Form.Item>
                  <Form.Item
                    name={['access_key']}
                    label="Access key"
                    style={{ fontSize: 20, fontWeight: 'bold' }}
                    rules={[{ required: true }]}
                  >
                    <Input />
                  </Form.Item>

                  <Form.Item
                    name={['secret_key']}
                    label="Secret key"
                    style={{ fontSize: 20, fontWeight: 'bold' }}
                    rules={[{ required: true }]}
                  >
                    <Input />
                  </Form.Item>
                  <br />
                </>
              )}
              {region.value === 'snowflake' && (
                <>
                  <Form.Item
                    name="snowflakeconnectionName"
                    label="ConnectionName"
                    rules={[{ required: true, message: 'connection name is required' }]}
                    style={{ fontSize: 20, fontWeight: 'bold' }}
                    wrapperCol={{
                      span: 12,
                    }}
                  >
                    <Input />
                  </Form.Item>
                  <Form.Item
                    name={['user']}
                    label="User"
                    style={{ fontSize: 20, fontWeight: 'bold' }}
                    rules={[{ required: true }]}
                  >
                    <Input />
                  </Form.Item>

                  <Form.Item
                    name={['password']}
                    label="Password"
                    style={{ fontSize: 20, fontWeight: 'bold' }}
                    rules={[{ required: true }]}
                  >
                    <Input />
                  </Form.Item>

                  <Form.Item
                    name={['db']}
                    label="Database"
                    style={{ fontSize: 20, fontWeight: 'bold' }}
                    rules={[{ required: true }]}
                  >
                    <Input />
                  </Form.Item>

                  <Form.Item
                    name={['role']}
                    label="Role"
                    style={{ fontSize: 20, fontWeight: 'bold' }}
                    rules={[{ required: true }]}
                  >
                    <Input />
                  </Form.Item>

                  <Form.Item
                    name={['warehouse']}
                    label="Warehouse"
                    style={{ fontSize: 20, fontWeight: 'bold' }}
                    rules={[{ required: true }]}
                  >
                    <Input />
                  </Form.Item>
                  <br />
                </>
              )}
              <div style={{ display: 'flex' }}>
                {loading && <Spin tip="connection creating" />}
                {!loading && (
                  <>
                    <Form.Item>
                      <Button type="primary" htmlType="reset" shape="round" danger style={{ marginLeft: '10vw' }}>
                        reset
                      </Button>
                    </Form.Item>
                    <Form.Item>
                      <Button
                        type="primary"
                        htmlType="submit"
                        shape="round"
                        style={{ marginLeft: '2vw', color: 'white', backgroundColor: 'green' }}
                      >
                        Submit
                      </Button>
                    </Form.Item>
                  </>
                )}
              </div>
            </Form>
          </Modal>
        </>
      )}
      {Mode === 'edit' && (
        <>
          <Modal
            title={
              <div
                style={{
                  width: '100%',
                  cursor: 'move',
                }}
                onMouseOver={() => {
                  if (Editdisabled) {
                    setEditDisabled(false);
                  }
                }}
                onMouseOut={() => {
                  setEditDisabled(true);
                }} // fix eslintjsx-a11y/mouse-events-have-key-events
                onFocus={() => {}}
                onBlur={() => {}} // end
              >
                Edit {region.label} Connection
              </div>
            }
            visible={Editvisible}
            // onOk={handleOk}
            onCancel={EdithandleCancel}
            modalRender={(modal) => (
              <Draggable
                disabled={Editdisabled}
                bounds={Editbounds}
                onStart={(event, uiData, secretData) => EditonStart(event, uiData, secretData)}
              >
                <div ref={EditdraggleRef}>{modal}</div>
              </Draggable>
            )}
            footer={[null]}
          >
            <Form
              form={form}
              name="edit-messages"
              onFinish={onFinish}
              validateMessages={validateMessages}
              labelCol={{ span: 8 }}
              wrapperCol={{
                span: 12,
              }}
              layout="horizontal"
            >
              <br />
              {region.value === 'aws' && (
                <>
                  <Form.Item
                    name="awsconnectionName"
                    label="Connection Name"
                    style={{ fontSize: 20, fontWeight: 'bold' }}
                  >
                    <Input disabled />
                  </Form.Item>

                  <Form.Item
                    name={['awsAccessKey']}
                    label="Access key"
                    style={{ fontSize: 20, fontWeight: 'bold' }}
                    rules={[{ required: true }]}
                  >
                    <Input />
                  </Form.Item>

                  <Form.Item
                    name={['awsSecretKey']}
                    label="Secret key"
                    style={{ fontSize: 20, fontWeight: 'bold' }}
                    rules={[{ required: true }]}
                  >
                    <Input />
                  </Form.Item>
                  <br />
                </>
              )}
              {region.value === 'snowflake' && (
                <>
                  <Form.Item
                    name="snowflakeconnectionName"
                    label="ConnectionName"
                    style={{ fontSize: 20, fontWeight: 'bold' }}
                  >
                    <Input disabled />
                  </Form.Item>
                  <Form.Item
                    name={['user']}
                    label="User"
                    style={{ fontSize: 20, fontWeight: 'bold' }}
                    rules={[{ required: true }]}
                  >
                    <Input />
                  </Form.Item>

                  <Form.Item
                    name={['password']}
                    label="Password"
                    style={{ fontSize: 20, fontWeight: 'bold' }}
                    rules={[{ required: true }]}
                  >
                    <Input />
                  </Form.Item>

                  <Form.Item
                    name={['db']}
                    label="Database"
                    style={{ fontSize: 20, fontWeight: 'bold' }}
                    rules={[{ required: true }]}
                  >
                    <Input />
                  </Form.Item>

                  <Form.Item
                    name={['role']}
                    label="Role"
                    style={{ fontSize: 20, fontWeight: 'bold' }}
                    rules={[{ required: true }]}
                  >
                    <Input />
                  </Form.Item>

                  <Form.Item
                    name={['warehouse']}
                    label="Warehouse"
                    colon
                    style={{ fontSize: 20, fontWeight: 'bold' }}
                    rules={[{ required: true }]}
                  >
                    <Input />
                  </Form.Item>
                  <br />
                </>
              )}
              <div style={{ display: 'flex' }}>
                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    shape="round"
                    style={{ marginLeft: '10vw', color: 'white', backgroundColor: 'green' }}
                  >
                    Submit
                  </Button>
                </Form.Item>
              </div>
            </Form>
          </Modal>
        </>
      )}
    </>
  );
};

export default AdminPannel;
