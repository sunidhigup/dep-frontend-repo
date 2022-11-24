import PropTypes from 'prop-types';
import { useContext, useEffect } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
// material
import { styled } from '@mui/material/styles';
import { Box, Link, Button, Drawer, Typography, Avatar, Stack, Divider } from '@mui/material';
// hooks
import useResponsive from '../../hooks/useResponsive';
// components
import Scrollbar from '../../components/Scrollbar';
import NavSection from '../../components/NavSection';
//
import navConfig from './NavConfig';

import logo from '../../images/logo1.png';
import { AuthContext } from '../../context/AuthProvider';

// ----------------------------------------------------------------------

const DRAWER_WIDTH = 220;

const RootStyle = styled('div')(({ theme }) => ({
  [theme.breakpoints.up('lg')]: {
    flexShrink: 0,
    width: DRAWER_WIDTH,
  },
}));

// ----------------------------------------------------------------------

// DashboardSidebar.propTypes = {
//   isOpenSidebar: PropTypes.bool,
//   onCloseSidebar: PropTypes.func,
// };

export default function DashboardSidebar({ toggleSidebar }) {
  const { pathname } = useLocation();
  const { user } = useContext(AuthContext);

  const isDesktop = useResponsive('up', 'lg');

  // useEffect(() => {
  //   if (isOpenSidebar) {
  //     onCloseSidebar();
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [pathname]);

  const renderContent = (
    <Scrollbar
      sx={{
        height: 1,
        backgroundColor: '#00013F',

        '& .simplebar-content': { height: 1, display: 'flex', flexDirection: 'column' },
      }}
    >
      <Box sx={{ px: 2.5, py: 1.5, display: 'inline-flex', justifyContent: 'center', alignItems: 'center' }}>
        {toggleSidebar && (
          <div>
            <img src={logo} width="100" alt="Nagarro" style={{ filter: 'contrast(200%)' }} />
          </div>
        )}

        {!toggleSidebar && (
          <div style={{ display: 'flex', alignItems: 'center', marginRight: '10px' }}>
            <img src={logo} width="50" alt="Nagarro" style={{ filter: 'contrast(200%)' }} />
          </div>
        )}

        {!toggleSidebar && <div style={{ color: '#fff' }}>Hi {user}</div>}
      </Box>
      <Divider style={{ backgroundColor: '#002855' }} />

      <NavSection navConfig={navConfig} />

      <Box sx={{ flexGrow: 1 }} />
    </Scrollbar>
  );

  return (
    <RootStyle style={{ width: toggleSidebar ? 65 : 220 }}>
      {!isDesktop && (
        <Drawer
          // open={isOpenSidebar}
          // onClose={onCloseSidebar}
          PaperProps={{
            sx: { width: toggleSidebar ? 65 : 220 },
          }}
        >
          {renderContent}
        </Drawer>
      )}

      {isDesktop && (
        <Drawer
          open
          variant="persistent"
          PaperProps={{
            sx: {
              width: toggleSidebar ? 65 : 220,
              bgcolor: 'background.default',
              borderRightStyle: 'dashed',
            },
          }}
        >
          {renderContent}
        </Drawer>
      )}
    </RootStyle>
  );
}
