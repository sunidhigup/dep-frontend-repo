import axios from 'axios';
import BASEURL from '../BaseUrl';
import { logoutApi } from './AuthApi';

export const updateGlobalRuleApi = async (data) => {
  try {
    // return await axios.put(`${BASEURL}/global-rule/update-rule`,data , {
    //   withCredentials: true,
    // });

    const parseToken = JSON.parse(localStorage.getItem('jwtToken'));
    return await axios.put(`${BASEURL}/global-rule/update-rule`, data, {
      headers: { Authorization: `Bearer ${parseToken}` },
    });
  } catch (error) {
    if (error.response.status === 401) {
      await logoutApi();
    }

    throw error;
  }
};

export const createGlobalRuleApi = async (data) => {
  try {
    // return await axios.post(`${BASEURL}/global-rule/create-global-rule`, data , {
    //   withCredentials: true,
    // });

    const parseToken = JSON.parse(localStorage.getItem('jwtToken'));
    return await axios.post(`${BASEURL}/global-rule/create-global-rule`, data, {
      headers: { Authorization: `Bearer ${parseToken}` },
    });
  } catch (error) {
    if (error.response.status === 401) {
      await logoutApi();
    }

    throw error;
  }
};

export const getGlobalRuleApi = async () => {
  try {
    // return await  axios.get(`${BASEURL}/global-rule/fetch-global-rule` , {
    //   withCredentials: true,
    // });

    const parseToken = JSON.parse(localStorage.getItem('jwtToken'));
    return await axios.get(`${BASEURL}/global-rule/fetch-global-rule`, {
      headers: { Authorization: `Bearer ${parseToken}` },
    });
  } catch (error) {
    if (error.response.status === 401) {
      await logoutApi();
    }

    throw error;
  }
};

export const deleteGlobalRuleApi = async (id) => {
  try {
    // return await  axios.delete(
    //   `${BASEURL}/global-rule/delete-global-rule/${id}`, {
    //   withCredentials: true,
    // });

    const parseToken = JSON.parse(localStorage.getItem('jwtToken'));
    return await axios.delete(`${BASEURL}/global-rule/delete-global-rule/${id}`, {
      headers: { Authorization: `Bearer ${parseToken}` },
    });
  } catch (error) {
    if (error.response.status === 401) {
      await logoutApi();
    }

    throw error;
  }
};

export const getGlobalRuleByRulenameApi = async (ruleName) => {
  try {
    // return await  axios.get(
    //   `${BASEURL}/global-rule/get-rule-by-rulename/${ruleName}`, {
    //   withCredentials: true,
    // });

    const parseToken = JSON.parse(localStorage.getItem('jwtToken'));

    return await axios.get(`${BASEURL}/global-rule/get-rule-by-rulename/${ruleName}`, {
      headers: { Authorization: `Bearer ${parseToken}` },
    });
  } catch (error) {
    if (error.response.status === 401) {
      await logoutApi();
    }

    throw error;
  }
};
