import { Breadcrumbs, TableContainer, TableHead, TableRow } from '@mui/material';
import { Box } from '@mui/system';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import Paper from '@mui/material/Paper';
import 'antd/dist/antd.css';
import { Space, Table, Typography, Button, Tooltip } from 'antd';
import { ArrowRightOutlined, LoadingOutlined, PlayCircleFilled } from '@ant-design/icons';
import { styled } from '@mui/material/styles';
import { useSnackbar } from 'notistack';
import ArrowCircleRightIcon from '@mui/icons-material/ArrowCircleRight';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import LoadingIcon from '../../reusable-components/LoadingIcon';
import { HomeTabContext } from '../../context/HomeTabProvider';
import { RuleEngineTabContext } from '../../context/RuleEngineTabProvider';
import { BatchContext } from '../../context/BatchProvider';
import { ClientContext } from '../../context/ClientProvider';
import { getRuleEngineLogStreamApi, getRuleEngineLogStreamApiStatus } from "../../api's/LogsApi";
import { createBatchidApi, fetchBatchidApi } from "../../api's/BatchApi";
import { executeRuleEngine } from "../../api's/TableRuleApi";

const RuleEngineLogStream = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { batch } = useContext(BatchContext);
  const { client } = useContext(ClientContext);
  const { setValue } = useContext(RuleEngineTabContext);
  const { setHomeValue } = useContext(HomeTabContext);
  const [logStream, setLogStream] = useState([]);
  const [loadBtn, setLoadBtn] = useState(false);
  const [openLoadingModal, setOpenLoadingModal] = useState(false);

  const params = useParams();

  const handleLoadingModalOpen = useCallback(() => setOpenLoadingModal(true), []);

  const handleLoadingModalClose = useCallback(() => setOpenLoadingModal(false), []);

  const getEachLogStreamStatus = async (execution_id, timestamp, log_stream_name) => {
    try {
      const result = await getRuleEngineLogStreamApiStatus(execution_id);
      const data = {
        status: result.data.status,
        timestamp,
        log_stream_name,
      };
      return data;
    } catch (error) {
      const data = {
        status: 'unknown',
        timestamp,
        log_stream_name,
      };
      return data;
    }
  };

  const getLogs = async () => {
    setLoadBtn(true);
    // const prefix = client.client_name + "_" + batch.batch + "_" + params.tablename;
    const prefix = `${client.client_name}_${batch.batch_name}_${params.tablename}`;
    const response = await getRuleEngineLogStreamApi(prefix.replaceAll(' ', ''));

    // if (response) {
    //   console.log(response.data)
    //   setLogStream(response.data);
    // }
    const data = response.data;
    const array = [];
    data.forEach((ele) => {
      if (ele.timestamp) {
        const log_stream_name = ele.log_stream_name;
        if (log_stream_name.indexOf('___') !== -1) {
          array.push({ timestamp: ele.timestamp, log_stream_name });
        }
      }
    });

    const promises = [];
    array.forEach((ele) => {
      const execution_id = ele.log_stream_name.split('___')[0];
      promises.push(getEachLogStreamStatus(execution_id, ele.timestamp, ele.log_stream_name));
    });

    const status = await Promise.all(promises);
    setLogStream(status);
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
    setValue(0);
    setHomeValue(0);
  };

  const redirectHome = () => {
    navigate(-1);
    setValue(0);
    setHomeValue(0);
  };

  const runRuleEngine = async (tablename, execution_Id) => {
    handleLoadingModalOpen();
    try {
      // const batch_table_id = `${client.client_name}_${batch.batch_name}_${tablename}_ruleEngine_${new Date().getTime()}`;
      const batch_table_id = `${execution_Id}`;

      const client_job = `${client.client_name}_${batch.batch_name}_${tablename}_ruleEngine`;

      const data = {
        client_job: client_job.replaceAll(' ', ''),
        batch_id: batch_table_id.replaceAll(' ', ''),
      };

      const res = await createBatchidApi(data);

      const input = {
        batch: batch.batch_name,
        execution_id: batch_table_id.replaceAll(' ', ''),
        client_id: client.client_id,
        batch_id: batch.batch_id,
        table_name: tablename,
        client_name: client.client_name,
      };

      const response = await executeRuleEngine(input);

      if (response.status === 200) {
        // record.disableRunNew = true
        // record.status = "In Progress"
        handleLoadingModalClose();
        enqueueSnackbar('Table Rule is running!', {
          variant: 'Success',
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
    handleLoadingModalClose();
  };

  const runButtonClick = async (record) => {
    console.log(record);
    const logStream_split = record.log_stream_name.split('___');
    const new_execution_id = logStream_split[0];

    await runRuleEngine(params.tablename, new_execution_id);
  };

  const columns = [
    {
      title: 'Stream Name',
      dataIndex: 'log_stream_name',
      align: 'center',
      width: '15vw',
    },
    {
      title: 'Timestamp',
      dataIndex: 'timestamp',
      align: 'center',
      width: '25vw',
    },
    // {
    //   title: 'Run',
    //   dataIndex: 'run',
    //   align: 'center',
    //   width: '5vw',
    //   render: (_, record) => (
    //     <Space size="middle">
    //       {
    //         <Typography.Link
    //           onClick={() => {
    //             runButtonClick(record);
    //           }}
    //           style={{ marginRight: 8, color: 'red' }}
    //         >
    //           <Tooltip title="Run">
    //             <Button
    //               shape="circle"
    //               icon={<PlayCircleFilled style={{ color: 'green', fontSize: 'medium' }} />}
    //               size="medium"
    //             />
    //           </Tooltip>
    //         </Typography.Link>
    //       }
    //     </Space>
    //   ),
    // },
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
              color:
                (text === 'Completed' && 'green') ||
                (text === 'Failed' && 'red') ||
                (text === 'Runnung' && 'blue') ||
                'orange',
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
      render: (_, record) => (
        <Space size="middle">
          <Typography.Link
            onClick={() => {
              navigate(`/rule-engine/logs/${params.tablename}/${record.log_stream_name}`);
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
              Detailed Logs
            </Button>
          </Typography.Link>
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
              Rule Engine
            </a>

            <span style={{ color: '#6c757d' }}>{params.tablename}</span>
          </Breadcrumbs>
        </Box>
      </Paper>

      <Paper elevation={1}>
        {loadBtn && <LoadingIcon />}
        {!loadBtn && logStream.length === 0 && <h3 style={{ margin: '20px 0' }}> No Logs Found.</h3>}

        {logStream.length > 0 && (
          // <TableContainer component={Paper}>
          //   <Table sx={{ minWidth: 700 }} aria-label="customized table">
          //     <TableHead>
          //       <TableRow>
          //         <StyledTableCell>S.NO</StyledTableCell>
          //         <StyledTableCell align="left">TimeStamp</StyledTableCell>
          //         <StyledTableCell align="left">Action</StyledTableCell>
          //       </TableRow>
          //     </TableHead>
          //     <TableBody>
          //       {logStream &&
          //         logStream.map((log, lidx) => (
          //           <StyledTableRow key={lidx}>
          //             <StyledTableCell component="th" scope="row">
          //               {lidx + 1}
          //             </StyledTableCell>
          //             <StyledTableCell align="left">
          //               {log.timestamp}
          //               <span style={{ fontWeight: '800' }}>{lidx === 0 && ' (Latest)'}</span>
          //               &emsp; &emsp;
          //               <span>
          //                 {log.status === 'Completed' && (
          //                   <span
          //                     style={{
          //                       color: 'green',
          //                     }}
          //                   >
          //                     <CheckCircleOutlineIcon style={{ fontSize: '18px' }} /> &nbsp;
          //                     {log.status}
          //                   </span>
          //                 )}
          //                 {log.status === 'Running' && (
          //                   <span
          //                     style={{
          //                       color: '#ffc300',
          //                     }}
          //                   >
          //                     <AccessTimeIcon style={{ fontSize: '18px' }} /> &nbsp; {log.status}
          //                   </span>
          //                 )}

          //                 {log.status === 'Failed' && (
          //                   <span
          //                     style={{
          //                       color: 'red',
          //                     }}
          //                   >
          //                     <CancelIcon style={{ fontSize: '18px' }} /> &nbsp;
          //                     {log.status}
          //                   </span>
          //                 )}

          //                 {log.status === 'In Progress' && (
          //                   <span
          //                     style={{
          //                       color: '#98c1d9',
          //                     }}
          //                   >
          //                     <PendingIcon style={{ fontSize: '18px' }} /> &nbsp;
          //                     {log.status}
          //                   </span>
          //                 )}
          //               </span>
          //             </StyledTableCell>
          //             <Link
          //               to={`/rule-engine/logs/${params.tablename}/${log.logstream}`}
          //               style={{ textDecoration: 'none' }}
          //             >
          //               <StyledTableCell onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} align="left">
          //                 <ArrowCircleRightIcon />
          //               </StyledTableCell>
          //             </Link>
          //           </StyledTableRow>
          //         ))}
          //     </TableBody>
          //   </Table>
          // </TableContainer>
          <div style={{ marginTop: 10, border: '2px solid black' }}>
            <Table
              rowClassName={(record, index) => (index % 2 === 0 ? 'table-row-light' : 'table-row-light')}
              bordered="true"
              pagination={{
                position: ['bottomCenter'],
                defaultPageSize: 5,
              }}
              columns={tableColumns}
              dataSource={logStream}
            />
          </div>
        )}
      </Paper>
    </>
  );
};

export default RuleEngineLogStream;
