import React, { useContext, useEffect, useState } from 'react';
import { Spin } from 'antd';
import { Paper } from '@mui/material';
import RuleTableSectionNew from '../../pages/table-rule/v2/RuleTableSectionNew';
import { ClientContext } from '../../context/ClientProvider';
import { BatchContext } from '../../context/BatchProvider';
import { fetchTableRule } from "../../api's/TableRuleApi";

const spinStyle = {
  margin: '20px 0px',
  marginBottom: 20,
  padding: '30px 50px',
  textAlign: 'center',
  borderRadius: '4px',
};

const Step2New = ({ step1Data, NextData, setNextData }) => {
  const { client } = useContext(ClientContext);
  const { batch } = useContext(BatchContext);
  const [TableRuleInfo, setTableRuleInfo] = useState({});
  const [loadingStatus, setloadingStatus] = useState(true);

  const getTableInfo = async () => {
    setloadingStatus(true);
    try {
      const response = await fetchTableRule(client.client_id, batch.batch_name, step1Data.tableName);
      if (response.status === 200) {
        setTableRuleInfo(response.data);
      }
    } catch (error) {
      // console.log(error)
    }
    setloadingStatus(false);
  };

  useEffect(() => {
    getTableInfo();
  }, []);

  return (
    <>
      {loadingStatus && <Spin size="large" style={spinStyle} />}
      {!loadingStatus && (
        <>
          <Paper elevation={1} sx={{ padding: '10px', margin: '30px 0px' }}>
            <RuleTableSectionNew
              componentType="PreProcessor"
              tablename={TableRuleInfo.tablename}
              tableId={TableRuleInfo.id}
              NextData={NextData}
              setNextData={setNextData}
            />
          </Paper>
        </>
      )}
    </>
  );
};

export default Step2New;
