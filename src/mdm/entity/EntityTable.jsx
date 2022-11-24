import {
  styled,
  Table,
  TableBody,
  TableCell,
  tableCellClasses,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import React from 'react';
import EntityTableRow from './EntityTableRow';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: '#0dd398',
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
    border: '1px solid',
  },
}));
const EntityTable = ({ listEntity }) => {
  return (
    <TableContainer>
      <Table sx={{ minWidth: 700 }} aria-label="customized table">
        <TableHead>
          <TableRow>
            <StyledTableCell align="center">Entity Name</StyledTableCell>
            <StyledTableCell align="center">Explore</StyledTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {listEntity &&
            listEntity.map((e, i) => {
              return <EntityTableRow key={i} entity={e} />;
            })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default EntityTable;
