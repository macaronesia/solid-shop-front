import {
  Box,
  Container
} from '@mui/material';
import React from 'react';

import HeaderAuth from '@/components/layout/HeaderAuth';

function LayoutAuth({ children }) {
  return (
    <Box>
      <HeaderAuth />
      <Container maxWidth="xs" component="main">
        {children}
      </Container>
    </Box>
  );
}

export default LayoutAuth;
