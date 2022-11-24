import axios from 'axios';
import BASEURL from '../BaseUrl';
import { logoutApi } from './AuthApi';

export const getMDMEntityEdge = async (entityName) => {
  try {
    const parseToken = JSON.parse(localStorage.getItem('jwtToken'));

    return await axios.get(`${BASEURL}/mdm/get-edges/${entityName}`, {
      headers: { Authorization: `Bearer ${parseToken}` },
    });
  } catch (error) {
    if (error.response.status === 401) {
      //  await logoutApi();
    }

    throw error;
  }
};

export const addMDMEntityEdge = async (edge) => {
  try {
    const parseToken = JSON.parse(localStorage.getItem('jwtToken'));

    return await axios.post(`${BASEURL}/mdm/add-edges`, edge, {
      headers: { Authorization: `Bearer ${parseToken}` },
    });
  } catch (error) {
    if (error.response.status === 401) {
      await logoutApi();
    }

    throw error;
  }
};

export const getMDMEntityNode = async (entityName) => {
  try {
    const parseToken = JSON.parse(localStorage.getItem('jwtToken'));

    return await axios.get(`${BASEURL}/mdm/get-nodes/${entityName}`, {
      headers: { Authorization: `Bearer ${parseToken}` },
    });
  } catch (error) {
    if (error.response.status === 401) {
      //  await logoutApi();
    }

    throw error;
  }
};

export const addMDMEntityNode = async (node) => {
  try {
    const parseToken = JSON.parse(localStorage.getItem('jwtToken'));

    return await axios.post(`${BASEURL}/mdm/add-nodes`, node, {
      headers: { Authorization: `Bearer ${parseToken}` },
    });
  } catch (error) {
    if (error.response.status === 401) {
      await logoutApi();
    }

    throw error;
  }
};

export const getMDMFlowBuilderForm = async (entityName) => {
  try {
    const parseToken = JSON.parse(localStorage.getItem('jwtToken'));

    return await axios.get(`${BASEURL}/mdm/get-form-data/${entityName}`, {
      headers: { Authorization: `Bearer ${parseToken}` },
    });
  } catch (error) {
    if (error.response.status === 401) {
      await logoutApi();
    }

    throw error;
  }
};

export const addMDMFlowBuilderForm = async (form) => {
  try {
    const parseToken = JSON.parse(localStorage.getItem('jwtToken'));

    return await axios.post(`${BASEURL}/mdm/add-form-data`, form, {
      headers: { Authorization: `Bearer ${parseToken}` },
    });
  } catch (error) {
    if (error.response.status === 401) {
      await logoutApi();
    }

    throw error;
  }
};

export const storeFlowJson = async (form, entityName) => {
  try {
    const parseToken = JSON.parse(localStorage.getItem('jwtToken'));

    return await axios.post(`${BASEURL}/mdm/flow/store-json/${entityName}`, form, {
      headers: { Authorization: `Bearer ${parseToken}` },
    });
  } catch (error) {
    if (error.response.status === 401) {
      await logoutApi();
    }

    throw error;
  }
};

export const runMdmEntity = async (entityname) => {
  try {
    const parseToken = JSON.parse(localStorage.getItem('jwtToken'));

    return await axios.get(`${BASEURL}/mdm/flow/execute-step-function/${entityname}`, {
      headers: { Authorization: `Bearer ${parseToken}` },
    });
  } catch (error) {
    if (error.response.status === 401) {
      await logoutApi();
    }

    throw error;
  }
};
