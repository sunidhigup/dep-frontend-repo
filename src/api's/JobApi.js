import axios from 'axios';
import BASEURL from '../BaseUrl';
import { logoutApi } from './AuthApi';

export const createJobApi = async (data, bucket_name) => {
  try {
    // return await axios(`${BASEURL}/batch/jobs/add-job`,data, {
    //   withCredentials: true,
    // });
    const parseToken = JSON.parse(localStorage.getItem('jwtToken'));
    return await axios.post(`${BASEURL}/jobs/add-job`, data, {
      params: { bucket_name },
      headers: { Authorization: `Bearer ${parseToken}` },
    });
  } catch (error) {
    if (error.response.status === 401) {
      await logoutApi();
    }
    throw error;
  }
};
export const updateJobApi = async (data) => {
  try {
    // return await axios(`${BASEURL}/batch/jobs/add-job`,data, {
    //   withCredentials: true,
    // });
    const parseToken = JSON.parse(localStorage.getItem('jwtToken'));
    return await axios.put(`${BASEURL}/jobs/update-job-detail`, data, {
      headers: { Authorization: `Bearer ${parseToken}` },
    });
  } catch (error) {
    if (error.response.status === 401) {
      await logoutApi();
    }
    throw error;
  }
};

export const updateJobRunTypeApi = async (data) => {
  try {
    // return await axios(`${BASEURL}/batch/jobs/add-job`,data, {
    //   withCredentials: true,
    // });
    const parseToken = JSON.parse(localStorage.getItem('jwtToken'));
    return await axios.put(`${BASEURL}/jobs/update-job-run-type`, data, {
      headers: { Authorization: `Bearer ${parseToken}` },
    });
  } catch (error) {
    if (error.response.status === 401) {
      await logoutApi();
    }
    throw error;
  }
};
export const updateExtractJobApi = async (data) => {
  try {
    const parseToken = JSON.parse(localStorage.getItem('jwtToken'));
    return await axios.put(`${BASEURL}/jobs/update-extract-job`, data, {
      headers: { Authorization: `Bearer ${parseToken}` },
    });
  } catch (error) {
    if (error.response.status === 401) {
      await logoutApi();
    }
    throw error;
  }
};

export const fetchAllJobsApi = async () => {
  try {
    // return await axios(`${BASEURL}/jobs/get-jobs/${clientId}/${batchId}`, {
    //   withCredentials: true,
    // });
    const parseToken = JSON.parse(localStorage.getItem('jwtToken'));
    return await axios.get(`${BASEURL}/jobs/get-all-jobs`, {
      headers: { Authorization: `Bearer ${parseToken}` },
    });
  } catch (error) {
    if (error.response.status === 401) {
      await logoutApi();
    }
    throw error;
  }
};

export const fetchJobsApi = async (clientId, batchId) => {
  try {
    // return await axios(`${BASEURL}/jobs/get-jobs/${clientId}/${batchId}`, {
    //   withCredentials: true,
    // });
    const parseToken = JSON.parse(localStorage.getItem('jwtToken'));
    return await axios.get(`${BASEURL}/jobs/get-jobs/${clientId}/${batchId}`, {
      headers: { Authorization: `Bearer ${parseToken}` },
    });
  } catch (error) {
    if (error.response.status === 401) {
      await logoutApi();
    }
    throw error;
  }
};

export const fetchCurrentJobStatusApi = async (job_id, execution_id) => {
  try {
    // return await axios(`${BASEURL}/jobs/get-jobs/${clientId}/${batchId}`, {
    //   withCredentials: true,
    // });
    const parseToken = JSON.parse(localStorage.getItem('jwtToken'));
    return await axios.get(`${BASEURL}/jobs/get-job-status/${job_id}/${execution_id}`, {
      headers: { Authorization: `Bearer ${parseToken}` },
    });
  } catch (error) {
    if (error.response.status === 401) {
      await logoutApi();
    }
    throw error;
  }
};

export const fetchJobsAndStatusApi = async (clientId, batchId) => {
  try {
    // return await axios(`${BASEURL}/jobs/get-jobs/${clientId}/${batchId}`, {
    //   withCredentials: true,
    // });
    const parseToken = JSON.parse(localStorage.getItem('jwtToken'));
    return await axios.get(`${BASEURL}/jobs/get-all-job-and-status/${clientId}/${batchId}`, {
      headers: { Authorization: `Bearer ${parseToken}` },
    });
  } catch (error) {
    if (error.response.status === 401) {
      await logoutApi();
    }
    throw error;
  }
};

export const ApprovedfetchJobsApi = async (clientId, batchId) => {
  try {
    // return await axios(`${BASEURL}/jobs/get-jobs/${clientId}/${batchId}`, {
    //   withCredentials: true,
    // });
    const parseToken = JSON.parse(localStorage.getItem('jwtToken'));
    return await axios.get(`${BASEURL}/jobs/get-approved-jobs/${clientId}/${batchId}`, {
      headers: { Authorization: `Bearer ${parseToken}` },
    });
  } catch (error) {
    if (error.response.status === 401) {
      await logoutApi();
    }
    throw error;
  }
};

export const deleteJobApi = async (clientId, batchId, job) => {
  try {
    // return await axios(`${BASEURL}/jobs/delete-job/${clientId}/${batchId}/${job}`, {
    //   withCredentials: true,
    // });

    const parseToken = JSON.parse(localStorage.getItem('jwtToken'));
    return await axios.delete(`${BASEURL}/jobs/delete-job/${clientId}/${batchId}/${job}`, {
      headers: { Authorization: `Bearer ${parseToken}` },
    });
  } catch (error) {
    if (error.response.status === 401) {
      await logoutApi();
    }
    throw error;
  }
};

export const disableJobApi = async (clientId, batchId, job) => {
  try {
    // return await axios.put(`${BASEURL}/jobs/disable/${clientId}/${batchId}/${job}`, {
    //   withCredentials: true,
    // });
    const parseToken = JSON.parse(localStorage.getItem('jwtToken'));
    return await axios.put(
      `${BASEURL}/jobs/disable/${clientId}/${batchId}/${job}`,
      {},
      {
        headers: { Authorization: `Bearer ${parseToken}` },
      }
    );
  } catch (error) {
    if (error.response.status === 401) {
      // await logoutApi();
    }
    throw error;
  }
};

export const enableJobApi = async (clientId, batchId, job) => {
  try {
    // return await axios.put(`${BASEURL}/jobs/enable/${clientId}/${batchId}/${job}`, {
    //   withCredentials: true,
    // });
    const parseToken = JSON.parse(localStorage.getItem('jwtToken'));
    return await axios.put(
      `${BASEURL}/jobs/enable/${clientId}/${batchId}/${job}`,
      {},
      {
        headers: { Authorization: `Bearer ${parseToken}` },
      }
    );
  } catch (error) {
    if (error.response.status === 401) {
      // await logoutApi();
    }
    throw error;
  }
};

export const runJobApi = async (data) => {
  try {
    const parseToken = JSON.parse(localStorage.getItem('jwtToken'));
    const URL = `${BASEURL}/jobs/run-job/${data.batch}/${data.batch_id}/${data.client_id}/${data.client_name}/${data.execution_id}/${data.job_id}/${data.connectionType}/${data.connectionName}/${data.trackingId}`;

    return await axios.get(URL, { headers: { Authorization: `Bearer ${parseToken}` } });
  } catch (error) {
    if (error.response.status === 401) {
      await logoutApi();
    }
    throw error;
  }
};
export const copyJobApi = async (data) => {
  try {
    // return await axios.post(`${BASEURL}/jobs/copy-job`, data, {
    //   withCredentials: true,
    // });
    const parseToken = JSON.parse(localStorage.getItem('jwtToken'));
    return await axios.post(`${BASEURL}/jobs/copy-job`, data, { headers: { Authorization: `Bearer ${parseToken}` } });
  } catch (error) {
    if (error.response.status === 401) {
      await logoutApi();
    }
    throw error;
  }
};
