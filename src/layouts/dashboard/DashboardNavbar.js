import { useState } from 'react';
import PropTypes from 'prop-types';
// material
import { alpha, styled } from '@mui/material/styles';
import { Box, Stack, AppBar, Toolbar, IconButton } from '@mui/material';
import FormatIndentDecreaseIcon from '@mui/icons-material/FormatIndentDecrease';
import FormatIndentIncreaseIcon from '@mui/icons-material/FormatIndentIncrease';
// components
import Iconify from '../../components/Iconify';
//
import Searchbar from './Searchbar';
import AccountPopover from './AccountPopover';
import LanguagePopover from './LanguagePopover';
import NotificationsPopover from './NotificationsPopover';

// ----------------------------------------------------------------------

const DRAWER_WIDTH = 220;
const APPBAR_MOBILE = 64;
const APPBAR_DESKTOP = 52;

const RootStyle = styled(AppBar)(({ theme }) => ({
  boxShadow: 'none',
  backdropFilter: 'blur(6px)',
  WebkitBackdropFilter: 'blur(6px)', // Fix on Mobile
  backgroundColor: '#fff',
  [theme.breakpoints.up('lg')]: {
    width: `calc(100% - ${DRAWER_WIDTH + 1}px)`,
  },
}));

const ToolbarStyle = styled(Toolbar)(({ theme }) => ({
  minHeight: APPBAR_MOBILE,
  [theme.breakpoints.up('lg')]: {
    minHeight: APPBAR_DESKTOP,
    padding: theme.spacing(0, 5),
  },
}));

// ----------------------------------------------------------------------

// DashboardNavbar.propTypes = {
//   onOpenSidebar: PropTypes.func,
// };

export default function DashboardNavbar({ setToggleSidebar, toggleSidebar }) {
  return (
    <RootStyle style={{ width: toggleSidebar ? `calc(100% - ${65 + 1}px)` : `calc(100% - ${220 + 1}px)` }}>
      <ToolbarStyle>
        <IconButton
          onClick={() => {
            // onOpenSidebar();
            setToggleSidebar(!toggleSidebar);
          }}
          sx={{ ml: '-20px', mr: 1, color: 'text.primary', display: `` }}
        >
          {/* <Iconify icon="eva:menu-2-fill" /> */}
          {!toggleSidebar && <FormatIndentDecreaseIcon />}
          {toggleSidebar && <FormatIndentIncreaseIcon />}
        </IconButton>

        {/* <Searchbar /> */}
        <h3 style={{ fontSize: 30, color: '#003566', fontWeight: 'bold' }}>Data Engineering Platform</h3>
        <Box sx={{ flexGrow: 1 }} />

        <Stack direction="row" alignItems="center" spacing={{ xs: 0.5, sm: 1.5 }}>
          {/* <LanguagePopover /> */}
          {/* <NotificationsPopover /> */}
          <AccountPopover />
        </Stack>
      </ToolbarStyle>
    </RootStyle>
  );
}
