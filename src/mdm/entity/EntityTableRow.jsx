import { IconButton, TableCell, tableCellClasses, TableRow, Tooltip } from '@mui/material';
import { styled } from '@mui/styles';
import React from 'react';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useNavigate } from 'react-router-dom';

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

const EntityTableRow = ({ entity }) => {
  const navigate = useNavigate();
  const handleExplore = () => {
    navigate(`/mdm/entity/${entity.entityId}`);
  };
  return (
    <>
      {entity && (
        <>
          <StyledTableRow>
            <StyledTableCell align="center">{entity.entityName}</StyledTableCell>
            <StyledTableCell align="center">
              <IconButton color="info" onClick={handleExplore}>
                <ArrowForwardIcon sx={{ fontSize: '1rem' }} />
              </IconButton>
            </StyledTableCell>
          </StyledTableRow>
        </>
      )}
    </>
  );
};

export default EntityTableRow;
