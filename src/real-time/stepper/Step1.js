import React, { useEffect, useState } from 'react';
import { Button, Checkbox, Form, Input, Switch, Upload, Icon, message, Row, Col, Tooltip } from 'antd';
import { EditFilled, UploadOutlined } from '@ant-design/icons';
import MButton from '@mui/material/Button';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import { useSnackbar } from 'notistack';
import { IconButton, Stack } from '@mui/material';
import { useLocation } from 'react-router-dom';
import { uploadJsonFile } from "../../api's/UploadJson";
import BASEURL from '../../BaseUrl';
import { AllFilesOfS3, getTableRule } from "../../api's/PreprocessApi";
import { BUCKET_NAME } from '../../constants/Constant';

const Step1 = ({ client, batch, step1Data, setstep1Data, NextData, setNextData }) => {
  const { enqueueSnackbar } = useSnackbar();
  const location = useLocation();
  const [isFilePicked, setIsFilePicked] = useState(false);
  const [selectedFile, setSelectedFile] = useState();
  const [disables3, setDisables3] = useState(true);
  const [selectedPath, setSelectedPath] = useState('');
  const [TableName, setTableName] = useState(location.pathname.split('/')[3]);
  const [UpdatePath, setUpdatePath] = useState(false);

  const [form] = Form.useForm();

  const onFinish = async (values) => {
    // await uploadFile(form.getFieldValue().tableName);
    console.log('Success:', values);
    setstep1Data(values);

    setNextData({ step1: false, step2: true, step3: false, step4: true });
    enqueueSnackbar(`Changes updated`, {
      variant: 'success',
      autoHideDuration: 3000,
      anchorOrigin: { vertical: 'top', horizontal: 'right' },
    });
  };

  const step1Call = () => {
    form.setFieldsValue({
      clientName: client.client_name,
      batchName: batch.batch_name,
      tableName: location.pathname.split('/')[3],
      flowBuilder: step1Data.flowBuilder || false,
      ruleEngine: step1Data.ruleEngine || false,
    });
    setUpdatePath(!UpdatePath);
  };

  useEffect(async () => {
    console.log('first');
    await s3tablepath();
    console.log('second');
    step1Call();
    console.log('third');
  }, []);
  useEffect(() => {
    // console.log(selectedPath)
    form.setFieldsValue({
      s3Path: selectedPath,
    });
  }, [UpdatePath]);

  const uploadHandler = (event) => {
    setSelectedFile(event.target.files[0]);
    setIsFilePicked(true);
  };

  const editHandler = () => {
    setDisables3(!disables3);
  };

  const uploadFile = async (table_name) => {
    const formData = new FormData();
    // console.log(selectedFile);
    formData.append('file', selectedFile);
    const path = `${client.client_name}/${batch.batch_name}/${table_name}`;

    const data = {
      file: formData,
      path,
      client_id: client.client_id,
    };
    // console.log(data);

    const response = await uploadJsonFile(formData, path);
    // console.log(response);
  };

  const s3tablepath = async () => {
    try {
      const response = await getTableRule(client.client_id, batch.batch_name, TableName);
      if (response.status === 200) {
        console.log(response.data);
        setSelectedPath(response.data[0].path);
      }
    } catch (error) {
      if (error.response.status === 404) {
        setSelectedPath('');
        enqueueSnackbar(`No Table rule Found`, {
          variant: 'error',
          autoHideDuration: 3000,
          anchorOrigin: { vertical: 'top', horizontal: 'right' },
        });
      }
    }

    // const prefix = `${client.client_name}/${batch.batch_name}/${TableName}/Rule_engine/Table-Json/`;
    // const response = await AllFilesOfS3(prefix);
    // console.log(response.data);
    // if (response.status === 200 && response.data.length > 0) {
    //     setSelectedPath(`s3://${BUCKET_NAME}/${prefix}${response.data[0].label}`);
    // }
  };

  return (
    <>
      <br />
      <div>
        <Form
          form={form}
          name="basic"
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 8 }}
          onFinish={onFinish}
          autoComplete="off"
        >
          <Form.Item
            label="Client Name"
            name="clientName"
            rules={[
              {
                required: true,
                message: 'Please input Client Name',
              },
            ]}
          >
            <Input disabled />
          </Form.Item>

          <Form.Item
            label="Stream Name"
            name="batchName"
            rules={[
              {
                required: true,
                message: 'Please input Batch Name',
              },
            ]}
          >
            <Input disabled />
          </Form.Item>

          <Form.Item
            label="Table Name"
            name="tableName"
            rules={[
              {
                required: true,
                message: 'Please input Table name!',
              },
            ]}
          >
            <Input disabled />
          </Form.Item>
          <Form.Item label="Rule Engine" name="ruleEngine">
            <Switch checkedChildren="on" unCheckedChildren="off" />
          </Form.Item>
          <Form.Item label="Flow Builder" name="flowBuilder">
            <Switch checkedChildren="on" unCheckedChildren="off" />
          </Form.Item>
          <Form.Item label="Storage" name="storage">
            <Switch checkedChildren="on" unCheckedChildren="off" />
          </Form.Item>

          <Form.Item label="S3 Schema Path" wrapperCol={{ span: 18 }}>
            <Row gutter={8}>
              <Col span={12}>
                <Form.Item
                  name="s3Path"
                  noStyle
                  requiredMark
                  rules={[
                    {
                      required: true,
                      message: 'Please Provide S3 Schema Path',
                    },
                  ]}
                >
                  <Input disabled={disables3} />
                </Form.Item>
              </Col>
              {/* <Col span={2}>
                            <Tooltip title="Upload">
                                <IconButton color="primary" aria-label="upload json" component="label">
                                    <input hidden accept=".json" type="file" onChange={uploadHandler} />
                                    <FileUploadIcon />
                                </IconButton>
                            </Tooltip>
                        </Col> */}
            </Row>
          </Form.Item>

          <Form.Item
            wrapperCol={{
              offset: 8,
              span: 16,
            }}
          >
            <Button variant="contained" htmlType="submit">
              Submit
            </Button>
          </Form.Item>
        </Form>
        <br />
        <br />
      </div>
    </>
  );
};

export default Step1;
