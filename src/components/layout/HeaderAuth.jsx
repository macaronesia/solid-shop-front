import {
  AppBar,
  Box,
  Toolbar,
  Typography
} from '@mui/material';
import React from 'react';
import { Link as RouterLink } from 'react-router-dom';

import logo from '@/assets/images/cube-3d.png';

function HeaderAuth() {
  return (
    <AppBar
      position="static"
      sx={{
        px: { xs: 2, md: 4 }
      }}
    >
      <Toolbar disableGutters>
        <RouterLink to="/">
          <Box
            sx={{
              width: 40,
              height: 40,
              mr: 2
            }}
            component="img"
            src={logo}
          />
        </RouterLink>
        <Typography
          variant="h6"
          sx={{
            flexGrow: 1
          }}
          component="div"
        >
          SOLID SHOP
        </Typography>
      </Toolbar>
    </AppBar>
  );
}

export default HeaderAuth;
