import React, { useContext, useEffect, useState } from 'react';
import { Spin } from 'antd';
import { Paper } from '@mui/material';
import RealTimeRuleTableSection from './RealTimeRuleTableSection';
import { ClientContext } from '../../../context/ClientProvider';
import { fetchTableRule } from "../../../api's/TableRuleApi";

const spinStyle = {
  margin: '20px 0px',
  marginBottom: 20,
  padding: '30px 50px',
  textAlign: 'center',
  borderRadius: '4px',
};

const Step2 = ({ step1Data, NextData, setNextData }) => {
  return (
    <Paper elevation={1} sx={{ padding: '10px', margin: '30px 0px' }}>
      <RealTimeRuleTableSection
        componentType="RealTime"
        NextData={NextData}
        setNextData={setNextData}
        step_tablename={step1Data.tableName}
        stream_name={step1Data.stream_name}
      />
    </Paper>
  );
};

export default Step2;
