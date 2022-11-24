import { Paper } from '@mui/material';
import { Divider } from 'antd';
import React from 'react';
import Header from '../admin/approval/Header';
import MdmPannel from './MdmPannel';

const MDM = () => {
  return (
    <>
      <Paper elevation={1} style={{ padding: '15px' }}>
        <Header name="Master Data Management" />
        <Divider />
        <MdmPannel />
      </Paper>
    </>
  );
};

export default MDM;
