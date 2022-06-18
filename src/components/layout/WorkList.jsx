import { Visibility as VisibilityIcon } from '@mui/icons-material';
import {
  Box,
  Card,
  CardMedia,
  Grid,
  IconButton,
  Paper,
  Typography
} from '@mui/material';
import React, { Fragment } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Waypoint } from 'react-waypoint';
import { sprintf } from 'sprintf-js';

import {
  WORK_COVER_FILENAME_FORMAT
} from '@/constants/environmentConstants';

function WorkList({ works, fetchNextPage }) {
  return (
    <Grid container spacing={4}>
      {works.map((work, index) => (
        <Fragment key={work.id}>
          <Grid item sm={6} xs={12}>
            <Box
              sx={{
                'position': 'relative',
                'mb': 3,
                'p': '6% 6% 0',
                'bgcolor': '#f3f5f9',
                'border': 1,
                'borderColor': '#e3e9ef',
                'borderRadius': '0.5rem',
                'overflow': 'hidden',
                '&:hover': {
                  '& .overlay': {
                    opacity: 1
                  }
                }
              }}
            >
              <Paper
                elevation={3}
                sx={{
                  borderRadius: '0.5rem'
                }}
                component={Card}
              >
                <CardMedia
                  image={sprintf(WORK_COVER_FILENAME_FORMAT, { filename: work.coverFilename })}
                  component="img"
                />
              </Paper>
              <RouterLink to={`/works/${work.id}`} data-test="workEntry" data-test-index={index}>
                <Box
                  className="overlay"
                  sx={{
                    display: 'flex',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    bgcolor: 'rgba(0,0,0, 0.54)',
                    opacity: 0,
                    borderRadius: '0.5rem',
                    justifyContent: 'center',
                    alignItems: 'center',
                    transition: '0.3s ease-in-out'
                  }}
                >
                  <IconButton
                    size="medium"
                    disableRipple
                    sx={{
                      bgcolor: 'white'
                    }}
                  >
                    <VisibilityIcon />
                  </IconButton>
                </Box>
              </RouterLink>
            </Box>
            <Typography
              sx={{
                textAlign: 'center',
                color: '#2B3445',
                fontWeight: 700,
                whiteSpace: 'pre-wrap'
              }}
              component="h3"
            >
              {work.title}
            </Typography>
          </Grid>
          {index === works.length - 4 && (
            <Waypoint
              onEnter={fetchNextPage}
            />
          )}
        </Fragment>
      ))}
    </Grid>
  );
}

export default WorkList;
