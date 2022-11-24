import axios from 'axios';
import BASEURL from '../BaseUrl';
import { logoutApi } from './AuthApi';

export const createPreprocess = async (data) => {
  try {
    const parseToken = JSON.parse(localStorage.getItem('jwtToken'));
    return await axios.post(`${BASEURL}/pre-processor/add-preprocess`, data, {
      headers: { Authorization: `Bearer ${parseToken}` },
    });
  } catch (error) {
    if (error.response.status === 401) {
      await logoutApi();
    }
    throw error;
  }
};
export const updatePreprocessJob = async (data) => {
  try {
    const parseToken = JSON.parse(localStorage.getItem('jwtToken'));
    return await axios.put(`${BASEURL}/pre-processor/update-preprocess`, data, {
      headers: { Authorization: `Bearer ${parseToken}` },
    });
  } catch (error) {
    if (error.response.status === 401) {
      await logoutApi();
    }
    throw error;
  }
};

export const fetchAllPreprocess = async () => {
  try {
    const parseToken = JSON.parse(localStorage.getItem('jwtToken'));
    return await axios.get(`${BASEURL}/pre-processor/get-all-preprocessor`, {
      headers: { Authorization: `Bearer ${parseToken}` },
    });
  } catch (error) {
    if (error.response.status === 401) {
      await logoutApi();
    }
    throw error;
  }
};

export const fetchPreprocessApi = async (client_name, batch_name) => {
  try {
    // return await axios(`${BASEURL}/jobs/get-jobs/${clientId}/${batchId}`, {
    //   withCredentials: true,
    // });
    const parseToken = JSON.parse(localStorage.getItem('jwtToken'));

    return await axios.get(`${BASEURL}/pre-processor/get-preprocessor/${client_name}/${batch_name}`, {
      headers: { Authorization: `Bearer ${parseToken}` },
    });
  } catch (error) {
    if (error.response.status === 401) {
      await logoutApi();
    }
    throw error;
  }
};

export const fetchPreprocessWithStatusApi = async (client_name, batch_name) => {
  try {
    // return await axios(`${BASEURL}/jobs/get-jobs/${clientId}/${batchId}`, {
    //   withCredentials: true,
    // });
    const parseToken = JSON.parse(localStorage.getItem('jwtToken'));

    return await axios.get(
      `${BASEURL}/pre-processor/get-all-preprocessor-jobs-with-status/${client_name}/${batch_name}`,
      {
        headers: { Authorization: `Bearer ${parseToken}` },
      }
    );
  } catch (error) {
    if (error.response.status === 401) {
      await logoutApi();
    }
    throw error;
  }
};

export const executePreprocessApi = async (bucket, data_region, key) => {
  try {
    // return await axios(`${BASEURL}/jobs/get-jobs/${clientId}/${batchId}`, {
    //   withCredentials: true,
    // });
    const parseToken = JSON.parse(localStorage.getItem('jwtToken'));
    return await axios.get(`${BASEURL}/pre-processor/execute-preprocess`, {
      params: { bucket, data_region, key },
      headers: { Authorization: `Bearer ${parseToken}` },
    });
  } catch (error) {
    if (error.response.status === 401) {
      await logoutApi();
    }
    throw error;
  }
};

export const AllFoldersOfS3 = async (bucket_name, data_region_code, client_name, batch_name, table_name) => {
  try {
    // return await axios(`${BASEURL}/jobs/get-jobs/${clientId}/${batchId}`, {
    //   withCredentials: true,
    // });

    const parseToken = JSON.parse(localStorage.getItem('jwtToken'));
    return await axios.get(
      `${BASEURL}/pre-processor/get-all-s3-data-list/${bucket_name}/${data_region_code}/${client_name}/${batch_name}/${table_name}`,
      {
        headers: { Authorization: `Bearer ${parseToken}` },
      }
    );
  } catch (error) {
    if (error.response.status === 401) {
      await logoutApi();
    }
    throw error;
  }
};

export const AllFilesOfS3 = async (bucket_name, data_region_code, prefix) => {
  try {
    // return await axios(`${BASEURL}/jobs/get-jobs/${clientId}/${batchId}`, {
    //   withCredentials: true,
    // });
    const parseToken = JSON.parse(localStorage.getItem('jwtToken'));
    return await axios.get(`${BASEURL}/pre-processor/get-each-s3-data-list/${bucket_name}/${data_region_code}`, {
      params: { prefix },
      headers: { Authorization: `Bearer ${parseToken}` },
    });
  } catch (error) {
    if (error.response.status === 401) {
      await logoutApi();
    }
    throw error;
  }
};

export const AllFilesOfS3Processed = async (filePath) => {
  try {
    // return await axios(`${BASEURL}/jobs/get-jobs/${clientId}/${batchId}`, {
    //   withCredentials: true,
    // });
    const parseToken = JSON.parse(localStorage.getItem('jwtToken'));
    return await axios.get(`${BASEURL}/pre-processor/get-each-s3-data-list-processed`, {
      params: { filePath },
      headers: { Authorization: `Bearer ${parseToken}` },
    });
  } catch (error) {
    if (error.response.status === 401) {
      await logoutApi();
    }
    throw error;
  }
};

export const disablePreProcessorJob = async (data) => {
  try {
    // return await axios(`${BASEURL}/jobs/get-jobs/${clientId}/${batchId}`, {
    //   withCredentials: true,
    // });
    const parseToken = JSON.parse(localStorage.getItem('jwtToken'));
    return await axios.put(`${BASEURL}/pre-processor/disableEnablePreProcessorJob`, data, {
      headers: { Authorization: `Bearer ${parseToken}` },
    });
  } catch (error) {
    if (error.response.status === 401) {
      await logoutApi();
    }
    throw error;
  }
};

export const getTableRule = async (client_id, batchname, tablename) => {
  try {
    // return await axios(`${BASEURL}/jobs/get-jobs/${clientId}/${batchId}`, {
    //   withCredentials: true,
    // });
    const parseToken = JSON.parse(localStorage.getItem('jwtToken'));
    return await axios.get(`${BASEURL}/table-rule/get-table-rule/${client_id}/${batchname}/${tablename}`, {
      headers: { Authorization: `Bearer ${parseToken}` },
    });
  } catch (error) {
    if (error.response.status === 401) {
      await logoutApi();
    }
    throw error;
  }
};
