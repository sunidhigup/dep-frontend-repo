import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useSnackbar } from 'notistack';
import 'antd/dist/antd.css';
import { Space, Table, Typography, Button, Tooltip, Select, Form, Modal } from 'antd';
import {
  ArrowRightOutlined,
  CaretRightOutlined,
  DeleteFilled,
  CheckCircleOutlined,
  PlayCircleFilled,
  RedoOutlined,
  UnorderedListOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import { Box, Paper, MenuItem, Stack } from '@mui/material';
import MModal from '@mui/material/Modal';
import { LoadingButton } from '@mui/lab';
import SaveIcon from '@mui/icons-material/Save';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DoNotDisturbOnIcon from '@mui/icons-material/DoNotDisturbOn';
import CancelIcon from '@mui/icons-material/Cancel';
import PendingIcon from '@mui/icons-material/Pending';
import Error from '@mui/icons-material/Error';
import { Link } from 'react-router-dom';
import axios from 'axios';
import InputField from '../../../reusable-components/InputField';
import BASEURL from '../../../BaseUrl';
import { BatchContext } from '../../../context/BatchProvider';
import { ClientContext } from '../../../context/ClientProvider';
import {
  createCsvToJson,
  createS3Path,
  createTableRule,
  executeWholeRules,
  fetchTableRules,
  getCsvData,
  getS3TableRules,
  getRuleEngineStatus,
  deleteTableRule,
  executeRuleEngine,
  AllFilesOfS3,
  AllFoldersOfS3,
  fetchTableRulesWithStatus,
  fetchStatusForTableruleApi,
} from "../../../api's/TableRuleApi";
import { createBatchidApi, fetchBatchidApi } from "../../../api's/BatchApi";
import LoadingIcon from '../../../reusable-components/LoadingIcon';
import TableRuleRowNew from '../v1/TableRuleRowNew';

const { Option } = Select;

const component = {
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: '#fff',
  borderRadius: '10px',
  overflow: 'hidden',
};
const upperComponent = {
  borderBottom: '5px solid #e9ecef',
  padding: '10px 20px',
};
const lowerComponent = {
  // margin: '15px',
};
const header = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  borderRadius: '5px',
  padding: '10px 20px',
  backgroundColor: '#000',
  color: '#fff',
};

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: '#fff',
  border: '1px solid #000',
  borderRadius: '10px',
  boxShadow: 24,
  p: 4,
};

const TableRuleNew = ({ userRole }) => {
  const { enqueueSnackbar } = useSnackbar();
  const { batch } = useContext(BatchContext);
  const { client } = useContext(ClientContext);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openCsvModal, setOpenCsvModal] = useState(false);
  const [openS3PathModal, setopenS3PathModal] = useState(false);
  const [openFileModal, setOpenFileModal] = useState(false);
  const [file_name, setfile_name] = useState('');
  const [loadBtn, setLoadBtn] = useState(false);
  const [path, setPath] = useState('');
  const [delimiter, setDelimiter] = useState();
  const [csvPath, setCsvPath] = useState();
  const [S3Path, setS3Path] = useState();
  const [bucket_name, setbucket_name] = useState();
  const [tableAccordion, setTableAccordion] = useState([]);
  // const [file, selectFile] = useFileUpload();
  const [isJsonFile, setisJsonFile] = useState(false);
  const [loadState, setLoadState] = useState('');

  const [CompletedStatus, setCompletedStatus] = useState(0);
  const [ProgressStatus, setProgressStatus] = useState(0);
  const [FailedStatus, setFailedStatus] = useState(0);
  const [UnknownStatus, setUnknownStatus] = useState(0);
  const [status_loading, setStatus_Loading] = useState(true);
  const [visible, setVisible] = useState(false);
  const [openLoadingModal, setOpenLoadingModal] = useState(false);
  const [disableRun, setDisableRun] = useState(false);
  const [runStatus, setRunStatus] = useState('Loading...');

  const [form] = Form.useForm();
  const [FoldersData, setFoldersData] = useState([]);
  const [FilesData, setFilesData] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [tableNameModal, setTableNameModal] = useState('');
  const [currentRecord, setCurrentRecord] = useState({});

  const loadJobStatus = (ele) => {
    if (ele.status === 'Completed') {
      return { ...ele, disableRunNew: false };
    }
    if (ele.status === 'Running') {
      return { ...ele, disableRunNew: true };
    }
    if (ele.status === 'Failed') {
      return { ...ele, disableRunNew: false };
    }

    if (ele.status === 'Unknown') {
      return { ...ele, disableRunNew: false };
    }
    const time = ele.execution_id.split('_')[1];
    const triggeredTime = new Date(time);
    const currentTime = new Date();

    const diffTime = currentTime - triggeredTime;

    const elapsedTime = Math.floor(diffTime / 60e3);

    if (elapsedTime < 5) {
      return { ...ele, status: 'Running', disableRunNew: true };
    }
    return { ...ele, status: 'Failed', disableRunNew: false };
  };

  const fetchTableRule = async () => {
    setLoadBtn(true);
    setStatus_Loading(false);
    try {
      const response = await fetchTableRulesWithStatus(client.client_id, batch.batch_name);

      if (response.status === 200) {
        const array = response.data;

        const statusTable = [];

        array.forEach((ele) => {
          statusTable.push(loadJobStatus(ele));
        });

        const obj = {
          UnknownStatus: 0,
          ProgressStatus: 0,
          FailedStatus: 0,
          CompletedStatus: 0,
        };

        setTableAccordion(statusTable);

        statusTable.forEach((ele) => {
          if (ele.status === 'Completed') {
            obj.CompletedStatus += 1;
          } else if (ele.status === 'Running') {
            obj.ProgressStatus += 1;
          } else if (ele.status === 'Failed') {
            obj.FailedStatus += 1;
          } else {
            obj.UnknownStatus += 1;
          }
        });
        setUnknownStatus(obj.UnknownStatus);
        setFailedStatus(obj.FailedStatus);
        setProgressStatus(obj.ProgressStatus);
        setCompletedStatus(obj.CompletedStatus);
      }
    } catch (error) {
      setLoadState('Not Found');
      setTableAccordion([]);
      if (error.response.status === 404) {
        enqueueSnackbar('Table Rule not found!', {
          variant: 'warning',
          autoHideDuration: 3000,
          anchorOrigin: { vertical: 'top', horizontal: 'right' },
        });
      }
    }
    setLoadBtn(false);
    setStatus_Loading(true);
  };

  useEffect(() => {
    fetchTableRule();

    return () => {
      setTableAccordion([]);
    };
  }, [batch.batch_name]);

  const handleAddModalOpen = () => setOpenAddModal(true);

  const handleAddModalClose = () => setOpenAddModal(false);

  const handleS3PathModalOpen = () => setopenS3PathModal(true);

  const handleS3PathModalClose = () => setopenS3PathModal(false);

  const handleCsvModalOpen = () => setOpenCsvModal(true);

  const handleCsvModalClose = () => setOpenCsvModal(false);

  const handleSelectFileOpen = () => setOpenFileModal(true);

  const handleSelectFileClose = () => setOpenFileModal(false);

  const handleLoadingModalClose = useCallback(() => setOpenLoadingModal(false), []);

  const handleLoadingModalOpen = useCallback(() => setOpenLoadingModal(true), []);

  const handleAddTable = async () => {
    const regex = /^s3:\/\/.*json$/;

    if (!regex.test(path)) {
      enqueueSnackbar('S3 path is invalid!', {
        variant: 'error',
        autoHideDuration: 3000,
        anchorOrigin: { vertical: 'top', horizontal: 'right' },
      });
      return;
    }

    setLoadBtn(true);

    const generated = path.includes('generated');

    const pathArr = path.split('/');
    pathArr.shift(0);
    pathArr.shift(0);
    pathArr.shift(0);
    const tableName = pathArr[pathArr.length - 1].split('.')[0];
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
        fetchTableRule();
      }
    } catch (error) {
      if (error.response.status === 500) {
        enqueueSnackbar('Json file is invalid!', {
          variant: 'error',
          autoHideDuration: 3000,
          anchorOrigin: { vertical: 'top', horizontal: 'right' },
        });
      }
    }

    setLoadBtn(false);
    setPath('');
    handleAddModalClose();
  };

  const runWholeRuleEngine = async (e) => {
    e.preventDefault();

    const batch_table_id = `${client.client_name}_${batch.batch_name}_${new Date().getTime()}`;

    const promises = [];

    tableAccordion.forEach((ele) => {
      const client_id = `${batch.batch_name}_${ele.tablename}`;
      promises.push(
        axios.post(`${BASEURL}/batch_id/create`, {
          client_job: client_id.replaceAll(' ', ''),
          batch_id: batch_table_id.replaceAll(' ', ''),
        })
      );
    });

    await Promise.all(promises);

    const input = {
      batch: batch.batch_name,
      execution_id: batch_table_id.replaceAll(' ', ''),
      client_id: client.client_id,
      batch_id: batch.batch_name_id,
      client_name: client.client_name,
    };

    const response = await executeWholeRules(input);

    if (response.status === 200) {
      enqueueSnackbar('Rule Engine is running!', {
        variant: 'Success',
        autoHideDuration: 3000,
        anchorOrigin: { vertical: 'top', horizontal: 'right' },
      });
    }
  };

  const csvJson = (headers, delimiter) => {
    const fields = [];

    headers.map((el) => {
      fields.push({
        fieldname: el,
        size: 50,
        scale: 0,
        type: 'string',
      });
    });

    const main = {
      jsonversion: '1.0',
      revision: '1.0',
      filetype: 'DELIMITED',
      delimiter,
      fields,
    };

    return main;
  };

  const handleAddCsv = async () => {
    const regex = /^s3:\/\/.*csv$/;

    if (!regex.test(csvPath)) {
      enqueueSnackbar('S3 path is invalid!', {
        variant: 'error',
        autoHideDuration: 3000,
        anchorOrigin: { vertical: 'top', horizontal: 'right' },
      });
      return;
    }

    setLoadBtn(true);

    const pathArr = csvPath.split('/');
    pathArr.shift(0);
    pathArr.shift(0);
    pathArr.shift(0);
    const newPath = pathArr.join('/');

    const filename = pathArr.pop();

    const table = filename.split('.')[0];

    try {
      const data = {
        path: newPath,
        client_id: client.client_id,
      };
      const response = await getCsvData(data);

      if (response.status === 200) {
        const res = csvJson(response.data, delimiter);

        if (res) {
          try {
            const result = await createCsvToJson(client.client_id, batch.batch_name, table, res);

            if (result.status === 201) {
              enqueueSnackbar('JSON is created with the CSV file!', {
                variant: 'Success',
                autoHideDuration: 3000,
                anchorOrigin: { vertical: 'top', horizontal: 'right' },
              });
            }
          } catch (error) {
            if (error.response.status === 500) {
              enqueueSnackbar('Wrong Csv File!', {
                variant: 'error',
                autoHideDuration: 3000,
                anchorOrigin: { vertical: 'top', horizontal: 'right' },
              });
            }
          }
        }
      }
    } catch (error) {
      if (error.response.status === 500) {
        enqueueSnackbar('Wrong Csv File!', {
          variant: 'error',
          autoHideDuration: 3000,
          anchorOrigin: { vertical: 'top', horizontal: 'right' },
        });
      }
    }

    setLoadBtn(false);
    setCsvPath('');
    setDelimiter('');
    handleCsvModalClose();
  };

  const handleAdds3Path = async () => {
    const regex = /^s3:\/\/.*$/;

    if (!regex.test(S3Path)) {
      enqueueSnackbar('S3 path is invalid!', {
        variant: 'error',
        autoHideDuration: 3000,
        anchorOrigin: { vertical: 'top', horizontal: 'right' },
      });
      return;
    }

    setLoadBtn(true);
    const pathArr = S3Path.split('/');
    pathArr.shift(0);
    pathArr.shift(0);
    pathArr.shift(0);
    const newPath = pathArr.join('/');
    pathArr.pop();
    const news3path = pathArr.join('/');

    const data = {
      bucket_name,
      file_path: newPath,
      batch_name: batch.batch_name,
      client_id: client.client_id,
      table_name: 't',
    };

    const response = await createS3Path(data);

    if (response.status === 201) {
      enqueueSnackbar('s3 file Path is set successfully !!!', {
        variant: 'Success',
        autoHideDuration: 3000,
        anchorOrigin: { vertical: 'top', horizontal: 'right' },
      });
    }

    setLoadBtn(false);

    handleS3PathModalClose();
  };

  const deleteTableRule1 = async (tablename) => {
    try {
      const response = await deleteTableRule(client.client_id, batch.batch_name, tablename);
      if (response.status === 200) {
        fetchTableRule();
        enqueueSnackbar(`${tablename} is deleted`, {
          variant: 'success',
          autoHideDuration: 3000,
          anchorOrigin: { vertical: 'top', horizontal: 'right' },
        });
      } else {
        enqueueSnackbar(`Internal server error`, {
          variant: 'error',
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

  const refreshBtn = async (batchname, tablename, tablerule_id) => {
    const batchID = `${client.client_name}_${batchname}_${tablename}_ruleEngine`;

    try {
      const result = await fetchStatusForTableruleApi(tablerule_id, batchID.replaceAll(' ', ''));
      let status = 'Unknown';
      let disableRun = false;

      if (result.status === 200) {
        if (result.data.status === 'Completed') {
          disableRun = false;
          status = result.data.status;

          enqueueSnackbar(`Rule Engine is ${result.data.status}`, {
            variant: 'success',
            autoHideDuration: 3000,
            anchorOrigin: { vertical: 'top', horizontal: 'right' },
          });
        } else if (result.data.status === 'Running') {
          disableRun = true;
          status = result.data.status;
          enqueueSnackbar(`Rule Engine is ${result.data.status}`, {
            variant: 'warning',
            autoHideDuration: 3000,
            anchorOrigin: { vertical: 'top', horizontal: 'right' },
          });
        } else if (result.data.status === 'Failed') {
          disableRun = false;
          status = result.data.status;
          enqueueSnackbar(`Rule Engine is ${result.data.status}`, {
            variant: 'failed',
            autoHideDuration: 3000,
            anchorOrigin: { vertical: 'top', horizontal: 'right' },
          });
        } else if (result.data.status === 'Unknown') {
          disableRun = false;
          status = result.data.status;
          enqueueSnackbar(`Rule Engine is ${result.data.status}`, {
            variant: 'failed',
            autoHideDuration: 3000,
            anchorOrigin: { vertical: 'top', horizontal: 'right' },
          });
        } else {
          const time = result.data.split('_')[1];
          const triggeredTime = new Date(time);
          const currentTime = new Date();

          const diffTime = currentTime - triggeredTime;

          const elapsedTime = Math.floor(diffTime / 60e3);

          if (elapsedTime < 5) {
            disableRun = true;
            status = 'In Progress';

            enqueueSnackbar(`Rule Engine is in progress.`, {
              variant: 'secondary',
              autoHideDuration: 3000,
              anchorOrigin: { vertical: 'top', horizontal: 'right' },
            });
          } else {
            disableRun = false;
            status = 'Failed';
            enqueueSnackbar(`Rule Engine is failed.`, {
              variant: 'error',
              autoHideDuration: 3000,
              anchorOrigin: { vertical: 'top', horizontal: 'right' },
            });
          }
        }

        const newTableRuleList = [...tableAccordion];
        newTableRuleList.forEach((el) => {
          if (el.id === result.data.id) {
            el.status = status;
            el.disableRunNew = disableRun;
          }
        });

        setTableAccordion(newTableRuleList);
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

  const getAllFiles = async (prefix) => {
    setFilesData([]);
    const res = await AllFilesOfS3(client.client_id, prefix);
    if (res.status === 200) {
      setFilesData(res.data);
    }
  };

  const showModal = async (client_name, batch_name, table_name) => {
    setIsModalVisible(true);
    setTableNameModal(table_name);
    const res1 = await AllFoldersOfS3(client.client_id, client_name, batch_name, table_name);
    if (res1.status === 200) {
      setFoldersData(res1.data);
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.setFieldsValue({
      Folders: '',
      Files: '',
    });
  };

  const onFinish = async (values) => {
    const id = values.Folders.split('/')[5];
    setIsModalVisible(false);
    console.log('second');
    form.setFieldsValue({
      Folders: '',
      Files: '',
    });

    await runRuleEngine(currentRecord.tablename, currentRecord, id);
  };

  const runRuleEngine = async (tablename, record, id) => {
    console.log('third');
    console.log(id);
    const execution_id_split = id.split('_');
    execution_id_split.splice(3, 0, 'ruleEngine');
    const new_execution_id = execution_id_split.join('_');
    console.log(new_execution_id);

    // handleLoadingModalOpen();
    // try {

    //   const batch_table_id = `${client.client_name}_${batch.batch_name}_${tablename}_ruleEngine_${new Date().getTime()}`;
    //   const batch_table_id = new_execution_id

    //   const client_job = `${client.client_name}_${batch.batch_name}_${tablename}_ruleEngine`;

    //   const data = {
    //     client_job: client_job.replaceAll(' ', ''),
    //     batch_id: batch_table_id.replaceAll(' ', ''),
    //   };

    //   const res = await createBatchidApi(data);

    //   const input = {
    //     batch: batch.batch_name,
    //     execution_id: batch_table_id.replaceAll(' ', ''),
    //     client_id: client.client_id,
    //     batch_id: batch.batch_id,
    //     table_name: tablename,
    //     client_name: client.client_name,
    //   };

    //   const response = await executeRuleEngine(input);

    //   if (response.status === 200) {
    //     record.disableRunNew = true
    //     record.status = "In Progress"
    //     handleLoadingModalClose();
    //     enqueueSnackbar('Table Rule is running!', {
    //       variant: 'Success',
    //       autoHideDuration: 3000,
    //       anchorOrigin: { vertical: 'top', horizontal: 'right' },
    //     });
    //   }
    // } catch (error) {
    //   if (error.response.status === 403) {
    //     enqueueSnackbar('You have only Read Permission !!', {
    //       variant: 'error',
    //       autoHideDuration: 3000,
    //       anchorOrigin: { vertical: 'top', horizontal: 'right' },
    //     });
    //   }
    // }
    // handleLoadingModalClose();
  };

  const columns = [
    {
      title: 'Table',
      dataIndex: 'tablename',
      align: 'center',
      width: '30vw',
      sorter: (a, b) => a.tablename.localeCompare(b.tablename),
      render(text, record) {
        return {
          props: {
            style: {
              fontWeight: 'bold',
              fontSize: 14,
            },
          },
          children: <div>{text}</div>,
        };
      },
    },
    {
      title: 'Action',
      dataIndex: 'action',
      align: 'center',
      width: '15vw',
      render: (_, record) => {
        return (
          <Space size="middle">
            {/* <Typography.Link
              onClick={() => {
                // record.disableRunNew = true;
                // runRuleEngine(record.tablename, record)
                // console.log(record);

                // record.disableRunNew = true;
                setCurrentRecord(record);
                // // runRuleEngine(record.tablename, record)
                showModal(client.client_name, batch.batch_name, record.tablename, record);
              }}
              style={{
                marginRight: 8,
                color: 'red',
              }}
            >
              <Tooltip title="Run">
                <Button
                  shape="circle"
                  disabled={record.disableRunNew}
                  icon={<PlayCircleFilled style={{ color: 'green', fontSize: 'medium' }} />}
                  size="medium"
                />
              </Tooltip>
            </Typography.Link> */}
            <Typography.Link
              onClick={() => {
                // console.log(record)
                deleteTableRule1(record.tablename);
              }}
              style={{
                marginRight: 8,
                color: 'red',
              }}
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
                // console.log(record)
              }}
              style={{
                marginRight: 8,
                color: 'red',
              }}
            >
              <Link to={`/rule-engine/logs/${record.tablename}`}>
                <Tooltip title="Logs">
                  <Button
                    shape="circle"
                    icon={<UnorderedListOutlined style={{ color: 'blue', fontSize: 'medium' }} />}
                    size="medium"
                  />
                </Tooltip>
              </Link>
            </Typography.Link>
          </Space>
        );
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      align: 'center',
      width: '25vw',
      filters: [
        {
          text: 'Completed',
          value: 'Completed',
        },
        {
          text: 'Running',
          value: 'Running',
        },
        {
          text: 'Unknown',
          value: 'Unknown',
        },
        {
          text: 'Failed',
          value: 'Failed',
        },
        {
          text: 'In Progress',
          value: 'In Progress',
        },
      ],
      render: (text, record) => {
        return {
          props: {
            style: { color: (record.status === 'Completed' && 'green') || 'red', fontWeight: 'bold', fontSize: 14 },
          },
          children: (
            <Space size="middle">
              {/* <Typography>{record.status}</Typography> */}
              <div
                style={{
                  display: 'flex',
                  // paddingTop: 5,
                  justifyContent: 'center',
                  width: '30%',
                }}
              >
                {record.status === 'Loading...' && record.status}
                {record.status === 'Completed' && (
                  <p
                    style={{
                      color: 'green',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <CheckCircleOutlined style={{ fontSize: '18px' }} /> &nbsp;
                    {record.status}
                  </p>
                )}
                {record.status === 'Running' && (
                  <p
                    style={{
                      color: '#ffc300',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <AccessTimeIcon style={{ fontSize: '18px' }} /> &nbsp; <span>{record.status}</span>
                  </p>
                )}
                {record.status === 'Unknown' && (
                  <p
                    style={{
                      color: 'grey',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <DoNotDisturbOnIcon style={{ fontSize: '18px' }} /> &nbsp;
                    {record.status}
                  </p>
                )}

                {record.status === 'Error' && (
                  <p
                    style={{
                      color: 'red',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Error style={{ fontSize: '18px' }} /> &nbsp;
                    {record.status}
                  </p>
                )}

                {record.status === 'Failed' && (
                  <p
                    style={{
                      color: 'red',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <CancelIcon style={{ fontSize: '18px' }} /> &nbsp;
                    {record.status}
                  </p>
                )}

                {record.status === 'In Progress' && (
                  <p
                    style={{
                      color: '#98c1d9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <PendingIcon style={{ fontSize: '18px' }} /> &nbsp;
                    {record.status}
                  </p>
                )}
              </div>
              <Typography.Link
                onClick={() => {
                  console.log(record);
                  refreshBtn(batch.batch_name, record.tablename, record.id);
                }}
                style={{
                  marginRight: 8,
                  color: 'red',
                }}
              >
                <Tooltip title="refresh">
                  <Button
                    shape="circle"
                    icon={<RedoOutlined style={{ color: 'gray', fontSize: 'medium' }} />}
                    size="medium"
                  />
                </Tooltip>
              </Typography.Link>
            </Space>
          ),
        };
      },
      onFilter: (value, record) => record.status.indexOf(value) === 0,
    },
    {
      title: 'Explore',
      key: 'explore',
      sorter: false,
      align: 'center',
      render: (_, record) => {
        return (
          <Space size="middle">
            <Typography.Link
              onClick={() => {
                // console.log(record)
              }}
              style={{
                marginRight: 8,
                color: 'red',
              }}
            >
              <Link to={`/rule-engine/table-rule/${record.tablename}/${record.id}`}>
                <Tooltip title="explore">
                  <Button type="primary" shape="circle" icon={<ArrowRightOutlined />} size="medium" />
                </Tooltip>
              </Link>
            </Typography.Link>
          </Space>
        );
      },
    },
  ];

  const tableColumns = columns.map((item) => ({ ...item }));
  return (
    <>
      <Paper elevation={5}>
        <Box style={upperComponent}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <Button
                shape="round"
                size="medium"
                onClick={handleAddModalOpen}
                style={{ marginRight: 10 }}
                disabled={userRole === 'ROLE_reader'}
              >
                Add JSON Schema
              </Button>

              <Button shape="round" size="medium" onClick={handleCsvModalOpen} disabled={userRole === 'ROLE_reader'}>
                Add Delimited Schema
              </Button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'row' }}>
              <h3 style={{ color: 'blue', fontWeight: 'bold' }}>{batch.batch_name} </h3>
            </div>
            <div>
              <Button
                shape="round"
                variant="contained"
                size="medium"
                onClick={runWholeRuleEngine}
                style={{ backgroundColor: 'green', color: 'white' }}
                icon={<CaretRightOutlined style={{ color: 'white' }} />}
                disabled={userRole === 'ROLE_reader'}
              >
                Run Rule Engine
              </Button>
            </div>
          </div>
        </Box>
        <Box style={lowerComponent}>
          <div style={{ display: 'flex', flexDirection: 'row-reverse' }}>
            <div>
              {/* {!status_loading && (
                <Button
                  shape="circle"
                  // onClick={showPopconfirm}
                >
                  <SyncOutlined spin style={{ color: 'red' }} />
                </Button>
              )}
              {status_loading && (
                <Button
                  shape="circle"
                  // onClick={showPopconfirm}
                >
                  <SyncOutlined style={{ color: 'red' }} />
                </Button>
              )} */}
            </div>
            <div style={{ marginRight: '7px', color: 'gray', fontWeight: 'bold' }}>Unknown = {UnknownStatus} ;</div>
            <div style={{ marginRight: '7px', color: 'red', fontWeight: 'bold' }}>Failed = {FailedStatus} ;</div>
            <div style={{ marginRight: '7px', color: 'orange', fontWeight: 'bold' }}>Progress = {ProgressStatus} ;</div>
            <div style={{ marginRight: '7px', color: 'green', fontWeight: 'bold' }}>
              Completed = {CompletedStatus} ;
            </div>
          </div>
        </Box>
        <div style={{ marginTop: 10, border: '2px solid black' }}>
          <Table
            rowClassName={(record, index) => (index % 2 === 0 ? 'table-row-light' : 'table-row-light')}
            bordered="true"
            pagination={{
              total: tableAccordion.length,
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} Rules  `,
              position: ['bottomCenter'],
              defaultPageSize: 5,
              defaultCurrent: 1,
            }}
            columns={tableColumns}
            dataSource={tableAccordion}
          />
        </div>
      </Paper>

      <MModal
        open={openAddModal}
        onClose={handleAddModalClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <InputField
            id="outlined-basic"
            label="Table Layout JSON"
            variant="outlined"
            fullWidth
            name="fieldlevelrules"
            value={path}
            autoComplete="off"
            size="small"
            helperText="Enter s3 path of table layout json file to read"
            onChange={(event) => setPath(event.target.value)}
          />
          {!loadBtn ? (
            <Button
              variant="contained"
              sx={{ mt: 2 }}
              color="secondary"
              type="submit"
              className="button-color"
              onClick={handleAddTable}
            >
              Add
            </Button>
          ) : (
            <LoadingButton loading loadingPosition="start" startIcon={<SaveIcon />} variant="outlined" sx={{ mt: 2 }}>
              Add
            </LoadingButton>
          )}
        </Box>
      </MModal>

      <MModal
        open={openCsvModal}
        onClose={handleCsvModalClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <InputField
            id="outlined-basic"
            label="Delimited File"
            variant="outlined"
            fullWidth
            name="csvpath"
            value={csvPath}
            autoComplete="off"
            size="small"
            helperText="Enter s3 path of delimited file to create table schema"
            onChange={(event) => setCsvPath(event.target.value)}
          />
          <InputField
            id="outlined-basic"
            label="Delimiter"
            variant="outlined"
            fullWidth
            name="delimiter"
            value={delimiter}
            autoComplete="off"
            size="small"
            onChange={(event) => setDelimiter(event.target.value)}
          />
          {!loadBtn ? (
            <Button
              variant="contained"
              sx={{ mt: 2 }}
              color="secondary"
              type="submit"
              className="button-color"
              onClick={handleAddCsv}
            >
              Add
            </Button>
          ) : (
            <LoadingButton loading loadingPosition="start" startIcon={<SaveIcon />} variant="outlined" sx={{ mt: 2 }}>
              Add
            </LoadingButton>
          )}
        </Box>
      </MModal>

      <MModal
        open={openFileModal}
        onClose={handleSelectFileClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <InputField
            id="outlined-basic"
            label="File Name"
            variant="outlined"
            fullWidth
            name="file_name"
            value={file_name}
            autoComplete="off"
            size="small"
            onChange={(event) => setfile_name(event.target.value)}
          />
          <br />
          <br />
          <Button
            variant="outlined"
            size="small"
            style={{ color: 'grey' }}
            // onClick={handleFileUpload}
          >
            Click to upload
          </Button>
          {/* {file ? (
            <div>
              <span> File Name: {file.name} </span>
            </div>
          ) : (
            <span style={{ marginLeft: 10 }}>No file selected</span>
          )} */}
          {isJsonFile && (
            <InputField
              id="outlined-basic"
              label="Delimiter"
              variant="outlined"
              fullWidth
              name="delimiter"
              value={delimiter}
              autoComplete="off"
              size="small"
              onChange={(event) => setDelimiter(event.target.value)}
            />
          )}
          <br />

          {!loadBtn ? (
            <Button
              variant="contained"
              sx={{ mt: 2 }}
              color="secondary"
              type="submit"
              className="button-color"
              onClick={handleAddCsv}
            >
              Submit
            </Button>
          ) : (
            <LoadingButton loading loadingPosition="start" startIcon={<SaveIcon />} variant="outlined" sx={{ mt: 2 }}>
              Submit
            </LoadingButton>
          )}
        </Box>
      </MModal>

      <MModal
        open={openS3PathModal}
        onClose={handleS3PathModalClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <InputField
            id="outlined-basic"
            label="Bucket name"
            variant="outlined"
            fullWidth
            name="bucket_name"
            value={bucket_name}
            autoComplete="off"
            size="small"
            helperText="Enter Bucket name of s3 Path"
            onChange={(event) => setbucket_name(event.target.value)}
          />
          <InputField
            id="outlined-basic"
            label="S3 Path"
            variant="outlined"
            fullWidth
            name="s3 Path"
            value={S3Path}
            autoComplete="off"
            size="small"
            helperText="Enter s3 path "
            onChange={(event) => setS3Path(event.target.value)}
          />
          {!loadBtn ? (
            <Button
              variant="contained"
              sx={{ mt: 2 }}
              color="secondary"
              type="submit"
              className="button-color"
              onClick={handleAdds3Path}
            >
              Add
            </Button>
          ) : (
            <LoadingButton loading loadingPosition="start" startIcon={<SaveIcon />} variant="outlined" sx={{ mt: 2 }}>
              Add
            </LoadingButton>
          )}
        </Box>
      </MModal>
      <Modal
        title={`${tableNameModal} Rule Engine Execution`}
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        centered
        maskClosable
      >
        <Form form={form} labelCol={{ span: 6 }} wrapperCol={{ span: 22 }} layout="horizontal" onFinish={onFinish}>
          <Form.Item
            name="Folders"
            label="TimeStamp"
            rules={[
              {
                required: true,
                message: 'Please select folder!',
              },
            ]}
          >
            <Select onChange={getAllFiles}>
              {FoldersData &&
                FoldersData.map((ele, idx) => {
                  return (
                    <Option key={idx} value={ele.value}>
                      {ele.label}
                    </Option>
                  );
                })}
            </Select>
          </Form.Item>

          {/* <Form.Item
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
          </Form.Item> */}
          <Form.Item style={{ marginLeft: '40%' }}>
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default TableRuleNew;
