import React, { useContext, useEffect, useState } from 'react';
import { makeStyles } from '@mui/styles';
import {
  Autocomplete,
  Paper,
  TextField,
  Button,
  Box,
  TableContainer,
  TablePagination,
  TableFooter,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import SaveIcon from '@mui/icons-material/Save';
import { LoadingButton } from '@mui/lab';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { styled } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Editor from './Editor';
import { getDatabases, getTables, runSqlQuery } from "../api's/QueryBuilderApi";
import Edit from './Edit';
import LoadingIcon from '../reusable-components/LoadingIcon';
import QueryResult from './QueryResult';
import { QueryContext } from '../context/QueryProvider';

const useStyles = makeStyles({
  pannel: {
    display: 'flex',
  },
  editor: {
    width: '70%',
  },
  options: {
    width: '30%',
    marginLeft: '20px',
    padding: '10px',
  },
});

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const QueryBuilder = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { queryProvider, setQueryProvider } = useContext(QueryContext);

  const [value, setValue] = useState('' || queryProvider.value);
  const [loadingBtn, setLoadingBtn] = useState(false);

  const [dbName, setDbName] = useState('' || queryProvider.dbName);
  const [table, setTable] = useState('' || queryProvider.table);
  const [tableColumn, setTableColumn] = useState([]);
  const [sqlResult, setSqlResult] = useState([]);
  const [fetchedDb, setFetchedDb] = useState([]);
  const [fetchedTable, setFetchedTable] = useState([]);
  const [tableDisable, setTabledisable] = useState(true);

  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - sqlResult.length) : 0;

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(1);
  };

  const handleSetDb = (e, newevent) => {
    setTabledisable(false);
    setTable('');
    setDbName(newevent);

    fetchBatch(newevent);
  };

  const handleSetTable = (e, newevent) => {
    const selectedTable = fetchedTable.find((el) => el.table_name === newevent);
    setTableColumn(selectedTable.columns);
    setTable(newevent);
  };

  const fetchClient = async () => {
    try {
      const response = await getDatabases();

      if (response.status === 200) {
        setFetchedDb(response.data.data);
      }
    } catch (error) {
      setFetchedDb([]);
    }
  };

  const fetchBatch = async (dbname) => {
    try {
      const response = await getTables(dbname);

      if (response.status === 200) {
        setFetchedTable(response.data.data);
      }
    } catch (error) {
      setFetchedTable([]);
      enqueueSnackbar('No Tables found!', {
        variant: 'warning',
        autoHideDuration: 3000,
        anchorOrigin: { vertical: 'top', horizontal: 'right' },
      });
    }
  };

  useEffect(() => {
    fetchClient();
  }, []);

  const handleRunQuery = async (e) => {
    e.preventDefault();
    setLoadingBtn(true);

    const dbExist = value.includes(dbName);
    const tableExist = value.includes(table);

    if (!dbExist || !tableExist) {
      enqueueSnackbar('Database or Tablename does not match!', {
        variant: 'warning',
        autoHideDuration: 3000,
        anchorOrigin: { vertical: 'top', horizontal: 'right' },
      });
    } else {
      try {
        setQueryProvider({
          value,
          dbName,
          table,
        });
        const response = await runSqlQuery(value);
        setSqlResult(response.data.data);
      } catch (error) {
        setSqlResult([]);
        enqueueSnackbar('No Result found!', {
          variant: 'warning',
          autoHideDuration: 3000,
          anchorOrigin: { vertical: 'top', horizontal: 'right' },
        });
      }
    }
    setLoadingBtn(false);
  };

  const fetchSql = async () => {
    setLoadingBtn(true);
    if (dbName && table && value) {
      try {
        const response = await runSqlQuery(value);
        setSqlResult(response.data.data);
      } catch (error) {
        setSqlResult([]);
        enqueueSnackbar('No Result found!', {
          variant: 'warning',
          autoHideDuration: 3000,
          anchorOrigin: { vertical: 'top', horizontal: 'right' },
        });
      }
    }
    setLoadingBtn(false);
  };

  useEffect(() => {
    fetchSql();
  }, []);

  return (
    <>
      <div className={classes.pannel}>
        <div className={classes.editor}>
          <Edit value={value} setValue={setValue} />
        </div>
        <Paper className={classes.options}>
          <Autocomplete
            disablePortal
            id="combo-box-demo"
            name="dbName"
            value={dbName}
            options={fetchedDb.map((op) => op)}
            onChange={(event, newValue) => {
              handleSetDb(event, newValue);
            }}
            required
            fullWidth
            size="small"
            sx={{ mb: 3 }}
            renderInput={(params) => <TextField {...params} required label="Select Database" />}
          />

          <Autocomplete
            disablePortal
            id="combo-box-demo"
            name="table"
            value={table}
            options={fetchedTable.map((op) => op.table_name)}
            onChange={(event, newValue) => {
              handleSetTable(event, newValue);
            }}
            required
            fullWidth
            size="small"
            sx={{ mb: 3 }}
            disabled={dbName && table ? false : tableDisable}
            renderInput={(params) => <TextField {...params} required label="Select Table" />}
          />
        </Paper>
      </div>
      <div style={{ marginTop: '20px' }}>
        {!loadingBtn ? (
          <Button onClick={handleRunQuery} variant="contained" className="button-color">
            Run Query <PlayArrowIcon />
          </Button>
        ) : (
          <LoadingButton loading loadingPosition="start" startIcon={<SaveIcon />} variant="outlined" sx={{ mt: 2 }}>
            Run Query <PlayArrowIcon />
          </LoadingButton>
        )}
      </div>

      {loadingBtn && sqlResult.length <= 0 && (
        <Box>
          <LoadingIcon size={40} />
        </Box>
      )}
      {sqlResult.length > 0 && (
        <Box>
          <TableContainer sx={{ mt: 2, border: '2px solid #ccc', borderRadius: '5px' }}>
            <Table sx={{ minWidth: 700 }} aria-label="customized table">
              <TableHead>
                <TableRow>
                  {/* {tableColumn.map((el) => (
                    <StyledTableCell align="left" style={{ backgroundColor: '#0dd398' }}>
                      {el.name}
                    </StyledTableCell>
                  ))} */}
                  {sqlResult[0].data.map((key) => (
                    <StyledTableCell align="left" style={{ backgroundColor: '#0dd398' }}>
                      {key.varCharValue}
                    </StyledTableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {(rowsPerPage > 0
                  ? sqlResult.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  : sqlResult
                ).map((ele) => (
                  <QueryResult result={ele.data} />
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    count={sqlResult.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    SelectProps={{
                      inputProps: {
                        'aria-label': 'rows per page',
                      },
                    }}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    labelDisplayedRows={({ page }) => {
                      return `Page: ${page}`;
                    }}
                    backIconButtonProps={{
                      color: 'secondary',
                    }}
                    nextIconButtonProps={{ color: 'secondary' }}
                    showFirstButton
                    showLastButton
                    labelRowsPerPage={<span>Rows:</span>}
                    // sx={{
                    //   '.MuiTablePagination-toolbar': {
                    //     backgroundColor: 'rgba(100,100,100,0.5)',
                    //   },
                    //   '.MuiTablePagination-selectLabel, .MuiTablePagination-input': {
                    //     fontWeight: 'bold',
                    //     color: 'blue',
                    //   },
                    // }}
                  />
                </TableRow>
              </TableFooter>
            </Table>
          </TableContainer>
        </Box>
      )}
    </>
  );
};

export default QueryBuilder;
