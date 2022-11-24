import axios from 'axios';
import BASEURL from '../BaseUrl';

export const getRegionSecretApi = async (infraRegion) => {
  try {
    const parseToken = JSON.parse(localStorage.getItem('jwtToken'));
    return await axios.get(`${BASEURL}/client/get-secret`, {
      params: { secretkey: infraRegion },
      headers: { Authorization: `Bearer ${parseToken}` },
    });
  } catch (error) {
    if (error.response.status === 401) {
      throw error.response;
    }
  }
};

export const getAllInfraRegions = async () => {
  try {
    const parseToken = JSON.parse(localStorage.getItem('jwtToken'));
    return await axios.get(`${BASEURL}/region/fetch-infra-region`, {
      headers: { Authorization: `Bearer ${parseToken}` },
    });
  } catch (error) {
    if (error.response.status === 401) {
      throw error.response;
    }
  }
};

export const getAllDataRegions = async () => {
  try {
    const parseToken = JSON.parse(localStorage.getItem('jwtToken'));
    return await axios.get(`${BASEURL}/region/fetch-data-region`, {
      headers: { Authorization: `Bearer ${parseToken}` },
    });
  } catch (error) {
    if (error.response.status === 401) {
      throw error.response;
    }
  }
};

// API for multitenant

export const changeRegion = async (infraRegion) => {
  try {
    const parseToken = JSON.parse(localStorage.getItem('jwtToken'));
    return await axios.get(`${BASEURL}/region/change-infra-region`, {
      params: { region: infraRegion },
      headers: { Authorization: `Bearer ${parseToken}` },
    });
  } catch (error) {
    if (error.response.status === 401) {
      throw error.response;
    }
  }
};
