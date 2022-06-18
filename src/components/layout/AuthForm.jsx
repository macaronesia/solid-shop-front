import {
  Box,
  Button,
  TextField
} from '@mui/material';
import Ajv from 'ajv';
import ajvErrors from 'ajv-errors';
import { Formik } from 'formik';
import React from 'react';

const ajv = new Ajv({ allErrors: true });
ajvErrors(ajv);
const schema = {
  type: 'object',
  properties: {
    username: {
      type: 'string',
      minLength: 1,
      errorMessage: {
        minLength: 'Required'
      }
    },
    password: {
      type: 'string',
      minLength: 4,
      errorMessage: {
        minLength: 'Must be between 4 and 32 characters long'
      }
    }
  }
};
const validate = ajv.compile(schema);

const validateForm = (values) => {
  const errors = {};
  if (!validate(values)) {
    Object.keys(schema.properties).forEach((key) => {
      const error = validate.errors.find(
        (err) => err.instancePath === `/${key}` && err.keyword === 'errorMessage'
      );
      if (error) {
        errors[key] = error.message;
      }
    });
  }
  return errors;
};

function AuthForm({
  initialValues,
  onSubmit,
  loading,
  authType
}) {
  return (
    <Formik
      initialValues={initialValues}
      validate={validateForm}
      onSubmit={onSubmit}
    >
      {
        ({
          values,
          errors,
          touched,
          handleChange,
          handleBlur,
          handleSubmit
        }) => (
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Username"
              name="username"
              autoComplete="username"
              autoFocus
              onChange={handleChange}
              onBlur={(e) => {
                setTimeout(() => {
                  handleBlur(e);
                }, 200);
              }}
              value={values.username}
              error={errors.username && touched.username}
              helperText={touched.username && errors.username}
              inputProps={{
                maxLength: 32
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete={authType === 'login' ? 'current-password' : 'new-password'}
              onChange={handleChange}
              onBlur={(e) => {
                setTimeout(() => {
                  handleBlur(e);
                }, 200);
              }}
              value={values.password}
              error={errors.password && touched.password}
              helperText={touched.password && errors.password}
              inputProps={{
                maxLength: 32
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
              data-test="submit"
            >
              {authType === 'login' ? 'Sign In' : 'Sign Up'}
            </Button>
          </Box>
        )
      }
    </Formik>
  );
}

export default AuthForm;
