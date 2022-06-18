import { gql, useApolloClient } from '@apollo/client';

const writeAuthDataToStorage = ({ accessToken, user }) => {
  localStorage.setItem('authorized', '1');
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('username', user.username);
};

const deleteAuthDataInStorage = () => {
  localStorage.setItem('authorized', '');
  localStorage.setItem('accessToken', '');
  localStorage.setItem('username', '');
};

const readAuthDataFromStorage = () => {
  const authData = {};
  authData.authorized = Boolean(localStorage.getItem('authorized'));
  if (authData.authorized) {
    authData.accessToken = localStorage.getItem('accessToken');
    authData.user = {};
    authData.user.username = localStorage.getItem('username');
  }
  return authData;
};

const writeAuthDataToCache = (client, { accessToken, user }) => {
  client.writeQuery({
    query: gql`
      query SetAuth($id: ID!) {
        auth(id: $id) {
          id
          authorized
          accessToken
          user {
            username
          }
        }
      }
    `,
    data: {
      auth: {
        id: 0,
        authorized: true,
        accessToken,
        user
      }
    },
    variables: {
      id: 0
    }
  });
};

const initAuthDataInCache = (client) => {
  client.writeQuery({
    query: gql`
      query SetAuth($id: ID!) {
        auth(id: $id) {
          id
          authorized
          accessToken
          user {
            username
          }
        }
      }
    `,
    data: {
      auth: {
        id: 0,
        authorized: false,
        accessToken: null,
        user: null
      }
    },
    variables: {
      id: 0
    }
  });
};

export const saveAuthData = (client, { accessToken, user }) => {
  writeAuthDataToStorage({ accessToken, user });
  writeAuthDataToCache(client, { accessToken, user });
};

export const loadAuthData = (client) => {
  const authData = readAuthDataFromStorage();
  if (authData.authorized) {
    writeAuthDataToCache(client, {
      accessToken: authData.accessToken,
      user: authData.user
    });
  } else {
    initAuthDataInCache(client);
  }
};

export const clearAuthData = async (client) => {
  deleteAuthDataInStorage();
  initAuthDataInCache(client);
};

export const isAuthorized = (client) => {
  const { auth } = client.readQuery({
    query: gql`
      query GetAuthorized($id: ID!) {
        auth(id: $id) {
          authorized
        }
      }
    `,
    variables: {
      id: 0
    }
  });
  return auth.authorized;
};

export const getAuthToken = (client) => {
  const { auth } = client.readQuery({
    query: gql`
      query GetAccessToken($id: ID!) {
        auth(id: $id) {
          accessToken
        }
      }
    `,
    variables: {
      id: 0
    }
  });
  return auth.accessToken;
};

export const useUserInfo = () => {
  const client = useApolloClient();
  const { auth } = client.readQuery({
    query: gql`
      query GetUserInfo($id: ID!) {
        auth(id: $id) {
          user {
            username
          }
        }
      }
    `,
    variables: {
      id: 0
    }
  });
  return auth.user;
};
