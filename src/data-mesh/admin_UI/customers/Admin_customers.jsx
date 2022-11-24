import * as React from 'react';
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { AuthContext } from '../../context/AuthProvider';
import User_or_Admin from '../../user_or_admin/User_or_Admin';
import Header from '../../navbar/Header';
import Customer_Approved_users from './Customer_Approved_users';
import Customer_Requested_users from './Customer_Requested_users';
import { Navigate, useNavigate } from 'react-router-dom';
import { HOME } from '../../constants/Constant';

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
    const navigate = useNavigate()
    const [value, setValue] = React.useState(0);
    const { Username } = React.useContext(AuthContext)
    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    return (
        <>
            {
                Username === undefined
                    ?
                    <Navigate to={`${HOME}`} />
                    :
                    <>
                        <Header />
                        <br /><br /><br />
                        <Box sx={{ width: '100%' }}>
                            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                                <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
                                    <Tab label="Customer Approved users" style={{ fontWeight: 'bold' }} {...a11yProps(0)} />
                                    <Tab label="Customer Requested user" style={{ fontWeight: 'bold' }}  {...a11yProps(1)} />
                                </Tabs>
                            </Box>
                            <TabPanel value={value} index={0}>
                                <Customer_Approved_users />
                            </TabPanel>
                            <TabPanel value={value} index={1}>
                                <Customer_Requested_users />
                            </TabPanel>
                        </Box>
                    </>
            }
        </>
    );
}
