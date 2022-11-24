import { useSnackbar } from 'notistack';
import React, { useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import { alpha, styled, useTheme } from '@mui/material/styles';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import LastPageIcon from '@mui/icons-material/LastPage';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableFooter from '@mui/material/TableFooter';
import TablePagination from '@mui/material/TablePagination';
import InputBase from '@mui/material/InputBase';
import { BulbFilled, BulbOutlined, SearchOutlined, SyncOutlined } from '@ant-design/icons';
import { Popconfirm } from 'antd';

import {
  TextField,
  Autocomplete,
  Paper,
  Button,
  Box,
  IconButton,
  TableSortLabel,
  Modal,
  Typography,
  Stack,
  Tooltip,
  Menu,
  MenuItem,
  ListItem,
  Chip,
} from '@mui/material';
import { BatchContext } from '../context/BatchProvider';
import { ClientContext } from '../context/ClientProvider';
import { JobListContext } from '../context/JobListProvider';
import { fetchPreprocessApi } from "../api's/PreprocessApi";
import LoadingIcon from '../reusable-components/LoadingIcon';
import PreprocessTableRow from './PreprocessTableRow';
import HeadOptions from '../pages/HeadOptions';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: '#003566',
    color: '#0dd398',
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
    border: '1px solid',
  },
}));

function TablePaginationActions(props) {
  const theme = useTheme();
  const { count, page, rowsPerPage, onPageChange } = props;

  const handleFirstPageButtonClick = (event) => {
    onPageChange(event, 0);
  };

  const handleBackButtonClick = (event) => {
    onPageChange(event, page - 1);
  };

  const handleNextButtonClick = (event) => {
    onPageChange(event, page + 1);
  };

  const handleLastPageButtonClick = (event) => {
    onPageChange(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));
  };

  return (
    <Box sx={{ flexShrink: 0, ml: 2.5 }}>
      <IconButton onClick={handleFirstPageButtonClick} disabled={page === 0} aria-label="first page">
        {theme.direction === 'rtl' ? <LastPageIcon /> : <FirstPageIcon />}
      </IconButton>
      <IconButton onClick={handleBackButtonClick} disabled={page === 0} aria-label="previous page">
        {theme.direction === 'rtl' ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
      </IconButton>
      <IconButton
        onClick={handleNextButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="next page"
      >
        {theme.direction === 'rtl' ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
      </IconButton>
      <IconButton
        onClick={handleLastPageButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="last page"
      >
        {theme.direction === 'rtl' ? <FirstPageIcon /> : <LastPageIcon />}
      </IconButton>
    </Box>
  );
}

const Preprocessing = () => {
  const { enqueueSnackbar } = useSnackbar();
  const { batch } = useContext(BatchContext);
  const { client } = useContext(ClientContext);

  const [fetchedPreprocess, setFetchedPreprocess] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [loading, setLoading] = useState();

  const [batchDisable, setBatchdisable] = useState(true);
  const [buttonDisable, setButtondisable] = useState(true);
  const [status_loading, setStatus_Loading] = useState(true);
  const [CompletedStatus, setCompletedStatus] = useState(0);
  const [ProgressStatus, setProgressStatus] = useState(0);
  const [FailedStatus, setFailedStatus] = useState(0);
  const [UnknownStatus, setUnknownStatus] = useState(0);
  const [visible, setVisible] = useState(false);
  const [chipData, setChipData] = useState([]);
  const [statusCountJob, setstatusCountJob] = useState(0);

  const countItem = (fetchStatus) => {
    if (fetchStatus) {
      setstatusCountJob((statusCountJob) => statusCountJob + 1);
    }
  };

  const handleCancel = () => {
    setProgressStatus(0);
    setCompletedStatus(0);
    setFailedStatus(0);
    setUnknownStatus(0);
    setVisible(false);
  };

  const content = (
    <div>
      <p>Completed = {CompletedStatus}</p>
      <p>Progress = {ProgressStatus}</p>
      <p>Failed = {FailedStatus}</p>
      <p>Unknown = {UnknownStatus}</p>
    </div>
  );

  const fetchJob = async () => {
    setLoading(true);
    try {
      const response = await fetchPreprocessApi(client.client_name, batch.batch_name);
      setFetchedPreprocess(response.data);
    } catch (error) {
      setFetchedPreprocess([]);

      if (error.response.status === 404) {
        enqueueSnackbar('No tables found!', {
          variant: 'warning',
          autoHideDuration: 3000,
          anchorOrigin: { vertical: 'top', horizontal: 'right' },
        });
      }
    }
    setLoading(false);
  };

  const showPopconfirm = async () => {
    setStatus_Loading(false);
    const obj = {
      UnknownStatus: 0,
      ProgressStatus: 0,
      FailedStatus: 0,
      CompletedStatus: 0,
    };
    const promises = [];

    const fetch_status = await Promise.all(promises);
    fetch_status.map((ele) => {
      if (ele === 'Completed') {
        obj.CompletedStatus += 1;
      } else if (ele === 'Runnung') {
        obj.ProgressStatus += 1;
      } else if (ele === 'Failed') {
        obj.FailedStatus += 1;
      } else {
        obj.UnknownStatus += 1;
      }
    });

    setUnknownStatus(obj.UnknownStatus);
    setFailedStatus(obj.FailedStatus);
    setProgressStatus(obj.ProgressStatus);
    setCompletedStatus(obj.CompletedStatus);
    setStatus_Loading(true);
    setVisible(true);
  };

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - fetchedPreprocess.length) : 0;

  return (
    <>
      <HeadOptions fetchJob={fetchJob} />

      <TableContainer component={Paper} sx={{ border: '1px solid' }}>
        <Table sx={{ minWidth: 700 }} aria-label="customized table">
          <TableHead>
            <TableRow>
              <StyledTableCell align="center">Job Name</StyledTableCell>
              <StyledTableCell align="center">Extension</StyledTableCell>
              <StyledTableCell align="center">Actions</StyledTableCell>
              <StyledTableCell align="left">Skip Preprocess</StyledTableCell>

              <StyledTableCell align="center">
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'left', justifyContent: 'center' }}>
                  <div>Status</div>
                  <span>
                    {!status_loading && (
                      <Box>
                        <SyncOutlined spin style={{ color: 'yellow', marginLeft: 10 }} />
                      </Box>
                    )}
                    {status_loading && (
                      <Popconfirm
                        title={content}
                        visible={visible}
                        onCancel={handleCancel}
                        onConfirm={handleCancel}
                        showCancel="false"
                        cancelText="close"
                      >
                        <Button shape="circle" onClick={showPopconfirm}>
                          <BulbFilled style={{ color: 'yellow', marginLeft: 10 }} />
                        </Button>
                      </Popconfirm>
                    )}
                  </span>
                </div>
              </StyledTableCell>
            </TableRow>
          </TableHead>
          {loading && (
            <Box>
              <LoadingIcon />
            </Box>
          )}
          <TableBody>
            {fetchedPreprocess.length > 0 &&
              fetchedPreprocess.map((el, i) => {
                return <PreprocessTableRow key={i} source={el} chipData={chipData} countItem={countItem} />;
              })}
            {emptyRows > 0 && (
              <TableRow style={{ height: 53 * emptyRows }}>
                <TableCell colSpan={6} />
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export default Preprocessing;
