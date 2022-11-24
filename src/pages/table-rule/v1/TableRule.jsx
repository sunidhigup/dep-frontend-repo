import React, { useState, useEffect, useContext, memo } from 'react';
import {
  Box,
  Button,
  IconButton,
  Modal,
  Paper,
  TableContainer,
  TableFooter,
  TablePagination,
  TableSortLabel,
} from '@mui/material';
import PropTypes from 'prop-types';
import { styled, useTheme } from '@mui/material/styles';
import axios from 'axios';
import LoadingButton from '@mui/lab/LoadingButton';
import SaveIcon from '@mui/icons-material/Save';
import { BulbFilled, BulbOutlined, SearchOutlined, SyncOutlined } from '@ant-design/icons';
import { Popconfirm } from 'antd';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowDropDownOutlinedIcon from '@mui/icons-material/ArrowDropDownOutlined';
import ArrowDropUpOutlinedIcon from '@mui/icons-material/ArrowDropUpOutlined';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import LastPageIcon from '@mui/icons-material/LastPage';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { useSnackbar } from 'notistack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import StyledEngineProvider from '@mui/material/StyledEngineProvider';

import '../../GlobalCssPagination.css';
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
} from "../../../api's/TableRuleApi";
import { createBatchidApi, fetchBatchidApi } from "../../../api's/BatchApi";
import LoadingIcon from '../../../reusable-components/LoadingIcon';
import TableRuleRowNew from './TableRuleRowNew';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

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
    <Box sx={{ flexShrink: 0, ml: 2.5, mb: 1.5 }}>
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
  // console.log(a)
  if (orderBy === 'table_name') {
    const x = a.tablename.toLowerCase();
    const y = b.tablename.toLowerCase();
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

function getComparator(order, orderBy) {
  // console.log(order, orderBy);
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

const headCells = [
  {
    id: 'table_name',
    numeric: false,
    disablePadding: false,
    label: 'Table',
  },
  {
    id: 'action',
    numeric: true,
    disablePadding: false,
    label: 'Action ',
  },
  {
    id: 'explore',
    numeric: true,
    disablePadding: false,
    label: 'Explore ',
  },
];

function EnhancedTableHead(props) {
  const [status_loading, setStatus_Loading] = useState();
  const { order, orderBy, onRequestSort, on } = props;
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.label === 'Table' ? 'left' : 'center'}
            padding={headCell.disablePadding ? 'none' : 'normal'}
            sortDirection={orderBy === 'table_name' ? order : false}
            style={{ backgroundColor: '#0dd398', color: 'white' }}
          >
            <TableSortLabel
              direction={orderBy === headCell.id ? order : 'asc'}
              onClick={createSortHandler(headCell.id)}
              style={{ backgroundColor: '#0dd398', color: 'white' }}
              hideSortIcon="true"
            >
              <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                <Box component="span">{headCell.label}</Box>
                {headCell.id === 'table_name' ? (
                  <Box component="span">
                    {orderBy === 'table_name' && order === 'desc' ? (
                      <>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <ArrowDropUpOutlinedIcon fontSize="medium" />
                          <ArrowDropDownOutlinedIcon fontSize="medium" color="warning" />
                        </div>
                      </>
                    ) : (
                      <>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <ArrowDropUpOutlinedIcon fontSize="medium" color="error" />
                          <ArrowDropDownOutlinedIcon fontSize="medium" />
                        </div>
                      </>
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

const TableRule = () => {
  // const classes = useStyles();
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

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [order, setOrder] = React.useState('asc');
  const [orderBy, setOrderBy] = React.useState('table_name');

  const [CompletedStatus, setCompletedStatus] = useState(0);
  const [ProgressStatus, setProgressStatus] = useState(0);
  const [FailedStatus, setFailedStatus] = useState(0);
  const [UnknownStatus, setUnknownStatus] = useState(0);
  const [status_loading, setStatus_Loading] = useState(true);
  const [visible, setVisible] = useState(false);

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - tableAccordion.length) : 0;

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

  const loadJobStatus = async (batchname, job) => {
    const batchID = `${client.client_name}_${batch.batch_name}_${job}_ruleEngine`;
    try {
      const result = await fetchBatchidApi(batchID.replaceAll(' ', ''));

      if (result.status === 200) {
        const data = {
          id: `${result.data}`,
        };

        const result1 = await getRuleEngineStatus(data);

        if (result1.data.status === 'Completed') {
          return 'Completed';
        }
        if (result1.data.status === 'Running') {
          return 'Running';
        }
        if (result1.data.status === 'Failed') {
          return 'Failed';
        }
        const time = result.data.split('~')[1];
        const triggeredTime = new Date(time);
        const currentTime = new Date();

        const diffTime = currentTime - triggeredTime;

        const elapsedTime = Math.floor(diffTime / 60e3);

        if (elapsedTime < 5) {
          return 'Running';
        }
        return 'Failed';
      }
    } catch (error) {
      if (error.response.status === 404) {
        return 'Unknown';
      }
    }
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

    tableAccordion.forEach(async (element) => {
      promises.push(loadJobStatus(element.batch_name, element.tablename));
    });
    const fetch_status = await Promise.all(promises);
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
  }, [tableAccordion]);

  const fetchTableRule = async () => {
    setLoadBtn(true);
    try {
      const response = await fetchTableRules(client.client_id, batch.batch_name);

      if (response.status === 200) {
        setTableAccordion(response.data);
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
      if (error.response.status === 403) {
        enqueueSnackbar('You have only Read Permission !!', {
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
      if (error.response.status === 403) {
        enqueueSnackbar('You have only Read Permission !!', {
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

    try {
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
    } catch (error) {
      if (error.response.status === 403) {
        enqueueSnackbar('You have only Read Permission !!', {
          variant: 'error',
          autoHideDuration: 3000,
          anchorOrigin: { vertical: 'top', horizontal: 'right' },
        });
      }
    }

    setLoadBtn(false);

    handleS3PathModalClose();
  };

  // const handleFileUpload = async () => {
  //   selectFile({ accept: ['.csv', '.json'] }, ({ source, name, size, file }) => {
  //     if (file.type === 'text/csv') {
  //       let response = await axios.post(`${BASEURL}/table-rule/send-csv-file`, {
  //         client_id: client.client_id,
  //         batch: batch.batch_name_id,
  //         file_source: source,
  //         file_name: name,
  //         file: file
  //       })
  //       if (response.status === 200) {
  //         enqueueSnackbar("csv File uploaded successfully", {
  //           variant: "Success",
  //           autoHideDuration: 3000,
  //           anchorOrigin: { vertical: "top", horizontal: "right" },
  //         });
  //       }
  //       setisJsonFile(true)
  //     }
  //     else if (file.type === 'application/json') {
  //       let response = await axios.post(`${BASEURL}/table-rule/send-json-file`, {
  //         client_id: client.client_id,
  //         batch: batch.batch_name_id,
  //         file_source: source,
  //         file_name: name,
  //         file: file
  //       })
  //       if (response.status === 200) {
  //         enqueueSnackbar("json File uploaded successfully", {
  //           variant: "Success",
  //           autoHideDuration: 3000,
  //           anchorOrigin: { vertical: "top", horizontal: "right" },
  //         });
  //       }
  //     }
  //     else {
  //       enqueueSnackbar("Select csv or json file only", {
  //         variant: "error",
  //         autoHideDuration: 3000,
  //         anchorOrigin: { vertical: "top", horizontal: "right" },
  //       });
  //     }
  //     console.log({ source, name, size, file })
  //   })
  // }

  return (
    <>
      <Paper elevation={1} style={{ padding: '10px' }}>
        <Box style={component}>
          <Box style={upperComponent}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <Button
                  variant="contained"
                  className="button-color"
                  size="small"
                  onClick={handleAddModalOpen}
                  sx={{ mr: 2 }}
                >
                  Add JSON Schema
                </Button>

                <Button
                  variant="outlined"
                  className="outlined-button-color"
                  size="small"
                  onClick={handleCsvModalOpen}
                  sx={{ mr: 2 }}
                >
                  Add Delimited Schema
                </Button>
                {/* <Button
                  variant="contained"
                  className="button-color"
                  size="small"
                  onClick={handleSelectFileOpen}
                  sx={{ mr: 2 }}
                >
                  select file
                </Button> */}
              </div>

              <div style={{ display: 'flex', flexDirection: 'row' }}>
                <h3>{batch.batch_name} </h3>
              </div>
              <Button variant="contained" size="small" onClick={runWholeRuleEngine} className="button-color">
                Run Rule Engine <PlayArrowIcon style={{ fontSize: '15px' }} />
              </Button>
            </div>
          </Box>
          <Box style={lowerComponent}>
            <div style={{ display: 'flex', flexDirection: 'row-reverse' }}>
              <div>
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
              </div>
              <div style={{ marginRight: '7px', color: 'gray', fontWeight: 'bold' }}>Unknown = {UnknownStatus} ;</div>
              <div style={{ marginRight: '7px', color: 'red', fontWeight: 'bold' }}>Failed = {FailedStatus} ;</div>
              <div style={{ marginRight: '7px', color: 'orange', fontWeight: 'bold' }}>
                Progress = {ProgressStatus} ;
              </div>
              <div style={{ marginRight: '7px', color: 'green', fontWeight: 'bold' }}>
                Completed = {CompletedStatus} ;
              </div>
            </div>
            <TableContainer sx={{ mt: 2, border: '2px solid #ccc', borderRadius: '5px' }}>
              <Table sx={{ minWidth: 700 }} aria-label="customized table">
                <EnhancedTableHead order={order} orderBy={orderBy} onRequestSort={handleRequestSort} />
                <TableBody>
                  {loadBtn ? (
                    <Box>
                      <LoadingIcon size={40} />
                    </Box>
                  ) : (
                    <>
                      {(rowsPerPage > 0
                        ? tableAccordion
                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            .sort(getComparator(order, orderBy))
                        : tableAccordion.sort(getComparator(order, orderBy))
                      ).map((el, i) => (
                        <TableRuleRowNew key={i} data={el} fetchTableRule={fetchTableRule} />
                      ))}
                    </>
                  )}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <StyledEngineProvider injectFirst>
                      <TablePagination
                        rowsPerPageOptions={[5, 10, 25]}
                        colSpan={3}
                        count={tableAccordion.length}
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
                    </StyledEngineProvider>
                  </TableRow>
                </TableFooter>
              </Table>
            </TableContainer>
          </Box>
        </Box>
      </Paper>

      <Modal
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
      </Modal>

      <Modal
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
      </Modal>

      <Modal
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
      </Modal>

      <Modal
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
      </Modal>
    </>
  );
};

export default memo(TableRule);
