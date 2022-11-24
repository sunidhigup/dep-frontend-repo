import axios from 'axios';
import BASEURL from '../BaseUrl';
import { logoutApi } from './AuthApi';

export const updateClientRuleApi = async (data) => {
  try {
    // return await axios.put(`${BASEURL}/client-rule/update-rule`,data , {
    //   withCredentials: true,
    // });

    const parseToken = JSON.parse(localStorage.getItem('jwtToken'));
    return await axios.put(`${BASEURL}/client-rule/update-rule`, data, {
      headers: { Authorization: `Bearer ${parseToken}` },
    });
  } catch (error) {
    if (error.response.status === 401) {
      await logoutApi();
    }

    throw error;
  }
};

export const createClientRuleApi = async (data) => {
  try {
    // return await axios.post(`${BASEURL}/client-rule/create-client-rule`, data , {
    //   withCredentials: true,
    // });

    const parseToken = JSON.parse(localStorage.getItem('jwtToken'));
    return await axios.post(`${BASEURL}/client-rule/create-client-rule`, data, {
      headers: { Authorization: `Bearer ${parseToken}` },
    });
  } catch (error) {
    if (error.response.status === 401) {
      await logoutApi();
    }

    throw error;
  }
};

export const getClientRuleApi = async (client_id) => {
  try {
    // return await axios.get(
    //   `${BASEURL}/client-rule/fetch-client-rule/${client_id}` , {
    //   withCredentials: true,
    // });

    const parseToken = JSON.parse(localStorage.getItem('jwtToken'));
    return await axios.get(`${BASEURL}/client-rule/fetch-client-rule/${client_id}`, {
      headers: { Authorization: `Bearer ${parseToken}` },
    });
  } catch (error) {
    if (error.response.status === 401) {
      await logoutApi();
    }

    throw error;
  }
};

export const deleteClientRuleApi = async (id) => {
  try {
    // return await axios.delete(
    //   `${BASEURL}/client-rule/delete-client-rule/${id}` {
    //   withCredentials: true,
    // });

    const parseToken = JSON.parse(localStorage.getItem('jwtToken'));
    return await axios.delete(`${BASEURL}/client-rule/delete-client-rule/${id}`, {
      headers: { Authorization: `Bearer ${parseToken}` },
    });
  } catch (error) {
    if (error.response.status === 401) {
      await logoutApi();
    }

    throw error;
  }
};

export const getClientRuleByRulenameApi = async (client_id, ruleName) => {
  try {
    // return await  axios.get(
    // `${BASEURL}/client-rule/get-rule-by-rulename/${client_id}/${ruleName}`, {
    //   withCredentials: true,
    // });
    const parseToken = JSON.parse(localStorage.getItem('jwtToken'));
    return await axios.get(`${BASEURL}/client-rule/get-rule-by-rulename/${client_id}/${ruleName}`, {
      headers: { Authorization: `Bearer ${parseToken}` },
    });
  } catch (error) {
    if (error.response.status === 401) {
      await logoutApi();
    }

    throw error;
  }
};
