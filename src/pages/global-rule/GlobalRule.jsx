import React, { useEffect, useState, useContext } from 'react';
import {
  Box,
  IconButton,
  Stack,
  Menu,
  MenuItem,
  Modal,
  TablePagination,
  TableFooter,
  TableSortLabel,
} from '@mui/material';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import EditIcon from '@mui/icons-material/Edit';
import { useSnackbar } from 'notistack';
import Button from '@mui/material/Button';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import LastPageIcon from '@mui/icons-material/LastPage';
import DeleteIcon from '@mui/icons-material/Delete';
import { LoadingButton } from '@mui/lab';
import SaveIcon from '@mui/icons-material/Save';
import PropTypes from 'prop-types';
import { styled, useTheme } from '@mui/material/styles';
import StyledEngineProvider from '@mui/material/StyledEngineProvider';
import ArrowDropDownOutlinedIcon from '@mui/icons-material/ArrowDropDownOutlined';
import ArrowDropUpOutlinedIcon from '@mui/icons-material/ArrowDropUpOutlined';
import '../GlobalCssPagination.css';
import InputField from '../../reusable-components/InputField';
import { BatchContext } from '../../context/BatchProvider';
import {
  createGlobalRuleApi,
  deleteGlobalRuleApi,
  getGlobalRuleApi,
  getGlobalRuleByRulenameApi,
  updateGlobalRuleApi,
} from "../../api's/GlobalRuleApi";
import { getArgsByRulenameApi, getRuleByTypeApi } from "../../api's/CustomRuleApi";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
    padding: '5px 20px',
  },
}));

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

const component = {
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: '#fff',
  borderRadius: '10px',
  overflow: 'hidden',
};

const upperComponent = {
  display: 'flex',
  justifyContent: 'space-between',
  borderBottom: '5px solid #e9ecef',
  textAlign: 'center',
  padding: '10px 20px',
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
  if (orderBy === 'rule_name') {
    const x = a.rulename.toLowerCase();
    const y = b.rulename.toLowerCase();
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
  console.log(order, orderBy);
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

const headCells = [
  {
    id: 'rule_name',
    numeric: false,
    disablePadding: false,
    label: ' Rule Name',
  },
  {
    id: 'arg_value',
    numeric: true,
    disablePadding: false,
    label: 'Arg Value ',
  },
  {
    id: 'field_type',
    numeric: true,
    disablePadding: false,
    label: 'FieldType ',
  },
  {
    id: 'action',
    numeric: true,
    disablePadding: false,
    label: 'Action ',
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
            align="left"
            padding={headCell.disablePadding ? 'none' : 'normal'}
            sortDirection={orderBy === 'rule_name' ? order : false}
            style={{ backgroundColor: '#0dd398', color: 'white' }}
          >
            <TableSortLabel
              // active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : 'asc'}
              onClick={createSortHandler(headCell.id)}
              style={{ backgroundColor: '#0dd398', color: 'white' }}
              hideSortIcon="true"
            >
              <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                <Box component="span">{headCell.label}</Box>
                {headCell.id === 'rule_name' ? (
                  <Box component="span">
                    {orderBy === 'rule_name' && order === 'desc' ? (
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

const GlobalRule = () => {
  const FieldValues = ['integer', 'date'];
  const { batch } = useContext(BatchContext);
  const { enqueueSnackbar } = useSnackbar();
  const [loadBtn, setLoadBtn] = useState(false);
  const [rulename, setRulename] = useState();
  const [argvalue, setArgvalue] = useState();
  const [type, setType] = useState('');
  const [globalRules, setGlobalRules] = useState([]);
  const [editEnabled, setEditEnabled] = useState(false);
  const [openCreateRuleModal, setOpenCreateRuleModal] = useState(false);
  const [fetchArgs, setfetchArgs] = useState('');
  const [rulesData, setrulesData] = useState([]);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [order, setOrder] = React.useState('asc');
  const [orderBy, setOrderBy] = React.useState('rule_name');

  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - globalRules.length) : 0;

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

  const handleDeleteModalOpen = () => setOpenDeleteModal(true);

  const handleDeleteModalClose = () => setOpenDeleteModal(false);

  const handleCreateRuleModalOpen = () => setOpenCreateRuleModal(true);

  const handleAddRule = async (e) => {
    e.preventDefault();
    setLoadBtn(true);

    try {
      let response;
      if (editEnabled) {
        const data = {
          client: batch,
          argvalue,
          rulename,
          type,
          argkey: fetchArgs,
        };

        response = await updateGlobalRuleApi(data);

        setEditEnabled(false);
      } else {
        const data = {
          argvalue,
          rulename,
          type,
          argkey: fetchArgs,
        };

        response = await createGlobalRuleApi(data);
      }

      if (response.status === 201 || response.status === 200) {
        enqueueSnackbar('Global Rule Saved!', {
          variant: 'success',
          autoHideDuration: 3000,
          anchorOrigin: { vertical: 'top', horizontal: 'right' },
        });
        fetchGlobalRule();
        setLoadBtn(false);
        handleCreateRuleModalClose();
        setEditEnabled(false);
        setRulename('');
        setArgvalue('');
        setType('');
      }
    } catch (e) {
      if (e.response.status === 409) {
        enqueueSnackbar('Rule name already exist!', {
          variant: 'error',
          autoHideDuration: 3000,
          anchorOrigin: { vertical: 'top', horizontal: 'right' },
        });
      }
      setLoadBtn(false);
      handleCreateRuleModalClose();
    }
  };

  const handleCreateRuleModalClose = () => {
    setOpenCreateRuleModal(false);
    setRulename();
    setArgvalue();
    setType('');
    setfetchArgs('');
    setrulesData([]);
    setEditEnabled(false);
  };

  const handleFieldType = async (e) => {
    setRulename();
    setArgvalue();
    setfetchArgs('');
    setrulesData([]);
    setType(e.target.value);
    try {
      const res = await getRuleByTypeApi(e.target.value);
      if (res.status === 200) {
        setrulesData(res.data);
      }
    } catch (error) {
      if (error.response.status === 404) {
        enqueueSnackbar(`There is no rule for ${e.target.value} `, {
          variant: 'warning',
          autoHideDuration: 3000,
          anchorOrigin: { vertical: 'top', horizontal: 'right' },
        });
      }
    }
  };

  const handleRuleNameChange = async (event) => {
    setRulename(event.target.value);

    try {
      const res = await getArgsByRulenameApi(event.target.value);

      if (res.status === 200) {
        setfetchArgs(res.data);
      }
    } catch (error) {
      // console.log(error)
    }
  };

  const fetchGlobalRule = async () => {
    try {
      const response = await getGlobalRuleApi();

      if (response.status === 200) {
        const data_withoutSorted = response.data;
        setGlobalRules(data_withoutSorted);
      }
    } catch (error) {
      if (error.response.status === 404) {
        setGlobalRules([]);
        enqueueSnackbar(`No Global rules found! `, {
          variant: 'warning',
          autoHideDuration: 3000,
          anchorOrigin: { vertical: 'top', horizontal: 'right' },
        });
      }
    }
  };

  useEffect(() => {
    fetchGlobalRule();

    return () => {
      setGlobalRules([]);
    };
  }, []);

  const handleDeleteRule = async (e, id) => {
    e.preventDefault();
    setLoadBtn(true);

    const response = await deleteGlobalRuleApi(id);

    if (response.status === 200) {
      try {
        const response = await getGlobalRuleApi();

        if (response.status === 200) {
          setGlobalRules(response.data);
        }
      } catch (error) {
        if (error.response.status === 404) {
          setGlobalRules([]);
        }
      }
      enqueueSnackbar('Rule deleted successfully!', {
        variant: 'success',
        autoHideDuration: 3000,
        anchorOrigin: { vertical: 'top', horizontal: 'right' },
      });
    }
    handleDeleteModalClose();
    setLoadBtn(false);
  };

  const handleFetchRuleByName = async (ruleName) => {
    try {
      const response = await getGlobalRuleByRulenameApi(ruleName);

      const res = await getArgsByRulenameApi(ruleName);

      if (res.status === 200) {
        setfetchArgs(res.data);
      }

      if (response.status === 200) {
        setType(response.data.type);
        setRulename(response.data.rulename);
        setArgvalue(response.data.argvalue);
      }
    } catch (error) {
      if (error.response.status === 404) {
        enqueueSnackbar(`No rules found! `, {
          variant: 'warning',
          autoHideDuration: 3000,
          anchorOrigin: { vertical: 'top', horizontal: 'right' },
        });
      }
    }

    handleCreateRuleModalOpen();
  };

  return (
    <>
      <Paper elevation={1}>
        <Box>
          <Box style={component}>
            <>
              <Box style={upperComponent}>
                <h3>{batch.batch_name}</h3>
                <Button variant="contained" className="button-color" size="small" onClick={handleCreateRuleModalOpen}>
                  Add Global Rule
                </Button>
              </Box>

              <Box style={{ marginTop: '10px', padding: 10 }}>
                <TableContainer component={Paper} sx={{ border: '2px solid #ccc', borderRadius: '5px' }}>
                  <Table sx={{ minWidth: 700 }} aria-label="customized table">
                    <EnhancedTableHead order={order} orderBy={orderBy} onRequestSort={handleRequestSort} />
                    <TableBody>
                      {(rowsPerPage > 0
                        ? globalRules
                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            .sort(getComparator(order, orderBy))
                        : globalRules.sort(getComparator(order, orderBy))
                      ).map((row, i) => (
                        <TableRow hover key={i}>
                          <StyledTableCell>
                            <h4>{row.rulename}</h4>
                          </StyledTableCell>
                          <StyledTableCell>{row.argvalue}</StyledTableCell>
                          <StyledTableCell>{row.type}</StyledTableCell>
                          <StyledTableCell>
                            <IconButton
                              color="primary"
                              aria-label="upload picture"
                              component="span"
                              onClick={() => {
                                setEditEnabled(true);
                                handleFetchRuleByName(row.rulename);
                              }}
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              color="error"
                              aria-label="upload picture"
                              component="span"
                              onClick={handleDeleteModalOpen}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </StyledTableCell>

                          <Modal
                            open={openDeleteModal}
                            onClose={handleDeleteModalClose}
                            aria-labelledby="modal-modal-title"
                            aria-describedby="modal-modal-description"
                          >
                            <Box sx={style}>
                              Are you sure you want to delete this rule?
                              <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                                <Button
                                  variant="outlined"
                                  color="secondary"
                                  type="submit"
                                  onClick={handleDeleteModalClose}
                                  className="outlined-button-color"
                                  disabled={loadBtn}
                                >
                                  Cancel
                                </Button>

                                {!loadBtn ? (
                                  <Button
                                    variant="contained"
                                    color="secondary"
                                    type="submit"
                                    onClick={(e) => handleDeleteRule(e, row.id)}
                                    className="button-color"
                                  >
                                    Delete
                                  </Button>
                                ) : (
                                  <LoadingButton
                                    loading
                                    loadingPosition="start"
                                    startIcon={<SaveIcon />}
                                    variant="outlined"
                                    sx={{ mt: 2 }}
                                  >
                                    Delete
                                  </LoadingButton>
                                )}
                              </Stack>
                            </Box>
                          </Modal>
                        </TableRow>
                      ))}
                      {emptyRows > 0 && (
                        <TableRow style={{ height: 53 * emptyRows }}>
                          <TableCell colSpan={6} />
                        </TableRow>
                      )}
                    </TableBody>
                    <TableFooter>
                      <TableRow>
                        <StyledEngineProvider injectFirst>
                          <TablePagination
                            rowsPerPageOptions={[5, 10, 25]}
                            colSpan={3}
                            count={globalRules.length}
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
            </>
          </Box>
        </Box>
      </Paper>

      <Modal
        open={openCreateRuleModal}
        onClose={handleCreateRuleModalClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <form autoComplete="off" onSubmit={handleAddRule}>
            <InputField
              select
              id="outlined-basic"
              label="Field Type"
              variant="outlined"
              fullWidth
              name="type"
              value={type}
              autoComplete="off"
              required
              disabled={editEnabled}
              onChange={(event) => handleFieldType(event)}
            >
              {FieldValues.map((ele, field_idx) => {
                return (
                  <MenuItem key={field_idx} value={ele}>
                    {ele}
                  </MenuItem>
                );
              })}
            </InputField>
            {editEnabled && (
              <InputField
                id="outlined-basic"
                label="Rulename"
                variant="outlined"
                fullWidth
                name="rulename"
                disabled={editEnabled}
                value={rulename}
              />
            )}
            {rulesData.length > 0 && (
              <InputField
                select
                id="outlined-basic"
                label="Rule Name"
                variant="outlined"
                fullWidth
                name="rulename"
                value={rulename}
                autoComplete="off"
                disabled={editEnabled}
                required
                onChange={(event) => handleRuleNameChange(event)}
              >
                {rulesData.map((ele, ruledata_idx) => {
                  return (
                    <MenuItem key={ruledata_idx} value={ele}>
                      {ele}
                    </MenuItem>
                  );
                })}
              </InputField>
            )}
            {rulename && (
              <InputField
                id="outlined-basic"
                label="Args Value"
                variant="outlined"
                fullWidth
                name="argvalue"
                value={argvalue}
                autoComplete="off"
                required
                onChange={(event) => setArgvalue(event.target.value)}
                helperText={`Example: [${fetchArgs}]`}
              />
            )}

            {!loadBtn ? (
              <Button
                disabled={!rulename && !argvalue}
                type="submit"
                variant="contained"
                size="small"
                className="button-color"
                style={{ marginTop: '15px' }}
              >
                Save
              </Button>
            ) : (
              <LoadingButton
                loading
                loadingPosition="start"
                startIcon={<SaveIcon />}
                variant="outlined"
                size="small"
                style={{ marginTop: '15px' }}
              >
                Save
              </LoadingButton>
            )}
          </form>
        </Box>
      </Modal>
    </>
  );
};

export default GlobalRule;
