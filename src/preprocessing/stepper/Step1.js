import React, { useContext, useEffect, useState } from 'react';
import { Button, Checkbox, Form, Input, Switch, Upload, Icon, message, Row, Col, Tooltip } from 'antd';

import FileUploadIcon from '@mui/icons-material/FileUpload';
import { useSnackbar } from 'notistack';
import { IconButton, Stack } from '@mui/material';
import { useLocation } from 'react-router-dom';
import { uploadJsonFile } from "../../api's/UploadJson";
import { getTableRule } from "../../api's/PreprocessApi";
import { BUCKET_NAME } from '../../constants/Constant';
import { createTableRule, getS3TableRules } from "../../api's/TableRuleApi";
import { JobContext } from '../../context/JobProvider';

const Step1 = ({ client, batch, step1Data, setstep1Data, NextData, setNextData, state }) => {
  const { enqueueSnackbar } = useSnackbar();
  const location = useLocation();

  const { setJob } = useContext(JobContext);

  const [isFilePicked, setIsFilePicked] = useState(false);
  const [selectedFile, setSelectedFile] = useState();

  const [selectedPath, setSelectedPath] = useState('');
  const [TableName, setTableName] = useState(location.pathname.split('/')[3]);
  const [UpdatePath, setUpdatePath] = useState(false);
  const [EditDiasbled, setEditDisabled] = useState(true);

  const [form] = Form.useForm();

  const uploadFile = async () => {
    const formData = new FormData();
    formData.append('file', selectedFile);
    const path = `${client.client_name}/${batch.batch_name}/${location.pathname.split('/')[3]}`;

    const data = {
      file: formData,
      path,
      client_id: client.client_id,
    };
    const response = await uploadJsonFile(formData, path, client.client_id);
  };

  const handleAddTable = async (path) => {
    const regex = /^s3:\/\/.*json$/;

    if (!regex.test(path)) {
      enqueueSnackbar('S3 path is invalid!', {
        variant: 'error',
        autoHideDuration: 3000,
        anchorOrigin: { vertical: 'top', horizontal: 'right' },
      });
      return false;
    }

    const generated = path.includes('generated');

    const pathArr = path.split('/');
    pathArr.shift(0);
    pathArr.shift(0);
    pathArr.shift(0);
    const tableName = form.getFieldValue().tableName;
    const newPath = pathArr.join('/');

    try {
      const data = {
        path: newPath,
        client_id: client.client_id,
      };
      const response = await getS3TableRules(data);

      if (response.status === 200) {
        const tableData = {
          client_id: client.client_id,
          batchname: batch.batch_name,
          tablename: tableName,
          path,
          fields: response.data.fields,
          generated,
        };

        const res = await createTableRule(tableData);
        if (res.status === 201) {
          return true;
        }
      }
    } catch (error) {
      if (error.response.status === 500) {
        enqueueSnackbar('Json file is invalid!', {
          variant: 'error',
          autoHideDuration: 3000,
          anchorOrigin: { vertical: 'top', horizontal: 'right' },
        });
      }
      return false;
    }
  };

  const onFinish = async (values) => {
    // console.log('Success:', values);
    setJob(location.pathname.split('/')[3]);
    if (!isFilePicked) {
      setstep1Data(values);
      setNextData({ step1: false, step2: true, step3: false, step4: true });
      enqueueSnackbar(`Changes updated`, {
        variant: 'success',
        autoHideDuration: 3000,
        anchorOrigin: { vertical: 'top', horizontal: 'right' },
      });
    } else {
      await uploadFile();
      const uploadFilePath = `s3://${BUCKET_NAME}/${client.client_name}/${batch.batch_name}/${
        location.pathname.split('/')[3]
      }/Rule_engine/Table-Json/${location.pathname.split('/')[3]}.json`;

      //   console.log(uploadFilePath);

      const ans = await handleAddTable(uploadFilePath);
      if (ans) {
        setstep1Data(values);
        setNextData({ step1: false, step2: true, step3: false, step4: true });
        enqueueSnackbar(`Changes updated`, {
          variant: 'success',
          autoHideDuration: 3000,
          anchorOrigin: { vertical: 'top', horizontal: 'right' },
        });
      } else {
        // console.log(first)
      }
    }
  };

  const step1Call = async () => {
    form.setFieldsValue({
      clientName: client.client_name,
      batchName: batch.batch_name,
      tableName: location.pathname.split('/')[3],
      flowBuilder: state.fileDestination === 'Flow Builder' || false,
      ruleEngine: state.fileDestination === 'Rule Engine' || false,
    });
    setUpdatePath(!UpdatePath);
  };

  useEffect(async () => {
    await s3tablepath();
    await step1Call();
  }, []);

  useEffect(() => {
    form.setFieldsValue({
      s3Path: selectedPath,
    });
  }, [UpdatePath]);

  const s3tablepath = async () => {
    try {
      const response = await getTableRule(client.client_id, batch.batch_name, TableName);
      if (response.status === 200) {
        if (response.data[0] !== undefined) {
          setEditDisabled(true);

          setSelectedPath(response.data[0].path);
        } else {
          setEditDisabled(false);
        }
      }
    } catch (error) {
      if (error.response.status === 404) {
        setSelectedPath('');
        setEditDisabled(false);
        enqueueSnackbar(`No Table rule Found, Enter the Schema Path`, {
          variant: 'error',
          autoHideDuration: 3000,
          anchorOrigin: { vertical: 'top', horizontal: 'right' },
        });
      }
    }
  };

  const uploadHandler = (event) => {
    setSelectedFile(event.target.files[0]);
    form.setFieldsValue({
      s3Path: event.target.files[0]['name'],
    });
    setIsFilePicked(true);
    setEditDisabled(true);
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
            rules={[{ required: true, message: 'Please input Client Name' }]}
          >
            <Input disabled />
          </Form.Item>

          <Form.Item
            label="Batch Name"
            name="batchName"
            rules={[{ required: true, message: 'Please input Batch Name' }]}
          >
            <Input disabled />
          </Form.Item>

          <Form.Item
            label="Table Name"
            name="tableName"
            rules={[{ required: true, message: 'Please input Table Name' }]}
          >
            <Input disabled />
          </Form.Item>
          <Form.Item label="Rule Engine" name="ruleEngine">
            <Switch checkedChildren="on" unCheckedChildren="off" />
          </Form.Item>
          <Form.Item label="Flow Builder" name="flowBuilder">
            <Switch checkedChildren="on" unCheckedChildren="off" />
          </Form.Item>

          <Form.Item label="S3 Schema Path" wrapperCol={{ span: 18 }}>
            <Row gutter={8}>
              <Col span={12}>
                <Form.Item
                  name="s3Path"
                  rules={[
                    {
                      required: true,
                      message: 'Please Upload JSON',
                    },
                  ]}
                >
                  <Input disabled />
                </Form.Item>
              </Col>
              <Col span={2}>
                <Tooltip title="Upload">
                  <IconButton color="primary" aria-label="upload json" disabled={EditDiasbled} component="label">
                    <input hidden accept=".json" type="file" onChange={uploadHandler} />
                    <FileUploadIcon />
                  </IconButton>
                </Tooltip>
              </Col>
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
