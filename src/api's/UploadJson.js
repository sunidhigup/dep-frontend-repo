import axios from 'axios';
import BASEURL from '../BaseUrl';
import { logoutApi } from './AuthApi';

export const uploadJsonFile = async (formData, path, client_id) => {
  try {
    const parseToken = JSON.parse(localStorage.getItem('jwtToken'));
    // return await axios.post(`${BASEURL}/table-rule/upload-json`, data, {
    //   headers: { Authorization: `Bearer ${parseToken}` },
    // });

    return await axios.post(`${BASEURL}/table-rule/upload-json`, formData, {
      params: {
        path,
        client_id,
      },
      headers: { Authorization: `Bearer ${parseToken}` },
    });
  } catch (error) {
    if (error.response.status === 403) {
      await logoutApi();
    }
  }
};

export const uploadJson = async (formData, path, client_id, batchname, tablename) => {
  try {
    const parseToken = JSON.parse(localStorage.getItem('jwtToken'));
    // return await axios.post(`${BASEURL}/table-rule/upload-json`, data, {
    //   headers: { Authorization: `Bearer ${parseToken}` },
    // });

    return await axios.post(`${BASEURL}/table-rule/upload-json-and-store`, formData, {
      params: {
        client_id,
        batchname,
        tablename,
        path,
      },
      headers: { Authorization: `Bearer ${parseToken}` },
    });
  } catch (error) {
    if (error.response.status === 403) {
      await logoutApi();
    }
  }
};
