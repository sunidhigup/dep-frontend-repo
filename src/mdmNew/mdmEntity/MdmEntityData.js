import {
  ArrowRightOutlined,
  DeleteFilled,
  EditFilled,
  PlusCircleTwoTone,
  HomeOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useSnackbar } from 'notistack';
import { Paper } from '@mui/material';
import {
  Breadcrumb,
  Button,
  Divider,
  Form,
  Input,
  Modal,
  Popconfirm,
  Radio,
  Select,
  Space,
  Spin,
  Table,
  Tooltip,
  Typography,
} from 'antd';
import { Link, useParams } from 'react-router-dom';
import Draggable from 'react-draggable';
import React, { useEffect, useRef, useState } from 'react';
import Header from '../../admin/approval/Header';
import {
  addNewEntity,
  getAllEntity,
  deleteEntity,
  getEntity,
  createEntityAttribute,
  deleteEntityAttribute,
} from "../../api's/EntityApi";

/* eslint-disable no-template-curly-in-string */
const validateMessages = {
  required: '${label} is required!',
};

const plainOptions = ['true', 'false'];
const EditableCell = ({ editing, dataIndex, title, inputType, record, index, children, ...restProps }) => {
  const inputNode = inputType === 'radio' ? <Radio.Group options={plainOptions} /> : <Input />;
  return (
    <td {...restProps}>
      {editing ? (
        <Form.Item
          name={dataIndex}
          style={{
            margin: 0,
            width: dataIndex === 'name' ? '15vw' : '10vw',
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

const MdmEntityData = () => {
  const { enqueueSnackbar } = useSnackbar();
  const params = useParams();
  const [form] = Form.useForm();
  const [Addform] = Form.useForm();

  const [EntityDataList, setEntityDataList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingKey, setEditingKey] = useState('');
  const [disabled, setDisabled] = useState(false);
  const [bounds, setBounds] = useState({
    left: 0,
    top: 0,
    bottom: 0,
    right: 0,
  });
  const draggleRef = useRef(null);
  const [visible, setVisible] = useState(false);

  const isEditing = (record) => record.name === editingKey;

  const cancel = () => {
    setEditingKey('');
  };

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

  const fetchEntity = async () => {
    const response = await getEntity(params.entityId);
    if (response.status === 200) {
      console.log(response.data.attribute);

      setEntityDataList(response.data.attribute !== null ? response.data.attribute : []);
    }
  };

  useEffect(() => {
    fetchEntity();
  }, []);

  const showModal = () => {
    setVisible(true);
  };

  const onFinish = async (values) => {
    console.log(values);
    const updateData = [...EntityDataList, values];

    // console.log(EntityDataList);
    const data = { entityId: params.entityId, entityName: params.entityName, attribute: updateData };
    console.log(data);
    const response = await addNewEntity(data);
    if (response.status === 200) {
      console.log('');
    }
    setEntityDataList(updateData);

    Addform.setFieldsValue({
      label: '',
      name: '',
      type: '',
      required: false,
    });
    setVisible(false);
  };

  const save = async (record, name) => {
    console.log(record);
    console.log(name)
    // try {
    //   const row = await form.validateFields();
    //   const newData = [...EntityDataList];
    //   const index = newData.findIndex((item) => name === item.name);
    //   if (index > -1) {
    //     const item = newData[index];
    //     newData.splice(index, 1, { ...item, ...row });
    //     const response = await updateManagementDetailUserApi(newData[index]);
    //     if (response.status === 200) {
    //       setUsersData(newData);
    //       setEditingKey('');
    //       enqueueSnackbar(` ${record.username} profile has been updated`, {
    //         variant: 'success',
    //         autoHideDuration: 3000,
    //         anchorOrigin: { vertical: 'top', horizontal: 'right' },
    //       });
    //     } else {
    //       enqueueSnackbar(`server error`, {
    //         variant: 'error',
    //         autoHideDuration: 3000,
    //         anchorOrigin: { vertical: 'top', horizontal: 'right' },
    //       });
    //     }
    //   } else {
    //     newData.push(row);
    //     setUsersData(newData);
    //     setEditingKey('');
    //   }
    // } catch (error) {
    //   // console.log('Validate Failed:', error);
    //   if (error.response.status === 403) {
    //     enqueueSnackbar('You have only Read Permission !!', {
    //       variant: 'error',
    //       autoHideDuration: 3000,
    //       anchorOrigin: { vertical: 'top', horizontal: 'right' },
    //     });
    //   }
    // }
  };
  const DeleteRecord = async (record) => {
    console.log(record);
    const updateData = EntityDataList.filter((e, index) => e.name !== record.name);

    console.log(EntityDataList);
    const data = { entityId: params.entityId, entityName: params.entityName, attribute: updateData };

    console.log(data);
    const response = await addNewEntity(data);
    if (response.status === 200) {
      console.log('');
    }
    setEntityDataList(updateData);
  };

  const EditRecord = (record) => {
    console.log(record);
    form.setFieldsValue({
      label: '',
      name: '',
      type: '',
      required: '',
      ...record,
    });
    setEditingKey(record.name);
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      width: '25%',
      align: 'center',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Label',
      dataIndex: 'label',
      width: '25%',
      align: 'center',
      editable: true,
    },
    {
      title: 'Type',
      dataIndex: 'type',
      width: '20%',
      align: 'center',
      editable: true,
    },
    {
      title: 'Required',
      dataIndex: 'required',
      width: '10%',
      align: 'center',
      render: (text) => String(text),
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
                EditRecord(record);
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
        ) : (
          <Space size="middle">
            <Typography.Link onClick={() => save(record, record.name)}>
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
        inputType: col.dataIndex === 'required' ? 'radio' : 'text',
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
      }),
    };
  });

  return (
    <>
      <Paper elevation={1} style={{ padding: '15px' }}>
        <Breadcrumb>
          <Breadcrumb.Item>
            <Link to="/mdm">
              <HomeOutlined />
            </Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <Link to="/mdm/entity">
              <UserOutlined />
              <span>Entity Creation</span>
            </Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>Entity Data</Breadcrumb.Item>
        </Breadcrumb>
        <Header name={`${params.entityName} Entity Data`} />
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
            >
              Add Data
            </Button>
          </div>
        </div>
        <div style={{ border: '2px solid black' }}>
          <Form form={form} component={false}>
            <Table
              rowClassName={(record, index) => (index % 2 === 0 ? 'table-row-light' : 'table-row-light')}
              bordered="true"
              components={{
                body: {
                  cell: EditableCell,
                },
              }}
              pagination={{
                position: ['bottomCenter'],
                defaultPageSize: 5,
              }}
              columns={mergedColumns}
              dataSource={EntityDataList}
            />
          </Form>
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
            Add {params.entityName} Data
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
          form={Addform}
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
            name="label"
            label="Label"
            rules={[{ required: true, message: 'Label is required' }]}
            style={{ fontSize: 20, fontWeight: 'bold' }}
            wrapperCol={{ span: 12 }}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: 'Name is required' }]}
            style={{ fontSize: 20, fontWeight: 'bold' }}
            wrapperCol={{ span: 12 }}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="type"
            label="Type"
            rules={[{ required: true, message: 'Type is required' }]}
            style={{ fontSize: 20, fontWeight: 'bold' }}
            wrapperCol={{ span: 12 }}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="required"
            label="Required"
            rules={[{ required: true, message: 'required' }]}
            style={{ fontSize: 20, fontWeight: 'bold' }}
            wrapperCol={{ span: 12 }}
          >
            <Select>
              <Select.Option value="true">True</Select.Option>
              <Select.Option value="false">False</Select.Option>
            </Select>
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

export default MdmEntityData;
