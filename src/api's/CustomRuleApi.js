import axios from 'axios';
import BASEURL from '../BaseUrl';
import { logoutApi } from './AuthApi';

// fetch rule by fieldtype
export const getRuleByTypeApi = async (value) => {
  try {
    // return await axios.get(`${BASEURL}/custom-rule/get-rule-by-type/${value}`, {
    //   withCredentials: true,
    // });
    const parseToken = JSON.parse(localStorage.getItem('jwtToken'));
    return await axios.get(`${BASEURL}/custom-rule/get-rule-by-type/${value}`, {
      headers: { Authorization: `Bearer ${parseToken}` },
    });
  } catch (error) {
    if (error.response.status === 401) {
      await logoutApi();
    }

    throw error;
  }
};

export const getArgsByRulenameApi = async (value) => {
  try {
    // return await axios.get(
    //   `${BASEURL}/custom-rule/get-args-by-rulename/${value}`, {
    //   withCredentials: true,
    // });

    const parseToken = JSON.parse(localStorage.getItem('jwtToken'));
    return await axios.get(`${BASEURL}/custom-rule/get-args-by-rulename/${value}`, {
      headers: { Authorization: `Bearer ${parseToken}` },
    });
  } catch (error) {
    if (error.response.status === 401) {
      await logoutApi();
    }

    throw error;
  }
};

export const updateCustomRuleApi = async (data) => {
  try {
    // return await axios.put(
    //   `${BASEURL}/custom-rule/update-rule`,
    //   data, {
    //   withCredentials: true,
    // });

    const parseToken = JSON.parse(localStorage.getItem('jwtToken'));
    return await axios.put(`${BASEURL}/custom-rule/update-rule`, data, {
      headers: { Authorization: `Bearer ${parseToken}` },
    });
  } catch (error) {
    if (error.response.status === 401) {
      await logoutApi();
    }

    throw error;
  }
};

export const createCustomRuleApi = async (data) => {
  try {
    // return await axios.post(
    //   `${BASEURL}/custom-rule/create-rule`,
    //   data , {
    //   withCredentials: true,
    // });
    const parseToken = JSON.parse(localStorage.getItem('jwtToken'));
    return await axios.post(`${BASEURL}/custom-rule/create-rule`, data, {
      headers: { Authorization: `Bearer ${parseToken}` },
    });
  } catch (error) {
    if (error.response.status === 401) {
      await logoutApi();
    }

    throw error;
  }
};

export const getCustomRuleApi = async (client_id, batch_id) => {
  try {
    // return await axios.get(
    //   `${BASEURL}/custom-rule/get-rules/${client_id}` , {
    //   withCredentials: true,
    // });
    const parseToken = JSON.parse(localStorage.getItem('jwtToken'));
    return await axios.get(`${BASEURL}/custom-rule/get-rules/${client_id}/${batch_id}`, {
      headers: { Authorization: `Bearer ${parseToken}` },
    });
  } catch (error) {
    if (error.response.status === 401) {
      await logoutApi();
    }

    throw error;
  }
};

export const deleteCustomRuleApi = async (id) => {
  try {
    // return await axios.delete(`${BASEURL}/custom-rule/delete/${id}`, {
    //   withCredentials: true,
    // });
    const parseToken = JSON.parse(localStorage.getItem('jwtToken'));
    return await axios.delete(`${BASEURL}/custom-rule/delete/${id}`, {
      headers: { Authorization: `Bearer ${parseToken}` },
    });
  } catch (error) {
    if (error.response.status === 401) {
      await logoutApi();
    }

    throw error;
  }
};

export const getCustomRuleByRulenameApi = async (client_id, batch_id, ruleName) => {
  try {
    const parseToken = JSON.parse(localStorage.getItem('jwtToken'));
    return axios.get(`${BASEURL}/custom-rule/get-rule-by-rulename/${client_id}/${batch_id}/${ruleName}`, {
      headers: { Authorization: `Bearer ${parseToken}` },
    });
  } catch (error) {
    if (error.response.status === 401) {
      await logoutApi();
    }

    throw error;
  }
};

export const getCustomRuleByClientId = async (client_id) => {
  try {
    const parseToken = JSON.parse(localStorage.getItem('jwtToken'));
    return await axios.get(`${BASEURL}/custom-rule/get-by-client-id/${client_id}`, {
      headers: { Authorization: `Bearer ${parseToken}` },
    });
  } catch (error) {
    if (error.response.status === 401) {
      await logoutApi();
    }

    throw error;
  }
};

export const getAllCustomRule = async () => {
  try {
    const parseToken = JSON.parse(localStorage.getItem('jwtToken'));
    return await axios.get(`${BASEURL}/custom-rule/get-all-custom-rule`, {
      headers: { Authorization: `Bearer ${parseToken}` },
    });
  } catch (error) {
    if (error.response.status === 401) {
      await logoutApi();
    }

    throw error;
  }
};
