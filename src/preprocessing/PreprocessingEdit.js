import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Select, Switch } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { updatePreprocessJob } from "../api's/PreprocessApi";

const PreprocessingEdit = () => {
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const location = useLocation();
  const { record } = location.state;
  const [form] = Form.useForm()
  const [fileExtension, setExtension] = useState('');
  const [loadingStatus, setloadingStatus] = useState(false)

  const onFinish = async (values) => {
    setloadingStatus(true)
    try {
      const data = {
        id: record.id,
        client_name: values.clientName,
        batch_name: values.batchName,
        table_name: values.tableName,
        extension: values.fileExtension,
        pattern: record.pattern,
        skip_PreProcess: values.skipPreprocess,
        fileDestination: values.destinationType
      };

      const response = await updatePreprocessJob(data);

      if (response.status === 200) {
        navigate('/preprocessor');
      }
    } catch (error) {
      if (error.response.status === 500) {
        enqueueSnackbar('Internal Server Error', {
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
    setloadingStatus(false)
  }


  useEffect(() => {
    form.setFieldsValue({
      clientName: record.client_name,
      batchName: record.batch_name,
      tableName: record.table_name,
      fileExtension: record.extension,
      destinationType: record.fileDestination,
      skipPreprocess: record.skipPreprocess || false
    })
  }, [])



  return (
    <>
      <br />
      <Form
        form={form}
        labelCol={{ span: 4, }}
        wrapperCol={{ span: 8, }}
        layout="horizontal"
        size='large'
        onFinish={onFinish}
      >
        <Form.Item
          label="Client Name"
          name="clientName"
          rules={[{ required: true, message: 'Please input Client Name!' }]}
        >
          <Input disabled />
        </Form.Item>
        <Form.Item
          label="Batch Name"
          name="batchName"
          rules={[{ required: true, message: 'Please input Batch Name!' }]}
        >
          <Input disabled />
        </Form.Item>
        <Form.Item
          label="Table Name"
          name="tableName"
          rules={[{ required: true, message: 'Please input Table Name!' }]}
        >
          <Input disabled />
        </Form.Item>

        <Form.Item
          label="File Extension"
          name="fileExtension"
          rules={[{ required: true, message: 'Please select File Extension!' }]}
        >
          <Select onChange={(value) => { setExtension(value) }}>
            <Select.Option value="zip">zip</Select.Option>
            <Select.Option value="pdf">pdf</Select.Option>
            <Select.Option value="csv">csv</Select.Option>
            <Select.Option value="mp4">mp4</Select.Option>
          </Select>
        </Form.Item>
        {fileExtension === 'zip' &&
          <Form.Item
            label="Selected Extension"
            name="selectedExtension"
            rules={[{ required: true, message: 'Please select Selected Extension!' }]}
          >
            <Select>
              <Select.Option value="pdf">pdf</Select.Option>
              <Select.Option value="csv">csv</Select.Option>
              <Select.Option value="mp4">mp4</Select.Option>
            </Select>
          </Form.Item>
        }
        <Form.Item
          label="Destination"
          name="destinationType"
          rules={[{ required: true, message: 'Please select "Destination!' }]}
        >
          <Select>
            <Select.Option value="ziFlow Builder">Flow Builder</Select.Option>
            <Select.Option value="Rule Engine">Rule Engine</Select.Option>
            <Select.Option value="Preprocessor">Preprocessor</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="Skip Preprocess"
          name="skipPreprocess"
          valuePropName="checked">
          <Switch />
        </Form.Item>
        <Form.Item
          wrapperCol={{
            offset: 8,
            span: 16,
          }}
        >
          <Button loading={loadingStatus} type="primary" htmlType="submit">
            Submit
          </Button>
        </Form.Item>
      </Form>
    </>
  )
}
export default PreprocessingEdit