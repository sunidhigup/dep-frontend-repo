import React, { useState, useEffect } from 'react';
import { Paper, Stack, Box, Typography, TextField, Autocomplete, MenuItem } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Button, Divider, Form, Input, InputNumber, Select } from 'antd';
import { useNavigate } from 'react-router-dom';
import SaveIcon from '@mui/icons-material/Save';
import LoadingButton from '@mui/lab/LoadingButton';
import { useSnackbar } from 'notistack';
import InputField from '../../reusable-components/InputField';
import { createClientApi } from "../../api's/ClientApi";
import { getAllInfraRegions, getAllDataRegions } from "../../api's/MultiRegionApi";

const { Option } = Select;
const useStyles = makeStyles({
  paper: {
    padding: '20px',
    marginBottom: '20px',
  },
  formStyle: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px 0',
  },
  formDiv: {
    width: '600px',
  },
});

const OnboardingForm = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [form] = Form.useForm();
  const [AllDataRegions, setAllDataRegions] = useState([]);

  const [loading, setLoading] = useState(false);

  const handleAddClient = async (value) => {
    setLoading(true);
    console.log(value);

    try {
      const data = {
        client_name: value.clientName,
        year_created: value.year,
        infra_region: value.infraRegion,
        data_region: value.dataRegion,
      };
      const response = await createClientApi(data);

      if (response.status === 201) {
        navigate('/dashboard');
      }
    } catch (error) {
      if (error.response.status === 409) {
        enqueueSnackbar('This client already exist!', {
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

    setLoading(false);
  };

  const getInfraRegions = async () => {
    const response = await getAllInfraRegions();
    if (response.status === 200) {
      form.setFieldsValue({
        infraRegion: response.data.data,
      });
      getDataRegions();
    }
  };

  const getDataRegions = async () => {
    const data = {
      data: [
        {
          label: 'us-east-1',
          value: 'us-east-1',
        },
        {
          label: 'eu-central-1',
          value: 'eu-central-1',
        },
      ],
      status: 'success',
    };
    setAllDataRegions(data.data);
    // const response = await getAllDataRegions();
    // if (response.status === 200) {
    //   setAllDataRegions(response.data.data);
    // }
  };
  useEffect(() => {
    getInfraRegions();
  }, []);

  const onFinish = (values) => {
    console.log(values);
  };

  const onDataRegionChange = (value) => {
    form.setFieldsValue({
      dataRegion: value,
    });
  };

  return (
    <Paper className={classes.paper} elevation={1}>
      <h3 style={{ display: 'flex', justifyContent: 'center' }}>Onboard New Client</h3>
      <Divider />
      <Form
        form={form}
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 14 }}
        layout="horizontal"
        size="large"
        onFinish={handleAddClient}
      >
        <Form.Item
          label="Client Name"
          name="clientName"
          rules={[{ required: true, message: 'Please input client Name!' }]}
        >
          <Input allowClear style={{ width: 'calc(100% - 250px)' }} />
        </Form.Item>
        <Form.Item label="Year" name="year" rules={[{ required: true, message: 'Please input year!' }]}>
          <Input allowClear style={{ width: 'calc(100% - 250px)' }} />
        </Form.Item>
        <Form.Item label="Infra Region" name="infraRegion" rules={[{ required: true }]}>
          <Input disabled style={{ width: 'calc(100% - 250px)' }} />
        </Form.Item>
        <Form.Item
          label="Data Region"
          name="dataRegion"
          rules={[{ required: true, message: 'Please select Data Region!' }]}
        >
          <Select allowClear style={{ width: 'calc(100% - 250px)' }} onChange={onDataRegionChange}>
            {AllDataRegions &&
              AllDataRegions.map((ele, i) => {
                return (
                  <Option key={i} value={`${ele.value}`}>
                    {ele.label}
                  </Option>
                );
              })}
          </Select>
        </Form.Item>
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            shape="round"
            style={{ marginLeft: '50%', color: 'white', backgroundColor: 'green' }}
          >
            Submit
          </Button>
        </Form.Item>
      </Form>
    </Paper>
  );
};

export default OnboardingForm;
