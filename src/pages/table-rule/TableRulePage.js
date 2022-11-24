import React, { useContext } from 'react';
import { Box } from '@mui/system';
import { Breadcrumbs, Paper } from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { useNavigate, useParams } from 'react-router-dom';
import RulesTableSection from './v1/RulesTableSection';
import { BatchContext } from '../../context/BatchProvider';
import { RuleEngineTabContext } from '../../context/RuleEngineTabProvider';
import { HomeTabContext } from '../../context/HomeTabProvider';
import RuleTableSectionNew from './v2/RuleTableSectionNew';

const TableRulePage = () => {
  const navigate = useNavigate();
  const params = useParams();
  const { batch } = useContext(BatchContext);
  const { setValue } = useContext(RuleEngineTabContext);
  const { setHomeValue } = useContext(HomeTabContext);

  const redirectTableRule = () => {
    navigate(-1);
    setValue(0);
    setHomeValue(0);
  };

  const redirectHome = () => {
    navigate(-1);
    setValue(0);
    setHomeValue(0);
  };

  return (
    <>
      <Paper elevation={1} sx={{ padding: '15px 20px', mb: 3 }}>
        {/* <Box sx={{ backgroundColor: '#fff', borderRadius: '10px' }}> */}
        <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} aria-label="breadcrumb">
          <a role="button" tabIndex="0" onClick={redirectHome} onKeyDown={redirectHome} style={{ cursor: 'pointer' }}>
            {batch.batch_name}
          </a>

          <a
            role="button"
            tabIndex="0"
            style={{ cursor: 'pointer' }}
            onClick={redirectTableRule}
            onKeyDown={redirectTableRule}
          >
            Rule Engine
          </a>

          <span style={{ color: '#6c757d' }}>{params.tablename}</span>
        </Breadcrumbs>
        {/* </Box> */}
      </Paper>
      <Paper elevation={1} sx={{ padding: '10px' }}>
        {/* <RulesTableSection /> */}
        <RuleTableSectionNew componentType="ruleEngine" tablename={params.tablename} tableId={params.id} />
      </Paper>
    </>
  );
};

export default TableRulePage;
