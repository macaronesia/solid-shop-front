import {
  gql,
  useApolloClient,
  useMutation,
  useQuery
} from '@apollo/client';
import {
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon
} from '@mui/icons-material';
import {
  Box,
  Grid,
  IconButton,
  Typography
} from '@mui/material';
import React, { useState } from 'react';
import {
  useLocation,
  useNavigate,
  useParams
} from 'react-router-dom';
import { sprintf } from 'sprintf-js';

import LayoutMain from '@/components/layout/LayoutMain';
import ModelViewer from '@/components/layout/ModelViewer';
import {
  WORK_MODEL_FILENAME_FORMAT
} from '@/constants/environmentConstants';
import { isAuthorized } from '@/core/auth';

export const WORK_QUERY = gql`
  query Work($id: Int!, $authorized: Boolean!) {
    work(id: $id) {
      id
      title
      category {
        id
        name
      }
      modelFilename
      coverFilename
    }
    isWorkInFavorites(id: $id) @include(if: $authorized)
  }
`;

export const ADD_FAVORITE_MUTATION = gql`
  mutation AddFavorite($id: Int!) {
    addFavorite(id: $id)
  }
`;

export const REMOVE_FAVORITE_MUTATION = gql`
  mutation RemoveFavorite($id: Int!) {
    removeFavorite(id: $id)
  }
`;

function Work() {
  const { id: paramsId } = useParams();
  const id = parseInt(paramsId, 10);
  const client = useApolloClient();
  const authorized = isAuthorized(client);

  const [favoriteAdded, setFavoriteAdded] = useState(null);

  const { data } = useQuery(WORK_QUERY, {
    context: { authRequired: authorized },
    variables: {
      id,
      authorized
    }
  });

  const [addFavorite, { loading: addFavoriteLoading }] = useMutation(
    ADD_FAVORITE_MUTATION,
    {
      context: { authRequired: true },
      variables: {
        id
      }
    }
  );

  const [removeFavorite, { loading: removeFavoriteLoading }] = useMutation(
    REMOVE_FAVORITE_MUTATION,
    {
      context: { authRequired: true },
      variables: {
        id
      }
    }
  );

  const location = useLocation();
  const navigate = useNavigate();
  const clickAddFavorite = async () => {
    if (!authorized) {
      navigate('/login', {
        state: {
          from: location
        }
      });
      return;
    }
    await addFavorite();
    setFavoriteAdded(true);
  };

  const clickRemoveFavorite = async () => {
    await removeFavorite();
    setFavoriteAdded(false);
  };

  return (
    <LayoutMain>
      <Box
        sx={{
          mt: 20,
          mb: 14
        }}
      >
        {data && (
          <>
            <ModelViewer
              modelUrl={sprintf(WORK_MODEL_FILENAME_FORMAT, { filename: data.work.modelFilename })}
            />
            <Grid
              container
              spacing={1}
              alignItems="center"
              sx={{
                mt: 1
              }}
            >
              <Grid item xs>
                <Typography
                  variant="h6"
                  sx={{
                    whiteSpace: 'pre-wrap'
                  }}
                  component="div"
                >
                  {data.work.title}
                </Typography>
              </Grid>
              <Grid item xs="auto">
                {(favoriteAdded == null ? authorized && data.isWorkInFavorites : favoriteAdded) ? (
                  <IconButton
                    size="large"
                    disabled={removeFavoriteLoading}
                    onClick={clickRemoveFavorite}
                  >
                    <FavoriteIcon />
                  </IconButton>
                ) : (
                  <IconButton
                    size="large"
                    disabled={addFavoriteLoading}
                    onClick={clickAddFavorite}
                  >
                    <FavoriteBorderIcon />
                  </IconButton>
                )}
              </Grid>
            </Grid>
          </>
        )}
      </Box>
    </LayoutMain>
  );
}

export default Work;
