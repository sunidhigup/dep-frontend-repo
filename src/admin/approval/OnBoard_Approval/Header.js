import React from 'react'
import { Paper, Box } from '@mui/material';

const Header = ({name}) => {
  return (
    <>
      <Paper elevation={1}>
        <Box>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: 20, color: '#003566',  fontWeight :'bold' }}>
            <div>{name}</div>
          </div>
        </Box>
      </Paper>
    </>
  )
}

export default Header