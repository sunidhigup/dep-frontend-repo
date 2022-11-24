import { Box, Button } from '@mui/material';
import React from 'react';
import AddIcon from '@mui/icons-material/Add';

const upperComponent = {
  borderBottom: '5px solid #e9ecef',
  padding: '10px 20px',
};
const EntityTop = ({ handleOpen }) => {
  return (
    <Box style={upperComponent}>
      <div style={{ display: 'flex', justifyContent: 'space-around' }}>
        <div style={{ textAlign: 'center' }}>
          <h3>Entities </h3>
        </div>
        <Button variant="contained" size="small" className="button-color" onClick={handleOpen}>
          <AddIcon style={{ fontSize: '15px' }} /> Create Entity
        </Button>
      </div>
    </Box>
  );
};

export default EntityTop;
