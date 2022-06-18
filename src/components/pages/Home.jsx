import { gql, useQuery } from '@apollo/client';
import { Box } from '@mui/material';
import React from 'react';

import LayoutMain from '@/components/layout/LayoutMain';
import WorkList from '@/components/layout/WorkList';

export const WORKS_QUERY = gql`
  query Works($after: Int) {
    works(after: $after) {
      edges {
        node {
          id
          title
          coverFilename
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

function Home() {
  const { data, fetchMore } = useQuery(WORKS_QUERY);
  const fetchNextPage = () => {
    if (data.works.pageInfo.hasNextPage) {
      fetchMore({
        variables: {
          after: data.works.pageInfo.endCursor
        }
      });
    }
  };

  return (
    <LayoutMain>
      {data && (
        <Box
          sx={{
            mt: 18,
            mb: 14
          }}
        >
          <WorkList
            works={data.works.edges.map(({ node: work }) => work)}
            fetchNextPage={fetchNextPage}
          />
        </Box>
      )}
    </LayoutMain>
  );
}

export default Home;
