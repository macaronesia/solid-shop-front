import { gql, useSubscription } from '@apollo/client';
import { Close as CloseIcon } from '@mui/icons-material';
import {
  Button,
  IconButton,
  Snackbar
} from '@mui/material';
import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';

export const WORKS_SUBSCRIPTION = gql`
  subscription OnWorkCreated {
    workCreated {
      id
      title
    }
  }
`;

export const AUTO_HIDE_DURATION = 6000;

function NewWorkNotification() {
  const [open, setOpen] = useState(false);
  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  };

  const { data } = useSubscription(
    WORKS_SUBSCRIPTION,
    {
      onSubscriptionData: () => {
        setOpen(true);
      }
    }
  );

  return data && (
    <Snackbar
      key={data.workCreated.id}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      sx={{
        maxWidth: 8
      }}
      open={open}
      autoHideDuration={AUTO_HIDE_DURATION}
      onClose={handleClose}
      message={`New model "${data.workCreated.title}" has been added.`}
      action={(
        <>
          <Button
            color="secondary"
            size="small"
            onClick={handleClose}
            component={RouterLink}
            to={`/works/${data.workCreated.id}`}
            data-test="newWorkNotificationView"
          >
            VIEW
          </Button>
          <IconButton
            aria-label="close"
            color="inherit"
            sx={{ p: 0.5 }}
            onClick={handleClose}
            data-test="newWorkNotificationClose"
          >
            <CloseIcon />
          </IconButton>
        </>
      )}
      data-test="newWorkNotification"
      data-test-id={data.workCreated.id}
    />
  );
}

export default NewWorkNotification;
