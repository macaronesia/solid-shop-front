import {
  Box,
  Container
} from '@mui/material';
import React from 'react';

import HeaderMain from '@/components/layout/HeaderMain';

function LayoutMain({ children }) {
  return (
    <Box>
      <HeaderMain />
      <Container maxWidth="lg">
        {children}
      </Container>
    </Box>
  );
}

export default LayoutMain;
