import { gql, useQuery } from '@apollo/client';
import { Box, Typography } from '@mui/material';
import React from 'react';

import LayoutMain from '@/components/layout/LayoutMain';
import WorkList from '@/components/layout/WorkList';

export const MY_FAVORITES_QUERY = gql`
  query MyFavorites($after: Int) {
    myFavorites(after: $after) {
      edges {
        node {
          work {
            id
            title
            coverFilename
          }
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

function MyFavorites() {
  const { data, fetchMore } = useQuery(MY_FAVORITES_QUERY, {
    context: { authRequired: true }
  });
  const fetchNextPage = () => {
    if (data.myFavorites.pageInfo.hasNextPage) {
      fetchMore({
        variables: {
          after: data.myFavorites.pageInfo.endCursor
        }
      });
    }
  };

  return (
    <LayoutMain>
      {data && (
        <Box
          sx={{
            mt: 14,
            mb: 14
          }}
        >
          <Box
            sx={{
              mb: 8,
              textAlign: 'center'
            }}
          >
            <Typography
              variant="h2"
              sx={{
                mb: 4,
                color: 'secondary.main',
                fontWeight: 900
              }}
            >
              My Favorites
            </Typography>
          </Box>
          <WorkList
            works={data.myFavorites.edges.map(({ node: { work } }) => work)}
            fetchNextPage={fetchNextPage}
          />
        </Box>
      )}
    </LayoutMain>
  );
}

export default MyFavorites;
