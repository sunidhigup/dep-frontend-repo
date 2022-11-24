import React, { useEffect, useState, useContext } from 'react';
import { Button, Form, Input, Switch } from 'antd';
import { useSnackbar } from 'notistack';
import { StreamContext } from '../../../context/StreamProvider';
import { listS3 } from "../../../api's/TableRuleApi";
import { createStream } from "../../../api's/StreamApi";
import { AuthContext } from '../../../context/AuthProvider';
import { ClientContext } from '../../../context/ClientProvider';
import { JobContext } from '../../../context/JobProvider';

const Step1 = ({ client, batch, step1Data, setstep1Data, NextData, setNextData, streamData }) => {
  const { userId } = useContext(AuthContext);
  const { setJob } = useContext(JobContext);
  const { enqueueSnackbar } = useSnackbar();
  const { setStream } = useContext(StreamContext);
  const [UpdatePath, setUpdatePath] = useState(false);

  const [form] = Form.useForm();

  // console.log(userId, client.client_id)

  const onFinish = async (values) => {
    setstep1Data(values);
    setNextData({ step1: false, step2: true, step3: false, step4: true });
    setJob(values.tableName);
    await updateStreamMetaData();
    enqueueSnackbar(`Changes updated !`, {
      variant: 'success',
      autoHideDuration: 3000,
      anchorOrigin: { vertical: 'top', horizontal: 'right' },
    });
  };

  const step1Call = async () => {
    form.setFieldsValue({
      clientName: client.client_name,
      stream_name: streamData.stream_name,
      tableName: streamData.table_name,
      flowBuilder: step1Data.flowBuilder || false,
      ruleEngine: step1Data.ruleEngine || false,
      storage: step1Data.storage || false,
      stream_id: streamData.stream_id,
    });
    setUpdatePath(!UpdatePath);
  };

  const handleListS3 = async () => {
    const prefix = `${streamData.client_name}/${streamData.stream_name}/${streamData.table_name}/Rule_engine/Table-Json`;
    const resp = await listS3(client.client_id, prefix);
    if (resp.status === 200) {
      form.setFieldsValue({
        json: resp.data[0],
      });
    }
  };

  const updateStreamMetaData = async () => {
    try {
      const data = {
        ...streamData,
        ruleEngine: form.getFieldValue().ruleEngine,
        flowBuilder: form.getFieldValue().flowBuilder,
        storage: form.getFieldValue().storage,
      };

      console.log(data);
      const response = await createStream(data, client.client_id, userId);
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

  useEffect(async () => {
    setStream(streamData);
    await step1Call();
    await handleListS3();
  }, [streamData]);

  return (
    <>
      <br />
      <div>
        <Form
          form={form}
          name="Real_Time_Data"
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
            label="Stream Name"
            name="stream_name"
            rules={[{ required: true, message: 'Please input Client Name' }]}
          >
            <Input disabled />
          </Form.Item>
          <Form.Item
            label="Stream Id"
            name="stream_id"
            hidden
            rules={[{ required: true, message: 'Please input Client Name' }]}
          >
            <Input disabled />
          </Form.Item>

          <Form.Item
            label="Table Name"
            name="tableName"
            rules={[{ required: true, message: 'Please input Client Name' }]}
          >
            <Input disabled />
          </Form.Item>
          <Form.Item label="JSON" name="json" rules={[{ required: true, message: 'Please input Client Name' }]}>
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

          <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
            <Button variant="contained" htmlType="submit">
              Submit
            </Button>
          </Form.Item>
        </Form>
        <br />
      </div>
    </>
  );
};

export default Step1;
