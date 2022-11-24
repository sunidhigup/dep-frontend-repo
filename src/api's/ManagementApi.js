import axios from 'axios';
import BASEURL from '../BaseUrl';
import { logoutApi } from './AuthApi';

export const getAllManagementDetailsApi = async () => {
  try {
    const parseToken = JSON.parse(localStorage.getItem('jwtToken'));
    return await axios.get(`${BASEURL}/management-details/fetch-management-employees-details`, {
      headers: { Authorization: `Bearer ${parseToken}` },
    });
  } catch (error) {
    if (error.response.status === 401) {
      await logoutApi();
    }

    throw error;
  }
};

export const postManagementDetailUserApi = async (newData, adminId) => {
  try {
    const parseToken = JSON.parse(localStorage.getItem('jwtToken'));
    return await axios.post(`${BASEURL}/management-details/approve-employee-detail/${adminId}`, newData, {
      headers: { Authorization: `Bearer ${parseToken}` },
    });
  } catch (error) {
    if (error.response.status === 401) {
      await logoutApi();
    }

    throw error;
  }
};
export const updateManagementDetailUserApi = async (newData) => {
  try {
    const parseToken = JSON.parse(localStorage.getItem('jwtToken'));
    return await axios.put(`${BASEURL}/management-details/update-management-employee-detail`, newData, {
      headers: { Authorization: `Bearer ${parseToken}` },
    });
  } catch (error) {
    if (error.response.status === 401) {
      await logoutApi();
    }

    throw error;
  }
};

export const deleteManagementDetailUserApi = async (id) => {
  try {
    const parseToken = JSON.parse(localStorage.getItem('jwtToken'));
    return await axios.delete(`${BASEURL}/management-details/delete-management-employee-detail/${id}`, {
      headers: { Authorization: `Bearer ${parseToken}` },
    });
  } catch (error) {
    if (error.response.status === 401) {
      await logoutApi();
    }

    throw error;
  }
};

export const getAllUsersByAdminApi = async (id) => {
  try {
    const parseToken = JSON.parse(localStorage.getItem('jwtToken'));
    return await axios.get(`${BASEURL}/management-details/get-user-by-adminId/${id}`, {
      headers: { Authorization: `Bearer ${parseToken}` },
    });
  } catch (error) {
    if (error.response.status === 401) {
      await logoutApi();
    }

    throw error;
  }
};
