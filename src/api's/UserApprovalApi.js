import axios from 'axios';
import BASEURL from '../BaseUrl';

import { logoutApi } from './AuthApi';

export const getAllEmployeeDetailsApi = async () => {
  try {
    const parseToken = JSON.parse(localStorage.getItem('jwtToken'));
    return await axios.get(`${BASEURL}/employee-details/fetch-employees-details`, {
      headers: { Authorization: `Bearer ${parseToken}` },
    });
  } catch (error) {
    if (error.response.status === 401) {
      await logoutApi();
    }

    throw error;
  }
};

export const deleteEmployeeDetailApi = async (id) => {
  try {
    const parseToken = JSON.parse(localStorage.getItem('jwtToken'));
    return await axios.delete(`${BASEURL}/employee-details/delete-employee-detail/${id}`, {
      headers: { Authorization: `Bearer ${parseToken}` },
    });
  } catch (error) {
    if (error.response.status === 401) {
      await logoutApi();
    }

    throw error;
  }
};
