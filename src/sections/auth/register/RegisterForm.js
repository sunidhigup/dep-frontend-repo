import * as Yup from 'yup';
import React, { useState } from 'react';
import { useSnackbar } from 'notistack';
import { useFormik, Form, FormikProvider } from 'formik';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import { Spin } from 'antd';
import Box from '@mui/material/Box';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Chip from '@mui/material/Chip';
// material
import { Stack, TextField, IconButton, InputAdornment, Button, MenuItem } from '@mui/material';
// component
import Iconify from '../../../components/Iconify';
import { signup } from "../../../api's/AuthUserApi";

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const names = [
  'user',
  'read-only',
  'executor'
];

function getStyles(name, personName, theme) {
  return {
    fontWeight:
      personName.indexOf(name) === -1
        ? theme.typography.fontWeightRegular
        : theme.typography.fontWeightMedium,
  };
}

// ----------------------------------------------------------------------

const DomainTypes = [
  {
    value: 'sales',
    label: 'sales',
  },
  {
    value: 'customers',
    label: 'customers',
  },
]

export default function RegisterForm() {
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const theme = useTheme();
  const [personName, setPersonName] = React.useState([]);
  const [loading, setloading] = useState(false)

  const [showPassword, setShowPassword] = useState(false);

  const form_signup = async (values) => {
    try {

      setloading(true)
      const data = {
        username: values.username,
        email: values.email,
        password: values.password,
        domainType: values.domains,
        // roles: personName
      };
      // console.log(data)

      const response = await signup(data)
      // console.log(response)
      if (response.status === 201) {
        enqueueSnackbar(`${data.username} is signup successfully`, {
          variant: 'success',
          autoHideDuration: 3000,
          anchorOrigin: { vertical: 'top', horizontal: 'right' },
        });
      }
      setloading(false)
    } catch (error) {
      enqueueSnackbar(`username or email already exist`, {
        variant: 'error',
        autoHideDuration: 3000,
        anchorOrigin: { vertical: 'top', horizontal: 'right' },
      });
    }
    setloading(false);
  };

  const RegisterSchema = Yup.object().shape({
    username: Yup.string().min(2, 'Too Short!').max(50, 'Too Long!').required('User Name is required'),
    email: Yup.string().email('Email must be a valid email address').required('Email is required'),
    password: Yup.string()
      .required('Password is required')
      .min(8, 'Password is too short - should be 8 chars minimum.')
      .matches(
        /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/,
        "Must Contain  One Uppercase, One Lowercase, One Number and one special case Character"
      ),
    domains: Yup.string().required('Domain Type is required'),
    // personName: Yup.array().required("Role is required")
  });

  const formik = useFormik({
    initialValues: {
      username: '',
      email: '',
      password: '',
      domains: '',
      // personName: []

    },
    validationSchema: RegisterSchema,
    onSubmit: (values) => {
      // if (personName.length === 0) {
      //   enqueueSnackbar(`Select atleast one role !`, {
      //     variant: 'error',
      //     autoHideDuration: 3000,
      //     anchorOrigin: { vertical: 'top', horizontal: 'right' },
      //   });
      // } else {
      // form_signup(values);
      // }
      form_signup(values);
      // navigate('/login', { replace: true });
    },
  });

  const { errors, touched, handleSubmit, isSubmitting, getFieldProps } = formik;


  const handleChange = (event) => {
    const {
      target: { value },
    } = event;
    setPersonName(
      // On autofill we get a stringified value.
      typeof value === 'string' ? value.split(',') : value,
    );
  };

  return (
    <>
      <FormikProvider value={formik}>
        <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
          <Stack spacing={3}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                fullWidth
                label="Username"
                {...getFieldProps('username')}
                error={Boolean(touched.username && errors.username)}
                helperText={touched.username && errors.username}
              />
            </Stack>

            <TextField
              fullWidth
              autoComplete="email"
              type="email"
              label="Email address"
              {...getFieldProps('email')}
              error={Boolean(touched.email && errors.email)}
              helperText={touched.email && errors.email}
            />

            <TextField
              fullWidth
              autoComplete="current-password"
              type={showPassword ? 'text' : 'password'}
              label="Password"
              {...getFieldProps('password')}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton edge="end" onClick={() => setShowPassword((prev) => !prev)}>
                      <Iconify icon={showPassword ? 'eva:eye-fill' : 'eva:eye-off-fill'} />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              error={Boolean(touched.password && errors.password)}
              helperText={touched.password && errors.password}
            />

            <TextField
              id="outlined-select-domain"
              select
              label="Select Domain"
              {...getFieldProps('domains')}
              error={Boolean(touched.domains && errors.domains)}
              helperText={touched.domains && errors.domains}
            >
              {DomainTypes.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>


            {/* <FormControl sx={{ m: 1 }}>
              <InputLabel id="demo-multiple-chip-label">Select Role</InputLabel>
              <Select
                labelId="demo-multiple-chip-label"
                id="demo-multiple-chip"
                multiple
                {...getFieldProps('personName')}
                error={Boolean(touched.personName && errors.personName)}
                helperText={touched.personName && errors.personName}
                value={personName}
                onChange={handleChange}
                input={<OutlinedInput id="select-multiple-chip" label="Select Role" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value} />
                    ))}
                  </Box>
                )}
                MenuProps={MenuProps}
              >
                {names.map((name) => (
                  <MenuItem
                    key={name}
                    value={name}
                    style={getStyles(name, personName, theme)}
                  >
                    {name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl> */}



            {
              loading && <Spin tip="submitting" />
            }
            {
              !loading &&
              <Button fullWidth size="large" type="submit" variant="contained" loading={isSubmitting}>
                Register
              </Button>
            }
          </Stack>
        </Form>
      </FormikProvider>
    </>
  );
}
