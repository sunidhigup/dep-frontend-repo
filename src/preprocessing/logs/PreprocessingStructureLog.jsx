import { Breadcrumbs, Link, Paper, Table, TableBody, TableContainer, TableRow, Typography } from '@mui/material';
import { Box } from '@mui/system';
import { styled } from '@mui/material/styles';
import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { BatchContext } from '../../context/BatchProvider';
import { JobContext } from '../../context/JobProvider';
import LoadingIcon from '../../reusable-components/LoadingIcon';
import { getPreprocessStructureLogEventApi } from "../../api's/LogsApi";

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

  
  const PreprocessingStructureLog = () => {
    const [logStream, setLogStream] = useState([]);
  const [loadBtn, setLoadBtn] = useState(false);
  const navigate = useNavigate();
  const params = useParams();
  
  const getLogs = async () => {
    setLoadBtn(true);
    const jobtype="preprocessor";
    console.log(params.logstream);

    const response = await getPreprocessStructureLogEventApi(params.logstream.split("_pdf")[0]);

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
    return (
        <>
        <Paper elevation={1} sx={{ padding: '10px', mb: 3 }}>
        <div role="presentation">
          <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} aria-label="breadcrumb">
            {/* <a role="button" tabIndex="0" onClick={redirectHome} onKeyDown={redirectHome} style={{ cursor: 'pointer' }}>
              {batch.batch_name}
            </a> */}
            <a
              role="button"
              tabIndex="0"
            //   onClick={redirectTableRule}
            //   onKeyDown={redirectTableRule}
              style={{ cursor: 'pointer' }}
            >
              Rule Engine
            </a>
            <a
              role="button"
              tabIndex="0"
              onClick={() => navigate(-1)}
              style={{ cursor: 'pointer' }}
              onKeyDown={() => navigate(-1)}
            >
              {params.tablename}
            </a>
            <span>{params.logstream}</span>
          </Breadcrumbs>
        </div>
      </Paper>
      <Paper elevation={1}>
      <Box
        sx={{
          backgroundColor: '#fff',
          borderRadius: '10px',
        }}
      >
        {loadBtn && (
          <Box>
            <LoadingIcon />
          </Box>
        )}
        {!loadBtn && logStream.length === 0 ? (
          <h3> No Logs Found.</h3>
        ) : (
          <>
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
    </Paper>
    </>
    )
  }
  
  export default PreprocessingStructureLog