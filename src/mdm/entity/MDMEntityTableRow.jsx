import { Button, TableCell, tableCellClasses, TableRow } from '@mui/material';
import { styled } from '@mui/styles';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import React, { useEffect } from 'react';

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:last-child td, &:last-child th': {
    border: 0,
  },
  padding: '5px 10px',
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.body}`]: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  padding: '5px 10px',
}));

const MDMEntityTableRow = ({
  rowAttribute,
  handleOpenEnityUpdate,
  setEditAttributeObject,
  deleteAttributeAction,
  index,
}) => {
  const action = () => {
    setEditAttributeObject({ ...rowAttribute, index });
  };
  return (
    <>
      {rowAttribute && (
        <>
          <StyledTableRow>
            <StyledTableCell>{rowAttribute.label}</StyledTableCell>
            <StyledTableCell>{rowAttribute.name}</StyledTableCell>
            <StyledTableCell>{rowAttribute.type}</StyledTableCell>
            <StyledTableCell>{rowAttribute.required ? 'True' : 'False'}</StyledTableCell>
            <StyledTableCell style={{ display: 'flex', justifyContent: 'space-evenly' }} align="center">
              <Button variant="contained" color="error" onClick={(e) => deleteAttributeAction(index)}>
                <DeleteOutlineIcon sx={{ fontSize: '1rem' }} />
              </Button>
              <Button variant="contained" color="info" onClick={handleOpenEnityUpdate} onClickCapture={action}>
                <ModeEditIcon sx={{ fontSize: '1rem' }} />
              </Button>
            </StyledTableCell>
          </StyledTableRow>
        </>
      )}
    </>
  );
};

export default MDMEntityTableRow;
