import axios from 'axios';
import BASEURL from '../BaseUrl';
import { logoutApi } from './AuthApi';

export const getAllBatchApi = async () => {
  try {
    // return await axios(`${BASEURL}/batch/get-batch${clientId}`, {
    //   withCredentials: true,
    // });
    const parseToken = JSON.parse(localStorage.getItem('jwtToken'));
    return await axios.get(`${BASEURL}/batch/get-all-batch`, {
      headers: { Authorization: `Bearer ${parseToken}` },
    });
  } catch (error) {
    if (error.response.status === 401) {
      await logoutApi();
    }

    throw error;
  }
};

export const getBatchApi = async (clientId) => {
  try {
    // return await axios(`${BASEURL}/batch/get-batch${clientId}`, {
    //   withCredentials: true,
    // });
    const parseToken = JSON.parse(localStorage.getItem('jwtToken'));
    return await axios.get(`${BASEURL}/batch/get-batch/${clientId}`, {
      headers: { Authorization: `Bearer ${parseToken}` },
    });
  } catch (error) {
    if (error.response.status === 401) {
      await logoutApi();
    }

    throw error;
  }
};

export const getApprovedBatchApi = async (client_id) => {
  try {
    // return await axios(`${BASEURL}/batch/get-batch${clientId}`, {
    //   withCredentials: true,
    // });
    const parseToken = JSON.parse(localStorage.getItem('jwtToken'));
    return await axios.get(`${BASEURL}/batch/get-approved-Batch`, {
      params: { client_id },
      headers: { Authorization: `Bearer ${parseToken}` },
    });
  } catch (error) {
    if (error.response.status === 401) {
      await logoutApi();
    }

    throw error;
  }
};

export const updateBatchStatusApi = async (data) => {
  try {
    // return await axios(`${BASEURL}/batch/get-batch${clientId}`, {
    //   withCredentials: true,
    // });
    const parseToken = JSON.parse(localStorage.getItem('jwtToken'));

    return await axios.put(`${BASEURL}/batch/update-batch-detail`, data, {
      headers: { Authorization: `Bearer ${parseToken}` },
    });
  } catch (error) {
    if (error.response.status === 401) {
      await logoutApi();
    }

    throw error;
  }
};

export const createBatchApi = async (data) => {
  try {
    const parseToken = JSON.parse(localStorage.getItem('jwtToken'));
    return await axios.post(`${BASEURL}/batch/add-batch`, data, { headers: { Authorization: `Bearer ${parseToken}` } });
    // return await axios.post(`${BASEURL}/batch/add-batch`, data, {
    //   withCredentials: true,
    // });
  } catch (error) {
    if (error.response.status === 401) {
      await logoutApi();
    }

    throw error;
  }
};

export const runWholeBatchApi = async (data) => {
  try {
    // return await axios.get(`${BASEURL}/batch/execute-step-function/${data.batch}/${data.batch_id}/${data.client_id}/${data.execution_id}`, {
    //   withCredentials: true,
    // });

    const parseToken = JSON.parse(localStorage.getItem('jwtToken'));
    return await axios.get(
      `${BASEURL}/batch/execute-step-function/${data.batch}/${data.batch_id}/${data.client_id}/${data.execution_id}`,
      { headers: { Authorization: `Bearer ${parseToken}` } }
    );
  } catch (error) {
    if (error.response.status === 401) {
      await logoutApi();
    }

    throw error;
  }
};

export const createBatchidApi = async (data) => {
  try {
    // return await axios.post(`${BASEURL}/batch_id/create`, data, {
    //   withCredentials: true,
    // });
    const parseToken = JSON.parse(localStorage.getItem('jwtToken'));
    return await axios.post(`${BASEURL}/batch_id/create`, data, { headers: { Authorization: `Bearer ${parseToken}` } });
  } catch (error) {
    if (error.response.status === 401) {
      await logoutApi();
    }

    throw error;
  }
};

export const fetchBatchidApi = async (batchID) => {
  try {
    // return await axios.get(`${BASEURL}/batch_id/fetch/${batchID}`, {
    //   withCredentials: true,
    // });
    const parseToken = JSON.parse(localStorage.getItem('jwtToken'));
    return await axios.get(`${BASEURL}/batch_id/fetch/${batchID}`, {
      headers: { Authorization: `Bearer ${parseToken}` },
    });
  } catch (error) {
    if (error.response.status === 401) {
      await logoutApi();
    }

    throw error;
  }
};

export const getStepfunctionStatusApi = async (data, source) => {
  try {
    // return await axios.post(`${BASEURL}/batch/get-status/${source}`, data, {
    //   withCredentials: true,
    // });
    const parseToken = JSON.parse(localStorage.getItem('jwtToken'));
    return await axios.post(`${BASEURL}/batch/get-status/${source}`, data, {
      headers: { Authorization: `Bearer ${parseToken}` },
    });
  } catch (error) {
    if (error.response.status === 401) {
      await logoutApi();
    }

    throw error;
  }
};

export const deleteBatchApi = async (batch_id) => {
  try {
    const parseToken = JSON.parse(localStorage.getItem('jwtToken'));
    return await axios.delete(`${BASEURL}/batch/delete-batch-detail`, {
      params: { batch_id },
      headers: { Authorization: `Bearer ${parseToken}` },
    });
  } catch (error) {
    if (error.response.status === 401) {
      await logoutApi();
    }

    throw error;
  }
};
