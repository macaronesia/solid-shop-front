import { gql, useQuery } from '@apollo/client';
import { Box, Typography } from '@mui/material';
import React from 'react';
import { useParams } from 'react-router-dom';

import LayoutMain from '@/components/layout/LayoutMain';
import WorkList from '@/components/layout/WorkList';

export const WORKS_QUERY = gql`
  query Works($categoryId: Int!, $after: Int) {
    category(id: $categoryId) {
      id
      name
    }
    works(categoryId: $categoryId, after: $after) {
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

function Category() {
  const { id: paramsId } = useParams();
  const categoryId = parseInt(paramsId, 10);

  const { data, fetchMore } = useQuery(WORKS_QUERY, {
    variables: {
      categoryId
    }
  });
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
                fontWeight: 900,
                whiteSpace: 'pre-wrap'
              }}
            >
              {data.category.name}
            </Typography>
          </Box>
          <WorkList
            works={data.works.edges.map(({ node: work }) => work)}
            fetchNextPage={fetchNextPage}
          />
        </Box>
      )}
    </LayoutMain>
  );
}

export default Category;
