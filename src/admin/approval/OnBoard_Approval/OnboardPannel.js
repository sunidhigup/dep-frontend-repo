import * as React from 'react';
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Header from './Header';
import ClientApprovalData from './ClientApprovalData';
import BatchApprovalData from './BatchApprovalData';
import JobApprovalData from './JobApprovalData';

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
                <Box sx={{ p: 3 }}>
                    <Typography>{children}</Typography>
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

export default function BasicTabs() {
    const [value, setValue] = React.useState(0);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    return (
        <Box sx={{ width: '100%' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
                    <Tab label="Client Approval" {...a11yProps(0)} />
                    <Tab label="Batch Approval" {...a11yProps(1)} />
                    <Tab label="Job Approval" {...a11yProps(2)} />
                </Tabs>
            </Box>
            <TabPanel value={value} index={0}>
                <Header name="Client Approval List" />
                <div style={{ border: '2px solid black' }}>
                    <ClientApprovalData />
                </div>
            </TabPanel>
            <TabPanel value={value} index={1}>
                <Header name="Batch Approval List" />
                <div style={{ border: '2px solid black' }}>
                    <BatchApprovalData />
                </div>
            </TabPanel>
            <TabPanel value={value} index={2}>
                <Header name="Job Approval List"/>
                <div style={{ border: '2px solid black' }}>
                   <JobApprovalData />
                </div>
            </TabPanel>
        </Box>
    );
}
