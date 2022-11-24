import * as Yup from 'yup';
import { useState, useContext } from 'react';
import axios from 'axios';
import { useSnackbar } from 'notistack';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useFormik, Form, FormikProvider } from 'formik';
// material
import { Link, Stack, Checkbox, TextField, IconButton, InputAdornment, FormControlLabel } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { Spin } from 'antd';
// component
import Iconify from '../../../components/Iconify';
import BASEURL from '../../../BaseUrl';
import { AuthContext } from '../../../context/AuthProvider';
import { signin } from "../../../api's/AuthUserApi";
// ----------------------------------------------------------------------

export default function LoginForm() {
  const navigate = useNavigate();
  const { loggedIn, setLoggedIn, setUser, setUserRole, setUserDomainType, setUserId } = useContext(AuthContext);
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setloading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  const LoginSchema = Yup.object().shape({
    username: Yup.string().required('Username is required'),
    password: Yup.string().required('Password is required'),
  });

  const formik = useFormik({
    initialValues: {
      username: '',
      password: '',
      remember: false,
    },
    validationSchema: LoginSchema,
    onSubmit: (values) => {
      authUser(values);
    },
  });

  const { errors, touched, values, isSubmitting, handleSubmit, getFieldProps } = formik;

  const authUser = async (values) => {
    setloading(true);

    const formField = {
      username: values.username,
      password: values.password,
    };

    try {
      // const response = await axios.post(`${BASEURL}/user/signin`, formField);
      // const res1 = await mapping();
      // if (res1.status === 200) {

      const response = await signin(formField);

      // let response = await axios.post(
      //   `${BASEURL}/user/signin-user`,
      //   formField,
      //   {
      //     withCredentials: true,
      //   }
      // );

      // let response = await loginApi(formField);
      if (response.status === 401) {
        enqueueSnackbar(response.data, {
          variant: 'error',
          autoHideDuration: 3000,
          anchorOrigin: { vertical: 'top', horizontal: 'right' },
        });
      }

      if (response.status === 200) {
        setLoggedIn(true);
        setUser(response.data.username);
        setUserId(response.data.id);
        setUserRole(response.data.authorities[0].authority);
        setUserDomainType(response.data.domainType);

        localStorage.setItem('loggedIn', JSON.stringify(true));
        localStorage.setItem('user', JSON.stringify(response.data.username));
        localStorage.setItem('userId', JSON.stringify(response.data.id));
        localStorage.setItem('jwtToken', JSON.stringify(response.data.jwtToken));
        localStorage.setItem('userRole', JSON.stringify(response.data.authorities[0].authority));
        localStorage.setItem('userDomainType', JSON.stringify(response.data.domainType));

        // localStorage.setItem("user", JSON.stringify(response.data));
        navigate('/home', { replace: true });
      }
      // }
    } catch (error) {
      enqueueSnackbar(`${error.data.message}`, {
        variant: 'error',
        autoHideDuration: 3000,
        anchorOrigin: { vertical: 'top', horizontal: 'right' },
      });

      setloading(false);
    }
    setloading(false);
  };

  const handleShowPassword = () => {
    setShowPassword((show) => !show);
  };

  return (
    <FormikProvider value={formik}>
      <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
        <Stack spacing={3}>
          <TextField
            fullWidth
            autoComplete="username"
            type="text"
            label="Username"
            {...getFieldProps('username')}
            error={Boolean(touched.username && errors.username)}
            helperText={touched.username && errors.username}
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
                  <IconButton onClick={handleShowPassword} edge="end">
                    <Iconify icon={showPassword ? 'eva:eye-fill' : 'eva:eye-off-fill'} />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            error={Boolean(touched.password && errors.password)}
            helperText={touched.password && errors.password}
          />
        </Stack>

        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ my: 2 }}>
          <FormControlLabel
            control={<Checkbox {...getFieldProps('remember')} checked={values.remember} />}
            label="Remember me"
          />

          <Link component={RouterLink} variant="subtitle2" to="#" underline="hover">
            Forgot password?
          </Link>
        </Stack>

        {loading && <Spin tip="loading" />}
        {!loading && (
          <LoadingButton fullWidth size="large" type="submit" variant="contained">
            Login
          </LoadingButton>
        )}
      </Form>
    </FormikProvider>
  );
}
