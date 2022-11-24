import axios from 'axios';
import BASEURL from '../BaseUrl';

const parseToken = JSON.parse(localStorage.getItem('jwtToken'));

export const signupApi = async (formField) => {
  try {
    return await axios.post(`${BASEURL}/user/signup-user`, formField, {
      withCredentials: true,
    });
  } catch (error) {
    if (error.response.status === 403) {
      throw error.response;
    }
  }
};

export const verifyUserApi = async (formField) => {
  try {
    return await axios.post(`${BASEURL}/user/verify-user`, formField, {
      withCredentials: true,
    });
  } catch (error) {
    if (error.response.status === 403) {
      throw error.response;
    }
  }
};

export const loginApi = async (formField) => {
  try {
    return await axios.post(`${BASEURL}/user/signin-user`, formField, {
      withCredentials: true,
    });
  } catch (error) {
    if (error.response.status === 403) {
      throw error.response;
    }
  }
};

export const logoutApi = async () => {
  try {
    // const response = await axios.post(`${BASEURL}/user/logout`, {
    //   withCredentials: true,
    // });

    localStorage.removeItem('loggedIn');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    localStorage.removeItem('jwtToken');
    window.location.replace('/login');

    // return response;
  } catch (error) {
    if (error.response.status === 403) {
      throw error.response;
    }
  }
};
