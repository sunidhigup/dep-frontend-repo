import {
  ArrowRightOutlined,
  DeleteFilled,
  HomeOutlined,
  PlusCircleTwoTone,
  PlayCircleOutlined,
} from '@ant-design/icons';
import { useSnackbar } from 'notistack';
import { Paper } from '@mui/material';
import { Breadcrumb, Button, Divider, Form, Input, Modal, Space, Spin, Table, Tooltip, Typography } from 'antd';
import { Link } from 'react-router-dom';
import Draggable from 'react-draggable';
import React, { useContext, useEffect, useRef, useState } from 'react';
import Header from '../../admin/approval/Header';
import { addNewEntity, getAllEntity, deleteEntity } from "../../api's/EntityApi";
import { runMdmEntity } from "../../api's/MDMApi";
import { AuthContext } from '../../context/AuthProvider';

/* eslint-disable no-template-curly-in-string */
const validateMessages = {
  required: '${label} is required!',
};

const MdmEntityCreation = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [form] = Form.useForm();
  const [EntityList, setEntityList] = useState([]);
  const [loading, setLoading] = useState(false);
  const { userRole } = useContext(AuthContext);
  const [disabled, setDisabled] = useState(false);
  const [bounds, setBounds] = useState({
    left: 0,
    top: 0,
    bottom: 0,
    right: 0,
  });
  const draggleRef = useRef(null);
  const [visible, setVisible] = useState(false);

  const handleCancel = (e) => {
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

  const showModal = () => {
    setVisible(true);
  };

  const onFinish = async (values) => {
    console.log(values);
    const data = { entityName: values.entityName };
    try {
      const response = await addNewEntity(data);
      if (response.status === 201) {
        const newData = {
          entityName: values.entityName,
        };
        const response = await getAllEntity();
        if (response.status === 200) {
          console.log(response.data);
          setEntityList(response.data);
        }
        enqueueSnackbar(`${values.entityName} created !!`, {
          variant: 'success',
          autoHideDuration: 3000,
          anchorOrigin: { vertical: 'top', horizontal: 'right' },
        });
      }
      setVisible(false);
    } catch (error) {
      setVisible(false);
      if (error.response.status === 409) {
        enqueueSnackbar('This Entity Already Exist!', {
          variant: 'error',
          autoHideDuration: 3000,
          anchorOrigin: { vertical: 'top', horizontal: 'right' },
        });
      }

      if (error.response.status === 403) {
        enqueueSnackbar('You have only Read Permission !!', {
          variant: 'error',
          autoHideDuration: 3000,
          anchorOrigin: { vertical: 'top', horizontal: 'right' },
        });
      }
    }
  };

  const fetchAllEntities = async () => {
    const response = await getAllEntity();
    if (response.status === 200) {
      console.log(response.data);
      setEntityList(response.data);
    }
  };
  useEffect(() => {
    fetchAllEntities();
  }, []);

  const handleDeleteEntity = async (record) => {
    try {
      const response = await deleteEntity(record.entityId);

      if (response.status === 200) {
        const response1 = await getAllEntity();
        setEntityList(response1.data);
        enqueueSnackbar('Entity Deleted Successfully!', {
          variant: 'success',
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

  const handleRunEntity = async (record) => {
    const response = await runMdmEntity(record.entityName);

    if (response.status === 200) {
      enqueueSnackbar('MDM Entity is Running!', {
        variant: 'success',
        autoHideDuration: 3000,
        anchorOrigin: { vertical: 'top', horizontal: 'right' },
      });
    }
  };

  const columns = [
    {
      title: 'Id',
      dataIndex: 'entityId',
      width: '80%',
      align: 'center',
      hidden: true,
    },
    {
      title: 'Entity',
      dataIndex: 'entityName',
      width: '50%',
      align: 'center',
      sorter: (a, b) => a.entityName.localeCompare(b.entityName),
    },
    {
      title: 'Actions',
      dataIndex: 'action',
      width: '30%',
      align: 'center',
      render: (_, record) => {
        return (
          <Space size="middle">
            <Typography.Link
              onClick={() => {
                handleDeleteEntity(record);
              }}
              style={{ marginRight: 8, color: 'red' }}
            >
              <Tooltip title="Delete">
                <Button
                  shape="circle"
                  icon={<DeleteFilled style={{ color: 'red', fontSize: 'medium' }} />}
                  size="medium"
                  disabled={userRole === 'ROLE_reader'}
                />
              </Tooltip>
            </Typography.Link>
            <Typography.Link
              onClick={() => {
                handleRunEntity(record);
              }}
              style={{ marginRight: 8, color: 'red' }}
            >
              <Tooltip title="Run">
                <Button
                  shape="circle"
                  icon={<PlayCircleOutlined style={{ color: 'green', fontSize: 'medium' }} />}
                  size="medium"
                  disabled={userRole === 'ROLE_reader'}
                />
              </Tooltip>
            </Typography.Link>
          </Space>
        );
      },
    },
    {
      title: 'Entity Data Explore',
      key: 'explore',
      align: 'center',
      sorter: false,
      width: '20%',
      render: (_, record) => {
        return (
          <Space size="middle">
            <Typography.Link
              onClick={() => {
                console.log(record);
              }}
              style={{ marginRight: 8, color: 'red' }}
            >
              <Link to={`/mdm/entity/data/${record.entityName}/${record.entityId}`}>
                <Tooltip title="explore">
                  <Button type="primary" shape="circle" icon={<ArrowRightOutlined />} size="medium" />
                </Tooltip>
              </Link>
            </Typography.Link>
          </Space>
        );
      },
    },
  ].filter((item) => !item.hidden);

  const tableColumns = columns.map((item) => ({ ...item }));

  return (
    <>
      <Paper elevation={1} style={{ padding: '15px' }}>
        <Breadcrumb>
          <Breadcrumb.Item>
            <Link to="/mdm">
              <HomeOutlined />
            </Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>Entity Creation</Breadcrumb.Item>
        </Breadcrumb>
        <Header name="Entity List" />
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginTop: -40, marginBottom: 20 }}>
          <div style={{ flex: 3 }} />
          <div style={{ flex: 3 }} />
          <div style={{ flex: 1 }}>
            <Button
              type="primary"
              onClick={showModal}
              shape="round"
              icon={<PlusCircleTwoTone twoToneColor="#52c41a" />}
              size="middle"
              disabled={userRole === 'ROLE_reader'}
            >
              Create
            </Button>
          </div>
        </div>
        <div style={{ border: '2px solid black' }}>
          <Table
            rowClassName={(record, index) => (index % 2 === 0 ? 'table-row-light' : 'table-row-light')}
            bordered="true"
            pagination={{
              position: ['bottomCenter'],
              defaultPageSize: 5,
            }}
            columns={tableColumns}
            dataSource={EntityList}
          />
        </div>
      </Paper>
      <Modal
        title={
          <div
            style={{ width: '100%', cursor: 'move' }}
            onMouseOver={() => {
              if (disabled) {
                setDisabled(false);
              }
            }}
            onMouseOut={() => {
              setDisabled(true);
            }} // fix eslintjsx-a11y/mouse-events-have-key-events
            onFocus={() => {}}
            onBlur={() => {}}
          >
            Create Entity
          </div>
        }
        visible={visible}
        onCancel={handleCancel}
        modalRender={(modal) => (
          <Draggable disabled={disabled} bounds={bounds} onStart={(event, uiData) => onStart(event, uiData)}>
            <div ref={draggleRef}>{modal}</div>
          </Draggable>
        )}
        footer={[null]}
      >
        <Form
          name="entity-create"
          onFinish={onFinish}
          validateMessages={validateMessages}
          labelCol={{ span: 8 }}
          wrapperCol={{
            span: 12,
          }}
          layout="horizontal"
        >
          <Form.Item
            name="entityName"
            label="Entity"
            rules={[{ required: true, message: 'connection name is required' }]}
            style={{ fontSize: 20, fontWeight: 'bold' }}
            wrapperCol={{ span: 12 }}
          >
            <Input />
          </Form.Item>
          <br />

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
  );
};

export default MdmEntityCreation;
