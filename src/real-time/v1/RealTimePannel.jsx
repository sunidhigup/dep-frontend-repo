import {
  alpha,
  Box,
  Button,
  Chip,
  IconButton,
  InputBase,
  Menu,
  MenuItem,
  Paper,
  styled,
  Table,
  TableBody,
  TableCell,
  tableCellClasses,
  TableContainer,
  TableFooter,
  TableHead,
  TablePagination,
  TableRow,
  Tooltip,
  useTheme,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import LastPageIcon from '@mui/icons-material/LastPage';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import LoadingIcon from '../../reusable-components/LoadingIcon';

import RealTimeHead from '../v2/RealTimeHead';
import StreamTableRow from './StreamTableRow';

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

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
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

const RealTimePannel = () => {
  const [fetchedStream, setFetchedStream] = useState([]);
  const [loading, setLoading] = useState();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchText, setSearchText] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('stream_name');
  const [PrevCount, setPrevCount] = useState(0);
  const [chipData, setChipData] = useState([]);
  const [statusCountJob, setstatusCountJob] = useState(0);
  const [chipEnable, setchipEnable] = useState(false);
  const [clusterId, setClusterId] = useState([]);
  const options = ['Running', 'Progress', 'Failed', 'Unknown'];

  const open = Boolean(anchorEl);
  const [selectedIndex, setSelectedIndex] = React.useState(1);

  const InitialStatusCount = {
    Running: 0,
    Progress: 0,
    Failed: 0,
    Unknown: 0,
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMenuItemClick = (event, index) => {
    // setchipEnable(true);
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

  const handleAddFilter = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const countItem = (fetchStatus) => {
    if (fetchStatus) {
      setstatusCountJob((statusCountJob) => statusCountJob + 1);
    }
  };
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  console.log(fetchedStream);
  console.log(clusterId)
  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - fetchedStream.length) : 0;
  return (
    <div>
      <RealTimeHead setFetchedStream={setFetchedStream} setClusterId={setClusterId} />

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
                    // onDelete={data.label === 'React' ? undefined : handleDelete(data)}
                  />
                );
              })}
            </div>
          </div>
          <div>
            <Button variant="contained" className="button-color">
              Run Batch <PlayArrowIcon style={{ fontSize: '15px' }} />
            </Button>
          </div>
        </div>
        <TableContainer component={Paper} sx={{ border: '1px solid' }}>
          <Table sx={{ minWidth: 700 }} aria-label="customized table">
            <TableHead>
              <TableRow>
                <StyledTableCell align="center">Stream Name</StyledTableCell>
                <StyledTableCell align="center">Actions</StyledTableCell>
                <StyledTableCell align="left">Configure</StyledTableCell>
                <StyledTableCell align="center">Status</StyledTableCell>
              </TableRow>
            </TableHead>

            {loading && (
              <Box>
                <LoadingIcon />
              </Box>
            )}
            <TableBody>
              {fetchedStream.length > 0 &&
                fetchedStream.map((el, i) => {
                  return (
                    <StreamTableRow
                      key={i}
                      rowNo={i}
                      source={el.stream_name}
                      chipData={chipData}
                      countItem={countItem}
                      clusterId={clusterId}
                      setClusterId={setClusterId}
                    />
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
                  count={chipEnable ? statusCountJob - PrevCount : fetchedStream.length}
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
      </Paper>
    </div>
  );
};

export default RealTimePannel;
