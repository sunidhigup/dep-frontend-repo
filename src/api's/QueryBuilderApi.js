import axios from 'axios';
import BASEURL from '../BaseUrl';

const parseToken = JSON.parse(localStorage.getItem('jwtToken'));

export const getDatabases = async () => {
  try {
    // return await axios.get(`${BASEURL}/glew/get-databases`, {
    //   withCredentials: true,
    // });

    const parseToken = JSON.parse(localStorage.getItem('jwtToken'));
    return await axios.get(`${BASEURL}/glew/get-databases`, { headers: { Authorization: `Bearer ${parseToken}` } });
  } catch (error) {
    if (error.response.status === 401) {
      throw error.response;
    }
  }
};

export const getTables = async (dbname) => {
  try {
    // return await axios.get(`${BASEURL}/glew/get-tables`, {
    //   withCredentials: true,
    // });

    const parseToken = JSON.parse(localStorage.getItem('jwtToken'));
    return await axios.get(`${BASEURL}/glew/get-tables`, {
      params: { dbName: dbname },
      headers: { Authorization: `Bearer ${parseToken}` },
    });
  } catch (error) {
    if (error.response.status === 401) {
      throw error.response;
    }
  }
};

export const runSqlQuery = async (query) => {
  try {
    // return await axios.get(`${BASEURL}/glew/get-tables`, {
    //   withCredentials: true,
    // });

    const parseToken = JSON.parse(localStorage.getItem('jwtToken'));
    return await axios.get(`${BASEURL}/glew/runSqlQuery`, {
      params: { query },
      headers: { Authorization: `Bearer ${parseToken}` },
    });
  } catch (error) {
    if (error.response.status === 401) {
      throw error.response;
    }
  }
};
