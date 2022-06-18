import {
  gql,
  useApolloClient,
  useQuery
} from '@apollo/client';
import {
  AccountCircle as AccountCircleIcon,
  Menu as MenuIcon
} from '@mui/icons-material';
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Toolbar,
  Tooltip,
  Typography
} from '@mui/material';
import React, { useState } from 'react';
import {
  Link as RouterLink,
  useLocation,
  useNavigate
} from 'react-router-dom';

import {
  clearAuthData,
  isAuthorized,
  useUserInfo
} from '@/core/auth';

import logo from '@/assets/images/cube-3d.png';

export const CATEGORIES_QUERY = gql`
  query Categories {
    categories {
      edges {
        node {
          id
          name
        }
      }
    }
  }
`;

function HeaderMain() {
  const [navOpen, setNavOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleOpenNavMenu = () => {
    setNavOpen(true);
  };
  const handleCloseNavMenu = () => {
    setNavOpen(false);
  };
  const handleOpenUserMenu = () => {
    setUserMenuOpen(true);
  };
  const handleCloseUserMenu = () => {
    setUserMenuOpen(false);
  };

  const { data: categoriesQueryData } = useQuery(CATEGORIES_QUERY);

  const client = useApolloClient();
  const authorized = isAuthorized(client);
  const userInfo = useUserInfo();
  const location = useLocation();

  const navigate = useNavigate();
  const logout = async () => {
    await clearAuthData(client);
    navigate('/');
  };

  return (
    <AppBar
      sx={{
        px: { xs: 1, md: 4 }
      }}
    >
      <Toolbar disableGutters>
        <RouterLink to="/">
          <Box
            sx={{
              display: { xs: 'none', md: 'flex' },
              width: 40,
              height: 40,
              mr: 2
            }}
            component="img"
            src={logo}
          />
        </RouterLink>
        <Box
          sx={{
            display: { xs: 'flex', md: 'none' },
            flexGrow: 1
          }}
        >
          <IconButton
            size="large"
            color="inherit"
            onClick={handleOpenNavMenu}
          >
            <MenuIcon />
          </IconButton>
          <Drawer
            anchor="left"
            open={navOpen}
            onClose={handleCloseNavMenu}
          >
            <Box
              sx={{
                width: 250
              }}
              onClick={handleCloseNavMenu}
            >
              <List>
                {categoriesQueryData && categoriesQueryData.categories.edges.map(
                  ({ node: category }) => (
                    <ListItemButton
                      key={category.id}
                      component={RouterLink}
                      to={`/categories/${category.id}`}
                    >
                      <ListItemText
                        primary={category.name}
                        sx={{
                          whiteSpace: 'pre-wrap'
                        }}
                      />
                    </ListItemButton>
                  )
                )}
              </List>
            </Box>
          </Drawer>
        </Box>
        <Typography
          variant="h6"
          noWrap
          sx={{
            display: { xs: 'flex', md: 'none' },
            color: 'inherit',
            flexGrow: 1,
            textDecoration: 'inherit'
          }}
          component={RouterLink}
          to="/"
        >
          SOLID SHOP
        </Typography>
        <Box
          sx={{
            display: { xs: 'none', md: 'flex' },
            flexGrow: 1
          }}
        >
          {categoriesQueryData && categoriesQueryData.categories.edges.map(
            ({ node: category }) => (
              <Button
                key={category.id}
                sx={{
                  display: 'block',
                  minWidth: 0,
                  color: 'white',
                  whiteSpace: 'pre-wrap'
                }}
                onClick={handleCloseNavMenu}
                component={RouterLink}
                to={`/categories/${category.id}`}
              >
                {category.name}
              </Button>
            )
          )}
        </Box>

        <Box sx={{ flexGrow: 0 }}>
          <Tooltip title="Open settings">
            <IconButton
              size="large"
              color="inherit"
              onClick={handleOpenUserMenu}
              data-test="openUserMenu"
            >
              {authorized ? (
                <Avatar>{userInfo.username[0]}</Avatar>
              ) : (
                <AccountCircleIcon data-test="anonUserIcon" />
              )}
            </IconButton>
          </Tooltip>
          <Drawer
            anchor="right"
            open={userMenuOpen}
            onClose={handleCloseUserMenu}
          >
            <Box
              sx={{
                width: 250
              }}
              onClick={handleCloseUserMenu}
            >
              <List>
                {authorized ? (
                  <ListItem>
                    <ListItemText primary={`Hi, ${userInfo.username}`} />
                  </ListItem>
                ) : (
                  <ListItemButton
                    component={RouterLink}
                    to="/login"
                    state={{
                      from: location
                    }}
                    data-test="loginEntry"
                  >
                    <ListItemText primary="Sign In" />
                  </ListItemButton>
                )}
              </List>
              <Divider />
              <List>
                <ListItemButton
                  component={RouterLink}
                  to="/favorites"
                  data-test="favoritesEntry"
                >
                  <ListItemText primary="My Favorites" />
                </ListItemButton>
                {authorized && (
                  <ListItemButton
                    onClick={logout}
                    data-test="logout"
                  >
                    <ListItemText primary="Sign Out" />
                  </ListItemButton>
                )}
              </List>
            </Box>
          </Drawer>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default HeaderMain;
