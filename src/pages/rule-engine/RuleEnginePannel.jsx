import * as React from 'react';
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';
import TableRule from '../table-rule/v1/TableRule';
import GlobalRuleNew from '../global-rule/GlobalRuleNew';
import CustomRuleNew from '../custom-rule/CustomRuleNew';
import ClientRuleNew from '../client-rule/ClientRuleNew';
import TableRuleNew from '../table-rule/v2/TableRuleNew';
import { AuthContext } from '../../context/AuthProvider';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 2 }}>
          <div>{children}</div>
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

const StyledTabs = styled((props) => (
  <Tabs {...props} TabIndicatorProps={{ children: <span className="MuiTabs-indicatorSpan" /> }} />
))({
  '& .MuiTabs-indicator': {
    display: 'flex',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  '& .MuiTabs-indicatorSpan': {
    maxWidth: 40,
    width: '100%',
    backgroundColor: '#0dd398',
  },
});

const StyledTab = styled((props) => <Tab disableRipple {...props} />)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: theme.typography.fontWeightRegular,
  fontSize: theme.typography.pxToRem(15),
  marginRight: theme.spacing(1),
  '&.Mui-selected': {
    color: '#0dd398',
  },
  '&.Mui-focusVisible': {
    backgroundColor: 'rgba(100, 95, 228, 0.32)',
  },
}));
export default function RuleEnginePannel() {
  const [value, setValue] = React.useState(0);
  const { userRole } = React.useContext(AuthContext);
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <StyledTabs value={value} onChange={handleChange} centered>
        <StyledTab label="Table Rule" style={{ fontWeight: 'bold' }} {...a11yProps(0)} />
        <StyledTab label="Client Rule" style={{ fontWeight: 'bold' }} {...a11yProps(1)} />
        <StyledTab label="Custom Rule" style={{ fontWeight: 'bold' }} {...a11yProps(2)} />
        <StyledTab label="Global Rule" style={{ fontWeight: 'bold' }} {...a11yProps(3)} />
      </StyledTabs>
      <TabPanel value={value} index={0}>
        <TableRuleNew userRole={userRole} />
      </TabPanel>
      <TabPanel value={value} index={1}>
        <ClientRuleNew userRole={userRole} />
      </TabPanel>
      <TabPanel value={value} index={2}>
        <CustomRuleNew userRole={userRole} />
      </TabPanel>
      <TabPanel value={value} index={3}>
        <GlobalRuleNew userRole={userRole} />
      </TabPanel>
    </Box>
  );
}
