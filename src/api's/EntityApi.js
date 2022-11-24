import { logoutApi } from './AuthApi';

const { default: axios } = require('axios');
const { default: BASEURL } = require('../BaseUrl');

export const addNewEntity = async (entity) => {
  try {
    const parseToken = JSON.parse(localStorage.getItem('jwtToken'));

    return await axios.post(`${BASEURL}/entity/create-entity`, entity, {
      headers: { Authorization: `Bearer ${parseToken}` },
    });
  } catch (error) {
    if (error.response.status === 401) {
      await logoutApi();
    }

    throw error;
  }
};

export const getAllEntity = async () => {
  try {
    const parseToken = JSON.parse(localStorage.getItem('jwtToken'));

    return await axios.get(`${BASEURL}/entity/get-all-entities`, {
      headers: { Authorization: `Bearer ${parseToken}` },
    });
  } catch (error) {
    if (error.response.status === 401) {
      await logoutApi();
    }

    throw error;
  }
};

export const getEntity = async (entityId) => {
  try {
    const parseToken = JSON.parse(localStorage.getItem('jwtToken'));

    return await axios.get(`${BASEURL}/entity/get-entity/${entityId}`, {
      headers: { Authorization: `Bearer ${parseToken}` },
    });
  } catch (error) {
    if (error.response.status === 401) {
      await logoutApi();
    }

    throw error;
  }
};

export const deleteEntity = async (entityId) => {
  try {
    const parseToken = JSON.parse(localStorage.getItem('jwtToken'));

    return await axios.delete(`${BASEURL}/entity/delete-entity/${entityId}`, {
      headers: { Authorization: `Bearer ${parseToken}` },
    });
  } catch (error) {
    if (error.response.status === 401) {
      await logoutApi();
    }

    throw error;
  }
};


export const createEntityAttribute = async (entity) => {
  try {
    const parseToken = JSON.parse(localStorage.getItem('jwtToken'));

    return await axios.post(`${BASEURL}/entity/create-entity-attribute`, entity, {
      headers: { Authorization: `Bearer ${parseToken}` },
    });
  } catch (error) {
    if (error.response.status === 401) {
      await logoutApi();
    }

    throw error;
  }
};
export const deleteEntityAttribute = async (entity) => {
  try {
    const parseToken = JSON.parse(localStorage.getItem('jwtToken'));

    return await axios.post(`${BASEURL}/entity/delete-entity-attribute`, entity, {
      headers: { Authorization: `Bearer ${parseToken}` },
    });
  } catch (error) {
    if (error.response.status === 401) {
      await logoutApi();
    }

    throw error;
  }
};