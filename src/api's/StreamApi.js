import axios from 'axios';
import BASEURL from '../BaseUrl';
import { logoutApi } from './AuthApi';

export const createStream = async (data, client_id, user_id) => {
  try {
    const parseToken = JSON.parse(localStorage.getItem('jwtToken'));
    return await axios.post(`${BASEURL}/stream/create-stream`, data, {
      params: { client_id, user_id },
      headers: {
        Authorization: `Bearer ${parseToken}`,
      },
    });
  } catch (error) {
    if (error.response.status === 401) {
      await logoutApi();
    }
    throw error;
  }
};

export const getAllDataStream = async () => {
  try {
    const parseToken = JSON.parse(localStorage.getItem('jwtToken'));
    return await axios.get(`${BASEURL}/stream/kinesis/get-all-stream`, {
      headers: { Authorization: `Bearer ${parseToken}` },
    });
  } catch (error) {
    if (error.response.status === 401) {
      await logoutApi();
    }
    throw error;
  }
};

export const fetchAllStream = async () => {
  try {
    const parseToken = JSON.parse(localStorage.getItem('jwtToken'));
    return await axios.get(`${BASEURL}/stream/get-all-stream`, { headers: { Authorization: `Bearer ${parseToken}` } });
  } catch (error) {
    if (error.response.status === 401) {
      await logoutApi();
    }
    throw error;
  }
};

export const fetchStreamByClientName = async (clientName) => {
  try {
    const parseToken = JSON.parse(localStorage.getItem('jwtToken'));
    return await axios.get(`${BASEURL}/stream/get-all-stream/${clientName}`, {
      headers: { Authorization: `Bearer ${parseToken}` },
    });
  } catch (error) {
    if (error.response.status === 401) {
      await logoutApi();
    }
    throw error;
  }
};

export const getStreamStatus = async (clientName, streamName, clusterId, clusterName) => {
  try {
    const parseToken = JSON.parse(localStorage.getItem('jwtToken'));
    return await axios.get(`${BASEURL}/stream/get-stream-status`, {
      params: {
        clientName,
        streamName,
        clusterId,
        clusterName,
      },
      headers: { Authorization: `Bearer ${parseToken}` },
    });
  } catch (error) {
    if (error.response.status === 403) {
      await logoutApi();
    }

    throw error;
  }
};

export const getStreamByStreamName = async (streamName) => {
  try {
    const parseToken = JSON.parse(localStorage.getItem('jwtToken'));
    return await axios.get(`${BASEURL}/stream/get-by-stream-name/${streamName}`, {
      headers: { Authorization: `Bearer ${parseToken}` },
    });
  } catch (error) {
    if (error.response.status === 401) {
      await logoutApi();
    }
    throw error;
  }
};

export const createNewDataStream = async (dataStream) => {
  try {
    const parseToken = JSON.parse(localStorage.getItem('jwtToken'));
    return await axios.post(`${BASEURL}/stream/new-data-stream`, dataStream, {
      headers: { Authorization: `Bearer ${parseToken}` },
    });
  } catch (error) {
    if (error.response.status === 401) {
      await logoutApi();
    }
    throw error;
  }
};
