import {
  ApolloClient,
  ApolloLink,
  ApolloProvider,
  from,
  HttpLink,
  InMemoryCache,
  split
} from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { getMainDefinition } from '@apollo/client/utilities';
import { CssBaseline } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { createClient } from 'graphql-ws';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';

import RootContainer from '@/components/RootContainer';
import {
  HTTP_LINK_URL,
  WS_LINK_URL
} from '@/constants/environmentConstants';
import {
  clearAuthData,
  getAuthToken,
  loadAuthData
} from '@/core/auth';
import fieldPolicies from '@/core/fieldPolicies';
import { alertMessage } from '@/utils/alert';

let client;

const httpLink = new HttpLink({
  uri: HTTP_LINK_URL
});

const wsLink = new GraphQLWsLink(createClient({
  url: WS_LINK_URL
}));

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return definition.kind === 'OperationDefinition' && definition.operation === 'subscription';
  },
  wsLink,
  httpLink
);

const authMiddleware = new ApolloLink((operation, forward) => {
  const context = operation.getContext();
  if (context.authRequired) {
    const accessToken = getAuthToken(client);
    operation.setContext(({ headers = {} }) => ({
      headers: {
        ...headers,
        'authorization': `Bearer ${accessToken}`
      }
    }));
  }
  return forward(operation);
});

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    if (['UNAUTHENTICATED'].includes(graphQLErrors[0].extensions.code)) {
      clearAuthData(client)
        .then(() => {
          window.location.href = '#/login';
        });
    }
  }
  if (networkError && networkError.name !== 'ServerError') {
    alertMessage('Network error');
  }
});

const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: fieldPolicies
    }
  }
});

client = new ApolloClient({
  link: from([
    errorLink,
    authMiddleware,
    splitLink
  ]),
  cache,
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'network-only'
    },
    query: {
      fetchPolicy: 'network-only'
    }
  }
});

loadAuthData(client);

const theme = createTheme({
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          margin: 0
        }
      }
    }
  }
});

const container = document.getElementById('root');
const root = createRoot(container);
root.render(
  <HashRouter>
    <ApolloProvider client={client}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <RootContainer />
      </ThemeProvider>
    </ApolloProvider>
  </HashRouter>
);
