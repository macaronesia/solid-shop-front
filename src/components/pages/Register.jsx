import {
  gql,
  useApolloClient,
  useMutation
} from '@apollo/client';
import { LockOutlined as LockOutlinedIcon } from '@mui/icons-material';
import {
  Avatar,
  Box,
  Grid,
  Link,
  Typography
} from '@mui/material';
import React from 'react';
import {
  Link as RouterLink,
  useLocation,
  useNavigate
} from 'react-router-dom';

import AuthForm from '@/components/layout/AuthForm';
import LayoutAuth from '@/components/layout/LayoutAuth';
import { saveAuthData } from '@/core/auth';
import { alertMessage } from '@/utils/alert';

export const REGISTER_MUTATION = gql`
  mutation Register($username: String!, $password: String!) {
    register(username: $username, password: $password) {
      accessToken
      user {
        username
      }
    }
  }
`;

function Register() {
  const location = useLocation();
  const navigate = useNavigate();
  const client = useApolloClient();

  const [register, { loading }] = useMutation(REGISTER_MUTATION);

  const initialValues = {
    username: '',
    password: ''
  };
  const onSubmit = async (values) => {
    try {
      const { data } = await register({ variables: values });
      saveAuthData(client, {
        accessToken: data.register.accessToken,
        user: data.register.user
      });
      navigate(location.state && location.state.from ? location.state.from.pathname : '/', { replace: true });
    } catch (e) {
      if (e.graphQLErrors && e.graphQLErrors.length) {
        switch (e.graphQLErrors[0].message) {
          case 'conflict':
            alertMessage('That username is taken. Try another.');
            break;
          default:
        }
      }
    }
  };
  return (
    <LayoutAuth>
      <Box
        sx={{
          display: 'flex',
          mt: 8,
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <Avatar
          sx={{
            m: 1,
            bgcolor: 'secondary.main'
          }}
        >
          <LockOutlinedIcon />
        </Avatar>
        <Typography variant="h5" component="h1">
          Sign up
        </Typography>
        <AuthForm
          initialValues={initialValues}
          onSubmit={onSubmit}
          loading={loading}
          authType="register"
        />
        <Grid container>
          <Grid item>
            <Link
              variant="body2"
              component={RouterLink}
              to="/login"
              {...{
                ...(location.state && location.state.from
                  ? { state: { from: location.state.from } } : {})
              }}
            >
              Already have an account? Sign in
            </Link>
          </Grid>
        </Grid>
      </Box>
    </LayoutAuth>
  );
}

export default Register;
