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

export const LOGIN_MUTATION = gql`
  mutation Login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      accessToken
      user {
        username
      }
    }
  }
`;

function Login() {
  const location = useLocation();
  const navigate = useNavigate();
  const client = useApolloClient();

  const [login, { loading }] = useMutation(LOGIN_MUTATION);

  const initialValues = {
    username: '',
    password: ''
  };
  const onSubmit = async (values, actions) => {
    try {
      const { data } = await login({ variables: values });
      saveAuthData(client, {
        accessToken: data.login.accessToken,
        user: data.login.user
      });
      navigate(location.state && location.state.from ? location.state.from.pathname : '/', { replace: true });
    } catch (e) {
      if (e.graphQLErrors && e.graphQLErrors.length) {
        switch (e.graphQLErrors[0].message) {
          case 'user_not_found':
            alertMessage('That account doesn\'t exist.');
            break;
          case 'password_incorrect':
            actions.setFieldValue('password', '', false);
            actions.setTouched({ password: false });
            alertMessage('That password is incorrect.');
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
          Sign in
        </Typography>
        <AuthForm
          initialValues={initialValues}
          onSubmit={onSubmit}
          loading={loading}
          authType="login"
        />
        <Grid container>
          <Grid item>
            <Link
              variant="body2"
              component={RouterLink}
              to="/register"
              {...{
                ...(location.state && location.state.from
                  ? { state: { from: location.state.from } } : {})
              }}
            >
              Don&#39;t have an account? Sign Up
            </Link>
          </Grid>
        </Grid>
      </Box>
    </LayoutAuth>
  );
}

export default Login;
