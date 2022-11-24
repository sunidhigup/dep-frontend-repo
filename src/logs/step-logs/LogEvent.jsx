import { Breadcrumbs, Link, Paper, Table, TableBody, TableContainer, TableRow, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Box } from '@mui/system';
import { styled } from '@mui/material/styles';
import axios from 'axios';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import BASEURL from '../../BaseUrl';
import { BatchContext } from '../../context/BatchProvider';
import LoadingIcon from '../../reusable-components/LoadingIcon';
import { JobContext } from '../../context/JobProvider';
import { getFlowBuilderLogEventApi } from "../../api's/LogsApi";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  // hide last border
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}));

const useStyles = makeStyles({
  rightComponent: {
    flex: 4,
    overflowY: 'scroll',
    backgroundColor: '#e9ecef !important',
    maxHeight: '88vh',
    minHeight: '88vh',
    marginTop: '10px',
    marginRight: '10px',
    marginLeft: '10px',
    borderRadius: '10px',
    '&::-webkit-scrollbar': {
      width: '0.4em',
    },
    '&::-webkit-scrollbar-track': {
      '-webkit-box-shadow': 'inset 0 0 6px rgba(0,0,0,0.00)',
      borderRadius: '10px',
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: '#0dd398',
      borderRadius: '10px',
    },
  },
});

const LogEvent = () => {
  const classes = useStyles();
  const { batch } = useContext(BatchContext);
  const { Job } = useContext(JobContext);
  const [logStream, setLogStream] = useState();

  const params = useParams();

  const getLogs = async (job) => {
    const response = await getFlowBuilderLogEventApi(params.log_stream_name);

    const arr = response.data;

    const newj = arr.map((el) => {
      return JSON.parse(el);
    });

    const newJSON = newj.map((el) => {
      const arr1 = el.log_msg;
      const finalData = JSON.parse(arr1);
      el.log_msg = finalData;
      return el;
    });

    setLogStream(newJSON);
  };

  useEffect(() => {
    getLogs();

    return () => {
      setLogStream();
    };
  }, []);

  const navigate = useNavigate();

  function handleClick(event) {
    event.preventDefault();

    navigate(`/flow-builder/logs/step-logs/${batch.batch_name}`);
  }

  const handleMouseEnter = (e) => {
    e.target.style.color = 'blue';
  };
  const handleMouseLeave = (e) => {
    e.target.style.color = 'black';
  };

  return (
    <Box>
      <Box
        sx={{
          m: 2,
          backgroundColor: '#fff',
          borderRadius: '10px',
          p: 2,
        }}
      >
        {!logStream ? (
          <Box>
            <LoadingIcon />
          </Box>
        ) : logStream.length === 0 ? (
          <h3> No Logs Found.</h3>
        ) : (
          <>
            <div role="presentation">
              <Breadcrumbs aria-label="breadcrumb">
                <Link
                  underline="hover"
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                  onClick={handleClick}
                  style={{ cursor: 'pointer' }}
                >
                  <h3>
                    {batch.batch_name}({Job})
                  </h3>
                </Link>
                {/* <Typography>{params.logstream}</Typography> */}
              </Breadcrumbs>
              {/* <Typography>{params.status}</Typography> */}
            </div>
            <br />
            <TableContainer component={Paper}>
              <Table aria-label="customized table">
                <TableBody>
                  {logStream.map((row, ii) => {
                    return (
                      <StyledTableRow key={ii}>
                        <StyledTableCell onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} align="left">
                          <p>&#123;&emsp;</p>
                          {Object.entries(row).map(([key, value], i) => {
                            return key === 'log_msg' ? (
                              <>
                                <p key={i}>&emsp;{key} :</p>
                                <p>&emsp;&emsp;&#123;</p>

                                {/* {value} */}
                                {Object.entries(value).map(([key1, value1], idx) => {
                                  return (
                                    <p key={idx}>
                                      &emsp;&emsp;&emsp;{key1} : {value1}
                                    </p>
                                  );
                                })}

                                <p>&emsp;&emsp;&#125;</p>
                              </>
                            ) : (
                              <p key={i}>
                                &emsp;{key} : {value}
                              </p>
                            );
                          })}
                          <p>&#125;</p>
                        </StyledTableCell>
                      </StyledTableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
      </Box>
    </Box>
  );
};

export default LogEvent;
