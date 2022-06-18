import { useApolloClient } from '@apollo/client';
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

import { isAuthorized } from '@/core/auth';

function ProtectedRoute({ children }) {
  const client = useApolloClient();
  const authorized = isAuthorized(client);
  const location = useLocation();
  return authorized ? children : <Navigate to="/login" replace state={{ from: location }} />;
}

export default ProtectedRoute;
