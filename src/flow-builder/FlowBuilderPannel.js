import React, { useContext, useEffect, useState, useCallback } from 'react';
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
import Paper from '@mui/material/Paper';
import TableFooter from '@mui/material/TableFooter';
import TablePagination from '@mui/material/TablePagination';
// import { Table } from 'antd';
import InputBase from '@mui/material/InputBase';
import {
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
  Chip,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { SyncOutlined } from '@ant-design/icons';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import { useSnackbar } from 'notistack';
import axios from 'axios';
import { AuthContext } from '../context/AuthProvider';
import HeadOptions from '../pages/HeadOptions';
import JobsTableRow from './JobsTableRow';

import { BatchContext } from '../context/BatchProvider';
import { ClientContext } from '../context/ClientProvider';
import { fetchJobsAndStatusApi } from "../api's/JobApi";
import { JobListContext } from '../context/JobListProvider';
import LoadingIcon from '../reusable-components/LoadingIcon';
import BASEURL from '../BaseUrl';
import { runWholeBatchApi, fetchBatchidApi, getStepfunctionStatusApi } from "../api's/BatchApi";

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

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  border: '1px solid',
  borderRadius: '5px',

  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '20ch',
    },
  },
}));

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

TablePaginationActions.propTypes = {
  count: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  page: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
};

function descendingComparator(a, b, orderBy) {
  // console.log(a, b, orderBy)
  if (orderBy === 'job_name') {
    const x = a.input_ref_key.toLowerCase();
    const y = b.input_ref_key.toLowerCase();
    if (x < y) {
      return -1;
    }
    if (x > y) {
      return 1;
    }
  } else {
    if (b[orderBy] < a[orderBy]) {
      return -1;
    }
    if (b[orderBy] > a[orderBy]) {
      return 1;
    }
    return 0;
  }
}

const headCells = [
  {
    id: 'job_name',
    numeric: true,
    disablePadding: false,
    label: ' Job Name',
  },
  {
    id: 'action',
    numeric: true,
    disablePadding: false,
    label: 'Action ',
  },
  {
    id: 'status',
    numeric: true,
    disablePadding: false,
    label: 'Status',
  },
];

function EnhancedTableHead(props) {
  const { order, orderBy, onRequestSort } = props;
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align="center"
            padding={headCell.disablePadding ? 'none' : 'normal'}
            sortDirection={orderBy === 'job_name' ? order : false}
            style={{ backgroundColor: 'black', color: 'white' }}
          >
            <TableSortLabel
              // active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : 'asc'}
              onClick={createSortHandler(headCell.id)}
              style={{ backgroundColor: 'black', color: 'white' }}
              hideSortIcon="true"
            >
              <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                <Box component="span">{headCell.label}</Box>
                {headCell.id === 'job_name' ? (
                  <Box component="span">
                    {orderBy === 'job_name' && order === 'desc' ? (
                      <ArrowUpwardIcon fontSize="small" color="success" />
                    ) : (
                      <ArrowDownwardIcon fontSize="small" color="error" />
                    )}
                  </Box>
                ) : null}
              </div>
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

EnhancedTableHead.propTypes = {
  onRequestSort: PropTypes.func.isRequired,
  order: PropTypes.oneOf(['asc', 'desc']).isRequired,
  orderBy: PropTypes.string.isRequired,
};

const Dash = () => {
  const { enqueueSnackbar } = useSnackbar();
  const { batch } = useContext(BatchContext);
  const { client } = useContext(ClientContext);
  const { jobList, setJobList } = useContext(JobListContext);
  const { userRole } = useContext(AuthContext);
  const [batchId, setBatchId] = useState(false);
  const [openBatchIdModal, setOpenBatchIdModal] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState();
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [countStatus, setcountStatus] = useState(false);

  const [order, setOrder] = React.useState('asc');
  const [orderBy, setOrderBy] = React.useState('job_name');

  const [chipData, setChipData] = React.useState([]);
  const [chipEnable, setchipEnable] = useState(false);
  const [PrevCount, setPrevCount] = useState(0);

  const options = ['Running', 'Progress', 'Failed', 'Unknown'];

  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const [selectedIndex, setSelectedIndex] = React.useState(1);

  const [CompletedStatus, setCompletedStatus] = useState(0);
  const [ProgressStatus, setProgressStatus] = useState(0);
  const [FailedStatus, setFailedStatus] = useState(0);
  const [UnknownStatus, setUnknownStatus] = useState(0);
  const [statusCountJob, setstatusCountJob] = useState(0);

  const [status_loading, setStatus_Loading] = useState(true);
  const [visible, setVisible] = useState(false);

  const handleAddFilter = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const loadJobStatus = (status, execution_id) => {
    if (status === 'Completed') {
      return 'Completed';
    }
    if (status === 'Running') {
      return 'Running';
    }
    if (status === 'Failed') {
      return 'Failed';
    }
    if (status === 'Unknown') {
      return 'Unknown';
    }
    const time = execution_id.split('-')[1];
    const triggeredTime = new Date(time);
    const currentTime = new Date();

    const diffTime = currentTime - triggeredTime;

    const elapsedTime = Math.floor(diffTime / 60e3);

    if (elapsedTime < 5) {
      return 'Running';
    }
    return 'Failed';
  };

  const showPopconfirm = async () => {
    setStatus_Loading(false);
    const obj = {
      UnknownStatus: 0,
      ProgressStatus: 0,
      FailedStatus: 0,
      CompletedStatus: 0,
    };
    const fetch_status = [];

    jobList.forEach((element) => {
      fetch_status.push(loadJobStatus(element.job_status, element.execution_id));
    });

    fetch_status.map((ele) => {
      if (ele === 'Completed') {
        obj.CompletedStatus += 1;
      } else if (ele === 'Running') {
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

  useEffect(() => {
    showPopconfirm();
  }, [countStatus]);

  const countItem = (fetchStatus) => {
    if (fetchStatus) {
      setstatusCountJob((statusCountJob) => statusCountJob + 1);
    }
  };

  useEffect(() => {
    setPrevCount(statusCountJob);
  }, [chipData, chipEnable]);

  const handleMenuItemClick = (event, index) => {
    setchipEnable(true);
    let isPresent = false;
    chipData.map((el) => {
      if (el.label === options[index]) {
        isPresent = true;
      }
    });
    if (!isPresent) {
      setChipData([...chipData, { key: index, label: options[index] }]);
      setSelectedIndex(index);
      setAnchorEl(null);
    }
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - jobList.length) : 0;

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleBatchIdModalOpen = () => setOpenBatchIdModal(true);

  const handleBatchIdModalClose = () => {
    setOpenBatchIdModal(false);
    setBatchId('');
  };

  const fetchJob = async () => {
    setLoading(true);
    try {
      const response = await fetchJobsAndStatusApi(client.client_id, batch.batch_id);
      setJobList(response.data);
      setcountStatus(!countStatus);
    } catch (error) {
      setJobList([]);
      if (error.response.status === 404) {
        enqueueSnackbar('No jobs found!', {
          variant: 'warning',
          autoHideDuration: 3000,
          anchorOrigin: { vertical: 'top', horizontal: 'right' },
        });
      }
    }
    setLoading(false);
  };

  const handleRunBatch = async (e) => {
    e.preventDefault();

    const batch_id = `${client.client_name}_${batch.batch_name}_dataProcessor_${new Date().getTime()}`;

    const promises = [];

    jobList.forEach((ele) => {
      promises.push(
        axios.post(`${BASEURL}/batch_id/create`, {
          client_job: `${client.client_name}_${batch.batch_name}_${ele.input_ref_key}`,
          batch_id: batch_id.replaceAll(' ', ''),
        })
      );
    });

    await Promise.all(promises);

    const data = {
      batch: batch.batch_name,
      execution_id: batch_id.replaceAll(' ', ''),
      client_id: client.client_id,
      batch_id: batch.batch_id,
      client_name: client.client_name,
    };

    const res = await runWholeBatchApi(data);

    if (res.status === 200) {
      setBatchId(batch_id);
      handleBatchIdModalOpen();
      enqueueSnackbar(`${batch.batch_name} batch is running!`, {
        variant: 'success',
        autoHideDuration: 3000,
        anchorOrigin: { vertical: 'top', horizontal: 'right' },
      });
    }
  };

  const handleDelete = (chipToDelete) => () => {
    setChipData((chips) => chips.filter((chip) => chip.key !== chipToDelete.key));
  };

  useEffect(async () => {
    try {
      if (searchText.length === 0) {
        if (batch.batch_id !== undefined) {
          const response = await fetchJobsAndStatusApi(batch.client_id, batch.batch_id);

          if (response.status === 200) {
            setJobList(response.data);
          }
        }
      } else {
        const response = await fetchJobsAndStatusApi(batch.client_id, batch.batch_id);
        const finalJobListarray = [];

        response.data.map((ele) => {
          if (ele.input_ref_key.toLowerCase().includes(searchText.toLowerCase())) {
            finalJobListarray.push(ele);
          }
        });
        if (response.status === 200) {
          setJobList(finalJobListarray);
        }
      }
    } catch (error) {
      console.log(error);
    }
  }, [searchText]);

  return (
    <>
      <HeadOptions fetchJob={fetchJob} />

      <Paper elevation={1} sx={{ marginBottom: '30px', padding: ' 15px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
            <Search>
              <SearchIconWrapper>
                <SearchIcon color="primary" />
              </SearchIconWrapper>
              <StyledInputBase
                placeholder="Search…"
                inputProps={{ 'aria-label': 'search' }}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </Search>

            <Tooltip title="Add Filter">
              <IconButton variant="outlined" color="secondary" onClick={handleAddFilter}>
                <FilterAltIcon color="secondary" fontSize="medium" />
              </IconButton>
            </Tooltip>
            <Menu
              id="basic-menu"
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              MenuListProps={{
                'aria-labelledby': 'basic-button',
              }}
            >
              {options.map((option, index) => (
                <MenuItem
                  key={option}
                  selected={index === selectedIndex}
                  onClick={(event) => handleMenuItemClick(event, index)}
                >
                  {option}
                </MenuItem>
              ))}
            </Menu>
            <div style={{ display: 'flex', flexDirection: 'row' }}>
              {chipData.map((data) => {
                return (
                  <Chip
                    label={data.label}
                    color={
                      (data.label === 'Running' && 'success') ||
                      (data.label === 'Progress' && 'secondary') ||
                      (data.label === 'Failed' && 'error') ||
                      'default'
                    }
                    style={{ marginRight: '2px' }}
                    onDelete={data.label === 'React' ? undefined : handleDelete(data)}
                  />
                );
              })}
            </div>
          </div>
          <div>
            <Button
              onClick={handleRunBatch}
              variant="contained"
              className="button-color"
              disabled={userRole === 'ROLE_reader'}
            >
              Run Batch <PlayArrowIcon style={{ fontSize: '15px' }} />
            </Button>
          </div>
        </div>
        <div>
          <div style={{ display: 'flex', flexDirection: 'row-reverse' }}>
            {/* <div>
              {!status_loading && (
                <Button shape="circle" onClick={showPopconfirm}>
                  <SyncOutlined spin style={{ color: 'red', marginRight: '7px' }} />
                </Button>
              )}
              {status_loading && (
                <Button shape="circle" onClick={showPopconfirm}>
                  <SyncOutlined style={{ color: 'red', marginRight: '7px' }} />
                </Button>
              )}
            </div> */}
            <div style={{ marginRight: '7px', color: 'gray', fontWeight: 'bold' }}>Unknown = {UnknownStatus} ;</div>
            <div style={{ marginRight: '7px', color: 'red', fontWeight: 'bold' }}>Failed = {FailedStatus} ;</div>
            <div style={{ marginRight: '7px', color: 'orange', fontWeight: 'bold' }}>Progress = {ProgressStatus} ;</div>
            <div style={{ marginRight: '7px', color: 'green', fontWeight: 'bold' }}>
              Completed = {CompletedStatus} ;
            </div>
          </div>

          <TableContainer component={Paper} sx={{ border: '1px solid' }}>
            <Table sx={{ minWidth: 700 }} aria-label="customized table">
              <TableHead>
                <TableRow>
                  <StyledTableCell align="left">Job Name</StyledTableCell>
                  <StyledTableCell align="center">Job Run On</StyledTableCell>

                  <StyledTableCell align="center">Actions</StyledTableCell>
                  <StyledTableCell align="center">
                    <div
                      style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <div>Status</div>
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
                {jobList.length > 0 &&
                  jobList.map((el, i) => {
                    return (
                      <JobsTableRow key={i} source={el} chipData={chipData} countItem={countItem} fetchJob={fetchJob} />
                    );
                  })}
                {emptyRows > 0 && (
                  <TableRow style={{ height: 53 * emptyRows }}>
                    <TableCell colSpan={6} />
                  </TableRow>
                )}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    colSpan={3}
                    count={chipEnable ? statusCountJob - PrevCount : jobList.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    SelectProps={{
                      inputProps: {
                        'aria-label': 'rows per page',
                      },
                      native: true,
                    }}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    ActionsComponent={TablePaginationActions}
                  />
                </TableRow>
              </TableFooter>
            </Table>
          </TableContainer>
        </div>
      </Paper>
      <Modal
        open={openBatchIdModal}
        onClose={handleBatchIdModalClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="transition-modal-title" variant="h6" component="h2">
            Running Job Batch_id -
          </Typography>
          <Typography id="transition-modal-description" sx={{ mt: 2, fontWeight: 'bold' }}>
            {batchId}
          </Typography>
          <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
            <Button
              variant="contained"
              color="secondary"
              type="submit"
              onClick={handleBatchIdModalClose}
              className="button-color"
            >
              Close
            </Button>
          </Stack>
        </Box>
      </Modal>
    </>
  );
};

export default Dash;
