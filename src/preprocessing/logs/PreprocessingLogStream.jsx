import { Breadcrumbs } from '@mui/material';
// import { makeStyles } from "@mui/styles";
import { Box } from '@mui/system';
import { useSnackbar } from 'notistack';

import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate, useParams,useLocation } from 'react-router-dom';
import Paper from '@mui/material/Paper';
import 'antd/dist/antd.css';
import { Space, Table, Typography, Button,Tooltip,Modal,Form,Select } from 'antd';
import { ArrowRightOutlined, LoadingOutlined,PlayCircleFilled } from '@ant-design/icons';

import NavigateNextIcon from '@mui/icons-material/NavigateNext';


import LoadingIcon from '../../reusable-components/LoadingIcon';
import { BUCKET_NAME,PROCESSED_BUCKET } from '../../constants/Constant';
import { HomeTabContext } from '../../context/HomeTabProvider';
import { BatchContext } from '../../context/BatchProvider';
import { ClientContext } from '../../context/ClientProvider';
import { RuleEngineTabContext } from '../../context/RuleEngineTabProvider';
import { getPreprocessLogStreamApi, getPreprocessorLogStreamApiStatus } from "../../api's/LogsApi";
import { executePreprocessApi,AllFilesOfS3,AllFoldersOfS3,AllFilesOfS3Processed} from "../../api's/PreprocessApi";

const { Option } = Select;





const PreprocessingLogStream = () => {

  const navigate = useNavigate();
  const { batch } = useContext(BatchContext);
  const { client } = useContext(ClientContext);
  // const { setValue } = useContext(RuleEngineTabContext);
  const { setPreprocessor } = useContext(RuleEngineTabContext);
  const { setHomeValue } = useContext(HomeTabContext);
  const [logStream, setLogStream] = useState([]);
  const [FilesData, setFilesData] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [tableName, setTableName] = useState('');
  const [FoldersData, setFoldersData] = useState([]);
  const location = useLocation();
  const { record } = location.state;
  console.log(record);





  const [loadBtn, setLoadBtn] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const [form] = Form.useForm();



  const params = useParams();

  const getEachLogStreamStatus = async (execution_id, timestamp, log_stream_name, extension) => {
    try {
      const result = await getPreprocessorLogStreamApiStatus(execution_id)
      // console.log(result.status)
      const data = {
        "status": result.data.status,
        "timestamp": timestamp,
        "log_stream_name": execution_id,
        extension
      }
      return data
    } catch (error) {
      // console.log(error)
      const data = {
        "status": "Not found",
        "timestamp": timestamp,
        "log_stream_name": execution_id,
        "extension": "garbage"
      }
      return data
    }
  }

  const getLogs = async () => {
    setLoadBtn(true);
    // const prefix = client.client_name + "_" + batch.batch + "_" + params.tablename;
    const prefix = `${client.client_name}_${batch.batch_name}_${params.tablename}`;
    const response = await getPreprocessLogStreamApi(prefix.replaceAll(' ', ''));

    // if (response) {
    //   console.log(response.data)
    //   setLogStream(response.data);
    // }
    const data = response.data
    console.table(data)
    const array = [];
    data.forEach((ele) => {
      if (ele.timestamp) {
        const log_stream_name = ele.log_stream_name


        // console.log(log_stream_name);
        const index1 = log_stream_name.indexOf("_zip");
        const index2 = log_stream_name.indexOf("_pdf");
        const index3 = log_stream_name.indexOf("_structure_Extraction");
        const index4 = log_stream_name.indexOf("_content_Extraction");
        if (index1 !== -1) {
          const log = log_stream_name.substring(0, index1);
          const finalLog = log;
          array.push({ "timestamp": ele.timestamp, log_stream_name, "execution_id": finalLog, "extension": "zip" })
        }
        else if (index2 !== -1) {
          const log = log_stream_name.substring(0, index2);

          const finalLog = log;

          array.push({ "timestamp": ele.timestamp, "log_stream_name": log, "execution_id": finalLog, "extension": "pdf" })
        }
        else if (index3 !== -1) {
          const log = log_stream_name.substring(0, index3);
          const finalLog = log;
          array.push({ "timestamp": ele.timestamp, log_stream_name, "execution_id": finalLog, "extension": "pdf" })
        }
        else if (index4 !== -1) {
          const log = log_stream_name.substring(0, index4);
          const finalLog = log;
          array.push({ "timestamp": ele.timestamp, log_stream_name, "execution_id": finalLog, "extension": "pdf" })
        } else {
          array.push({ "timestamp": ele.timestamp, log_stream_name, "execution_id": log_stream_name, "extension": "" })
        }

      }
    })
    console.table(array);
    const promises = [];
    array.forEach((ele) => {
      const execution_id = ele.execution_id;
      // console.log(execution_id);
      promises.push(getEachLogStreamStatus(execution_id, ele.timestamp, ele.log_stream_name, ele.extension));
    });

    const status = await Promise.all(promises);
    console.table(status)

    const output = status.filter(employee => employee.extension !== "garbage");
    console.table(output)

    setLogStream(output);

    setLoadBtn(false);
  };

  useEffect(() => {
    getLogs();
    return () => {
      setLogStream();
    };
  }, []);

  const handleMouseEnter = (e) => {
    e.target.style.color = 'blue';
  };
  const handleMouseLeave = (e) => {
    e.target.style.color = 'black';
  };

  const redirectTableRule = () => {
    navigate(-1);
    setPreprocessor(0);
    setHomeValue(0);
  };

  const redirectHome = () => {
    navigate(-1);
    setPreprocessor(0);
    setHomeValue(0);
  };

  const getAllFiles = async (prefix) => {
    setFilesData([])
    // console.log(prefix)
    const res = await AllFilesOfS3(prefix);
    if (res.status === 200) {
        setFilesData(res.data)
    }
}

  const onFinish = async (values) => {
     console.log(values);
    try {

        const response = await executePreprocessApi(BUCKET_NAME, values.Files.slice(0, values.Files.length - 1));
        if (response.status === 200) {
            enqueueSnackbar(`${values.Files.split('/')[3]} Lamda Trigger`, {
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
    form.setFieldsValue({
      Folders: '',
      Files: ''
  })
   
};

const showModal = async (e, client_name, batch_name, table_name) => {
  setIsModalVisible(true);
  setTableName(table_name);
  const res1 = await AllFoldersOfS3(client_name, batch_name, table_name)
  if (res1.status === 200) {
      setFoldersData(res1.data)
  }
};

const handleCancel = () => {
  setIsModalVisible(false);
  form.setFieldsValue({
      Folders: '',
      Files: ''
  })
};
const getAllFilesProcessed=async(prefix,extension)=>
{
  const file=prefix.split("_").slice(0,4).join("_");
  const finalFilePath=file.concat(".").concat(extension);

  console.log(finalFilePath);
  const res1=await AllFilesOfS3Processed(finalFilePath);
  

  return {finalFilePath,res1};
  
}
const ProcessedTrigger= async (values,extension) => {
  const res=await getAllFilesProcessed(values,extension);
  if(res.res1)
  {
 try {

     const response = await executePreprocessApi(PROCESSED_BUCKET,`input/${res.finalFilePath}`);
     if (response.status === 200) {
         enqueueSnackbar(`${values.Files.split('/')[3]} Lamda Trigger`, {
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
 }

};


  const columns = [
    {
      title: 'Stream Name',
      dataIndex: 'log_stream_name',
      align: 'center',
      width: '15vw',
      sorter: (a, b) => a.client_name.length - b.client_name.length,
    },
    {
      title: 'Extension',
      dataIndex: 'extension',
      align: 'center',
      width: '15vw',
    },
    {

      title: 'Run',

      dataIndex: 'run',

      align: 'center',

      width: '5vw',

      render: (_, record) => (
        
        <Space size="middle">
         
          {
            

            <Typography.Link

            onClick={(e) => {
              if(record.status==='Failed')
              {
                showModal(e, client.client_name, batch.batch_name, params.tablename)

              }

              else{
                ProcessedTrigger(record.log_stream_name,record.extension);
              }

            }}

              style={{

                marginRight: 8,

                color: 'red',

              }}

            >

              <Button

                type="primary"

                shape="round"

                icon={<ArrowRightOutlined style={{ fontSize: 18, fontWeight: 'bold' }} />}

                size="small"

              >

                Run

              </Button>

            </Typography.Link>
            

          }

        </Space>

      ),

    },
    {
      title: 'Timestamp',
      dataIndex: 'timestamp',
      align: 'center',
      width: '20vw',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      align: 'center',
      width: '15vw',
      filters: [
        {
          text: 'Completed',
          value: 'Completed',
        },
        {
          text: 'In Progress',
          value: 'In Progress',
        },
        {
          text: 'Failed',
          value: 'Failed',
        },
        {
          text: 'Running',
          value: 'Running',
        },
      ],
      render(text, record) {
        return {
          props: {
            style: {
              color: (text === 'Completed' && 'green') || (text === 'Failed' && 'red') || (text === 'Running' && 'blue') || (text === 'Not found' && 'gray') || 'orange',
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
      key: 'action',
      width: '15vw',
      render: (_, record) => (

        <Space size="middle">
          {
            (record.extension === "zip" || record.extension === "" )&&
            <>
              <Typography.Link
                onClick={() => {
                  navigate(`/preprocessor/Lambdalogs/${params.tablename}/${record.log_stream_name}`)
                }}
                style={{
                  marginRight: 8,
                  color: 'red',
                }}
              >
                <Button type="primary" shape="round" icon={<ArrowRightOutlined style={{ fontSize: 18, fontWeight: 'bold' }} />} size="small">
                  Lambda Logs
                </Button>
              </Typography.Link>
              <Typography.Link
                onClick={() => {
                  navigate(`/preprocessor/Lambdalogs/${params.tablename}/${record.log_stream_name}`)
                }}
                style={{
                  marginRight: 8,
                  color: 'red',
                }}
              >
                <Button type="primary" shape="round" icon={<ArrowRightOutlined style={{ fontSize: 18, fontWeight: 'bold' }} />} size="small">
                  Content Logs
                </Button>
              </Typography.Link>
            </>
          }

          {
            (record.extension === "pdf") &&
            <>
              <Typography.Link
                onClick={() => {
                  navigate(`/preprocessor/Lambdalogs/${params.tablename}/${record.log_stream_name}`)
                }}
                style={{
                  marginRight: 8,
                  color: 'red',
                }}
              >
                <Button type="primary" shape="round" icon={<ArrowRightOutlined style={{ fontSize: 18, fontWeight: 'bold' }} />} size="small">
                  Lambda Logs
                </Button>
              </Typography.Link>
              <Typography.Link
                onClick={() => {
                  navigate(`/preprocessor/ContentLogs/${params.tablename}/${record.log_stream_name}`)
                }}
                style={{
                  marginRight: 8,
                  color: 'red',
                }}
              >
                <Button type="primary" shape="round" icon={<ArrowRightOutlined style={{ fontSize: 18, fontWeight: 'bold' }} />} size="small">
                  PDF Content Logs
                </Button>
              </Typography.Link>

              <Typography.Link
                onClick={() => {
                  navigate(`/preprocessor/StructureLogs/${params.tablename}/${record.log_stream_name}`)
                }}
                style={{
                  marginRight: 8,
                  color: 'red',
                }}
              >
                <Button type="primary" shape="round" icon={<ArrowRightOutlined style={{ fontSize: 18, fontWeight: 'bold' }} />} size="small">
                  PDF Structure Logs
                </Button>
              </Typography.Link>
            </>
          }
        </Space>
      ),
    },
  ];

  const tableColumns = columns.map((item) => ({ ...item }));


  return (
    <>
      <Paper elevation={1}>
        <Box sx={{ m: 2, backgroundColor: '#fff', borderRadius: '10px', p: 2 }}>
          <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} aria-label="breadcrumb">
            <a role="button" tabIndex="0" onClick={redirectHome} onKeyDown={redirectHome} style={{ cursor: 'pointer' }}>
              {batch.batch_name}
            </a>

            <a
              role="button"
              tabIndex="0"
              style={{ cursor: 'pointer' }}
              onClick={redirectTableRule}
              onKeyDown={redirectTableRule}
            >
              Preprocessor
            </a>

            <span style={{ color: '#6c757d' }}>{params.tablename}</span>
          </Breadcrumbs>
        </Box>
      </Paper>

      <Paper elevation={1}>
        {loadBtn && <LoadingIcon />}
        {!loadBtn && logStream.length === 0 && <h3 style={{ margin: '20px 0' }}> No Logs Found.</h3>}

        {logStream.length > 0 && (

          <div style={{ marginTop: 10, border: '2px solid black' }}>
            <Table
              rowClassName={(record, index) => (index % 2 === 0 ? 'table-row-light' : 'table-row-light')}
              bordered="true"
              pagination={{
                position: ['bottomCenter'],
                defaultPageSize: 10,
              }}
              columns={tableColumns}
              dataSource={logStream}
            />
          </div>
        )}
      </Paper>

      <Modal
                title={`${tableName} PreProcessor Execution`}
                visible={isModalVisible}
                onCancel={handleCancel}
                footer={null}
                centered
                maskClosable
            >
                <Form
                    form={form}
                    labelCol={{ span: 6 }}
                    wrapperCol={{ span: 22 }}
                    layout="horizontal"
                    onFinish={onFinish}
                >
                    <Form.Item
                        name="Folders"
                        label="TimeStamp"
                        rules={[
                            {
                                required: true,
                                message: 'Please select folder!',
                            },
                        ]}>
                        <Select onChange={getAllFiles}>
                            {
                                FoldersData && FoldersData.map((ele, idx) => {
                                    return (
                                        <Option key={idx} value={ele.value}>{ele.label}</Option>
                                    )
                                })
                            }
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="Files"
                        label="File"
                        rules={[
                            {
                                required: true,
                                message: 'Please select file!',
                            },
                        ]}>
                        <Select>
                            {
                                FilesData && FilesData.map((ele, idx) => {
                                    return (
                                        <Option key={idx} value={ele.value}>{ele.label}</Option>
                                    )
                                })
                            }
                        </Select>
                    </Form.Item>
                    <Form.Item style={{ marginLeft: '40%' }}>
                        <Button type="primary" htmlType="submit">
                            Submit
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>


    </>
  )
}

export default PreprocessingLogStream

