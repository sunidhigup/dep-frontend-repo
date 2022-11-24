// import { makeStyles } from '@mui/styles';
// import { Box } from '@mui/system';
// import React, { useContext, useEffect, useState } from 'react';
// import { Link, useNavigate, useParams } from 'react-router-dom';

// import TableBody from '@mui/material/TableBody';
// import Paper from '@mui/material/Paper';
// import { Breadcrumbs, Table, TableContainer, TableHead, TableRow } from '@mui/material';
// import ArrowCircleRightIcon from '@mui/icons-material/ArrowCircleRight';
// import TableCell, { tableCellClasses } from '@mui/material/TableCell';
// import { styled } from '@mui/material/styles';

// import { BatchContext } from '../../context/BatchProvider';
// import { JobContext } from '../../context/JobProvider';

// import LoadingIcon from '../../reusable-components/LoadingIcon';
// import { getFlowBuilderEmrLogListApi, getFlowBuilderLogStreamApi } from "../../api's/LogsApi";

// const StyledTableCell = styled(TableCell)(({ theme }) => ({
//   [`&.${tableCellClasses.head}`]: {
//     backgroundColor: theme.palette.common.black,
//     // backgroundColor: theme.palette.common.red,
//     color: theme.palette.common.white,
//     // color: theme.palette.common.red,
//   },
//   [`&.${tableCellClasses.body}`]: {
//     fontSize: 14,
//   },
// }));

// const StyledTableRow = styled(TableRow)(({ theme }) => ({
//   '&:nth-of-type(odd)': {
//     backgroundColor: theme.palette.action.hover,
//   },
//   // hide last border
//   '&:last-child td, &:last-child th': {
//     border: 0,
//   },
// }));

// const useStyles = makeStyles({
//   rightComponent: {
//     flex: 4,
//     overflowY: 'scroll',
//     backgroundColor: '#e9ecef !important',
//     maxHeight: '88vh',
//     minHeight: '88vh',
//     marginTop: '10px',
//     marginRight: '10px',
//     marginLeft: '10px',
//     borderRadius: '10px',
//     '&::-webkit-scrollbar': {
//       width: '0.4em',
//     },
//     '&::-webkit-scrollbar-track': {
//       '-webkit-box-shadow': 'inset 0 0 6px rgba(0,0,0,0.00)',
//       borderRadius: '10px',
//     },
//     '&::-webkit-scrollbar-thumb': {
//       backgroundColor: '#c1d3fe',
//       borderRadius: '10px',
//     },
//     // ['@media (max-width:780px)']: {
//     //   margin: '15px',
//     // },
//   },
// });

// const EmrLogs = () => {
//   const classes = useStyles();

//   const { batch } = useContext(BatchContext);
//   const { Job } = useContext(JobContext);
//   const [emrLogList, setEmrLogList] = useState([]);
//   const [loadIcon, setLoadIcon] = useState(false);

//   const params = useParams();

//   const getLogs = async () => {
//     setLoadIcon(true);
//     const response = await getFlowBuilderEmrLogListApi(batch.batch_name, Job);

//     if(response.status === 200){
//       setEmrLogList(response.data)
//     }

//     // if (response1.status === 204) {
//     //   setEmrLogList([]);
//     // } else {
//     //   const response2 = await getFlowBuilderLogStreamApi(batch.batch_name);

//     //   const array1 = response1.data;
//     //   const array2 = [];

//     //   response2.data.forEach((ele, ls_idx) => {
//     //     const ar2 = ele.split('~');
//     //     array2.push({ label: ar2[0], value: ele, timestamp: ar2[1] });
//     //   });

//     //   const array3 = [];

//     //   array2.forEach((ele2) => {
//     //     array1.forEach((ele1) => {
//     //       array3.push([ele2].concat(ele1));
//     //     });
//     //   });

//     //   setEmrLogList(array3.reverse());
//     // }
//     setLoadIcon(false);
//   };

//   useEffect(() => {
//     getLogs();

//     return () => {
//       setEmrLogList();
//     };
//   }, []);

//   const navigate = useNavigate();
//   const handleMouseEnter = (e) => {
//     e.target.style.color = 'blue';
//   };
//   const handleMouseLeave = (e) => {
//     e.target.style.color = 'black';
//   };

//   return (
//     <Box>
//       <Link to={`/flow-builder`} style={{ textDecoration: 'none' }}>
//         <p
//           style={{
//             cursor: 'pointer',
//             fontWeight: 'bold',
//             color: 'black',
//             fontSize: 18,
//           }}
//         >
//           {batch.batch_name}
//         </p>
//       </Link>

//       <Box sx={{ m: 2, backgroundColor: '#fff', borderRadius: '10px', p: 2 }}>
//         {loadIcon && (
//           <Box>
//             <LoadingIcon />
//           </Box>
//         )}

//         {emrLogList.length === 0 && !loadIcon ? (
//           <h3> No Logs Found.</h3>
//         ) : (
//           <>
//             <TableContainer component={Paper}>
//               <Table sx={{ minWidth: 700 }} aria-label="customized table">
//                 <TableHead>
//                   <TableRow>
//                     <StyledTableCell>S.NO</StyledTableCell>
//                     <StyledTableCell align="left">Batch_name</StyledTableCell>
//                     <StyledTableCell align="left">Cluster_id</StyledTableCell>
//                     <StyledTableCell align="left">Status</StyledTableCell>
//                     <StyledTableCell align="left">Explore</StyledTableCell>
//                   </TableRow>
//                 </TableHead>
//                 <TableBody>
//                   {emrLogList &&
//                     emrLogList.map((elem, eidx) => (
//                       <StyledTableRow key={eidx}>
//                         <StyledTableCell component="th" scope="row">
//                           {eidx + 1}
//                         </StyledTableCell>
//                         <StyledTableCell align="left">{elem[0].label}</StyledTableCell>
//                         <StyledTableCell align="left">{elem[1].cluster_id}</StyledTableCell>
//                         <StyledTableCell align="left">{elem[0].timestamp}</StyledTableCell>
//                         {elem[1].status === 'RUNNING' && (
//                           <StyledTableCell align="left" color="green">
//                             <span style={{ color: 'green' }}>{elem[1].status}</span>
//                           </StyledTableCell>
//                         )}
//                         {elem[1].status === 'STOPPED' && (
//                           <StyledTableCell align="left" color="red !important">
//                             <span style={{ color: 'red' }}>{elem[1].status}</span>
//                           </StyledTableCell>
//                         )}

//                         <Link
//                           to={`/flow-builder/logs/emr-logs/${batch.batch_name}/${Job}/${elem[1].cluster_id}`}
//                           style={{ textDecoration: 'none' }}
//                         >
//                           <StyledTableCell onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} align="left">
//                             <ArrowCircleRightIcon />
//                           </StyledTableCell>
//                         </Link>
//                       </StyledTableRow>
//                     ))}

//                   {emrLogList && emrLogList.map((elem, eidx) => (
//                     <StyledTableRow key={eidx}>
//                       <StyledTableCell component="th" scope="row">
//                         {eidx + 1}
//                       </StyledTableCell>
//                       <StyledTableCell align="left">{batch.batch_name}</StyledTableCell>
//                       <StyledTableCell align="left">{elem.cluster_id}</StyledTableCell>
//                       {/* <StyledTableCell align="left"></StyledTableCell> */}
//                       <StyledTableCell align="left">{elem.status}</StyledTableCell>
//                       <Link to={`/flow-builder/logs/emr-logs/${batch}/${Job}/${elem.cluster_id}`} style={{ textDecoration: 'none' }}>
//                         <StyledTableCell onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} align="left"><ArrowCircleRightIcon /></StyledTableCell>
//                       </Link>

//                     </StyledTableRow>
//                   ))}
//                 </TableBody>
//               </Table>
//             </TableContainer>
//           </>
//         )}
//       </Box>
//     </Box>
//   );
// };

// export default EmrLogs;


import React, { useContext, useEffect, useState } from 'react';
import { Breadcrumbs } from '@mui/material';
import { Box } from '@mui/system';
import { Link, useNavigate, useParams } from 'react-router-dom';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import 'antd/dist/antd.css';
import { ArrowRightOutlined } from '@ant-design/icons';
import { Space, Table, Typography, Button } from 'antd';
import LoadingIcon from '../../reusable-components/LoadingIcon';
import { JobContext } from '../../context/JobProvider';
import { BatchContext } from '../../context/BatchProvider';

import { getFlowBuilderEmrLogListApi } from "../../api's/LogsApi";

const EmrLogs = () => {
  const { batch } = useContext(BatchContext);
  const { Job } = useContext(JobContext);
  const [emrLogList, setEmrLogList] = useState([]);
  const [loadIcon, setLoadIcon] = useState(false);
  const [loading, setloading] = useState(true);

  const params = useParams();

  const getLogs = async () => {
    setloading(true);
    const response = await getFlowBuilderEmrLogListApi(batch.batch_name, Job);

    if (response.status === 200) {
      setEmrLogList(response.data)
    }
    setloading(false)
  };


  useEffect(() => {
    getLogs();

    return () => {
      setEmrLogList();
    };
  }, []);

  const navigate = useNavigate();

  const columns = [
    {
      title: 'Batch Name',
      dataIndex: 'batch_name',
      align: 'center',
      width: '45%',
      render(text, record) {
        return {
          props: {

          },
          children: <div>{batch.batch_name}</div>,
        };
      },
    },
    {
      title: 'Cluster Id',
      dataIndex: 'cluster_id',
      align: 'center',
      width: '25%',

    },
    {
      title: 'Status',
      dataIndex: 'status',
      align: 'center',
      width: '20%',
    },
    {
      title: 'Detailed Logs',
      key: 'action',
      align: 'center',
      render: (_, record) => (
        <Space size="middle">
          <Typography.Link
            onClick={() => {
              navigate(
                `/flow-builder/logs/emr-logs/${batch.batch_name}/${Job}/${record.cluster_id}`
              );
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
              />
             
          </Typography.Link>
        </Space>
      ),
    },
  ];

  const tableColumns = columns.map((item) => ({ ...item }));

  return (
    <Box sx={{ backgroundColor: '#fff', borderRadius: '10px', p: 2 }}>
      <Breadcrumbs
        separator={<NavigateNextIcon fontSize="small" style={{ marginBottom: '15px' }} />}
        aria-label="breadcrumb"
      >
        <Link to={`/flow-builder`} style={{ textDecoration: 'none' }}>
          <p style={{ cursor: 'pointer' }}>{batch.batch_name}</p>
        </Link>

        <p style={{ color: '#6c757d' }}>{Job}</p>
      </Breadcrumbs>
      {loading && (
        <Box>
          <LoadingIcon />
        </Box>
      )}

      {!loading && (
        <>
          {emrLogList && emrLogList.length === 0 ? (
            <h3 style={{ margin: '20px 0' }}> No Logs Found.</h3>
          ) : (
            <div style={{ marginTop: 10, border: '2px solid black' }}>
              <Table
                rowClassName={(record, index) => (index % 2 === 0 ? 'table-row-light' : 'table-row-light')}
                bordered="true"
                pagination={{
                  position: ['bottomCenter'],
                  defaultPageSize: 5,
                }}
                columns={tableColumns}
                dataSource={emrLogList}
                style={{ maxWidth: '800px !important' }}
              />
            </div>
          )}
        </>
      )}
    </Box>
  );
};

export default EmrLogs;

